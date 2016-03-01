/// state
//
//{
//  selectedTopTrading: '201508',
//  topTradingByDate: {
//    201508: {
//      isFetching: false,
//      didInvalidate: false,
//      lastUpdated: 1439478405547,
//      items: [
//        {
//          country: 'United States',
//          su: 1829495670
//        },
//          country: 'Ireland',
//          su: 530673180
//        }
//      ]
//    }
//  }
//}


import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import {
  SELECT_TOPTRADING, INVALIDATE_TOPTRADING,
  REQUEST_TOPTRADING, RECEIVE_TOPTRADING
} from '../actions'

function selectedTopTrading(state = '', action) {
  switch (action.type) {
    case SELECT_TOPTRADING:
      return action.date
    default:
      return state
  }
}

function topTrading(state = {
  isFetching: false,
  didInvalidate: false,
  items: {topimports: [], topexports: []}
}, action) {
  switch (action.type) {
    case INVALIDATE_TOPTRADING:
      return Object.assign({}, state, {
        didInvalidate: true
      })
    case REQUEST_TOPTRADING:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      })
    case RECEIVE_TOPTRADING:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        items: action.trading,
        lastUpdated: action.receivedAt
      })
    default:
      return state
  }
}

function topTradingByDate(state = {}, action) {
  switch (action.type) {
    case INVALIDATE_TOPTRADING:
    case RECEIVE_TOPTRADING:
    case REQUEST_TOPTRADING:
      return Object.assign({}, state, {
        [action.date]: topTrading(state[action.date], action)
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  topTradingByDate,
  selectedTopTrading,
  routing: routerReducer
})

export default rootReducer
