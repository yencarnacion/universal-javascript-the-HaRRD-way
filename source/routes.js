import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import TopTradingPage from './containers/TopTradingPage'

export default (
  <Route path="/" component={App}>
    <Route path="/:year/:month"
           component={TopTradingPage} />
  </Route>
)
