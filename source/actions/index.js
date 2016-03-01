// ******* actions.js

// { type: 'FETCH_TOPIMPORTS', date: 201501 }
// { type: 'FETCH_TOPIMPORTS_FAILURE', error: 'Oops' }
// { type: 'FETCH_TOPIMPORTS_SUCCESS', response: { ... } }

import fetch from 'isomorphic-fetch'
export const SELECT_TOPTRADING = 'SELECT_TOPTRADING'

export function selectTopTrading(date) {
  return {
    type: SELECT_TOPTRADING,
    date
  }
}

export const INVALIDATE_TOPTRADING  = 'INVALIDATE_TOPTRADING'

export function invalidateTopTrading(date) {
  return {
    type: INVALIDATE_TOPTRADING,
    date
  }
}

export const REQUEST_TOPTRADING = 'REQUEST_TOPTRADING'

export function requestTopTrading(date) {
  return {
    type: REQUEST_TOPTRADING,
    date
  }
}

export const RECEIVE_TOPTRADING = 'RECEIVE_TOPTRADING'

export function receiveTopTrading(date, json) {
  return {
    type: RECEIVE_TOPTRADING,
    date,
    trading: {
      topimports: json.topimports.map(child => child),
      topexports: json.topexports.map(child => child)
    },
    receivedAt: Date.now()
  }
}

export function fetchTopTrading(date) {

  // Thunk middleware knows how to handle functions.
  // It passes the dispatch method as an argument to the function,
  // thus making it able to dispatch actions itself.

  return function (dispatch, getState) {

    const topTradingByDate = getState().topTradingByDate[date];
    // if there is an entry in the case for the date it gets used
    // instead of refetching from the server
    if(topTradingByDate && !(topTradingByDate.isFetching) && !(topTradingByDate.didInvalidate)){
      return dispatch(selectTopTrading(date));
    }
    // First dispatch: the app state is updated to inform
    // that the API call is starting.

    dispatch(requestTopTrading(date))
    // The function called by the thunk middleware can return a value,
    // that is passed on as the return value of the dispatch method.

    // In this case, we return a promise to wait for.
    // This is not required by thunk middleware, but it is convenient for us.

    let year = date.substring(0, 4);
    let month = Number(date.substring(4));

    return fetch(`/api/tradepr/toptrading/${year}/${month}`)
      .then(response => response.json())
      .then(json =>

        // We can dispatch many times!
        // Here, we update the app state with the results of the API call.
        {
          dispatch(selectTopTrading(date));
          return dispatch(receiveTopTrading(date, json));
        }
      )

      // In a real world app, you also want to
      // catch any error in the network call.
  }
}

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}
