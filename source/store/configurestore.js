import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from '../reducers'
import { routerMiddleware } from 'react-router-redux'

const loggerMiddleware = createLogger()

const finalCreateStore=
     compose(
      applyMiddleware(thunkMiddleware),
      applyMiddleware(loggerMiddleware)
    )(createStore)

function configureStore(history, initialState) {
    const store = finalCreateStore(rootReducer,
                                          initialState,
                                          compose(
                                            applyMiddleware(
                                              routerMiddleware(history)
                                            )
                                          ));
    return store
}

export {configureStore};
