
require('es6-promise').polyfill();
import Hapi from 'hapi';
import qs from 'query-string';
import {configureStore} from '../store/configurestore'
import React from 'react';
import serialize from 'serialize-javascript';
import {renderToString} from 'react-dom/server';
import { Provider } from 'react-redux'
import { createMemoryHistory, match, RouterContext } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import routes from '../routes'
var sprintf = require("../utils/sprintf");

const Inert = require('inert');

const server = new Hapi.Server({
  cache: [
    {
      engine: require('catbox-memory'),
      name: 'memory-cache'
    }
  ]

});
server.connection({ port: 4000 });


var plugins = [{'register':Inert}];

server.register(plugins, () => {});

const HTML = ({ content, store }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>TradePR</title>
    </head>
    <body>
      <div id="root" dangerouslySetInnerHTML={{ __html: content }}/>
      <script dangerouslySetInnerHTML={{ __html: `window.__initialState__=${serialize(store.getState())};` }}/>
      <script src="/static/tradepr.js"/>
    </body>
  </html>
)

const getMarkup = (store, renderProps) => {
  const content = renderToString(
    <Provider store={store}>
      <RouterContext {...renderProps}/>
    </Provider>
  )

  return ('<!doctype html>\n' + renderToString(<HTML content={content} store={store}/>))
};

server.route(
         {
            method: 'GET',
            path: '/favicon.ico',
            handler: function(request, reply){
               reply.file('./build/favicon.ico');
            },
            config: {
              cache: {
                expiresIn: 86400,
                privacy: 'public'
              }
            }
          }
);

server.route({
    method: 'GET',
    path: '/static/tradepr.js',
    handler: function (request, reply) {
        reply.file('./build/tradepr.js')
    }
});

const fs = require("fs");
const queryAPI = function(path, callback){
  // path in the format
  // /api/tradepr/toptrading/2015/6
  var parts = path.split("/");
  const year = parts[4];
  const month = parts[5]
  const fulldate = sprintf("%d%02d", Number(year), Number(month));

  var json_content = fs.readFileSync("build/2015-data.json");
  var api_content = JSON.parse(json_content);

  //Simulate slow API call of 1 second
  setTimeout(function(){
    callback(null, api_content[fulldate])
  }, 1000);
}

const apiCache = server.cache({
  generateFunc: queryAPI,
  expiresIn: 60*1000,
  cache: 'memory-cache',
  segment: 'API',
  generateTimeout: 60*1000
})
server.route({
    method: 'GET',
    path: '/api/{name*}',
    handler: function (request, reply) {
      const query = qs.stringify(request.query);
      const path = request.path + (query.length ? '?' + query : '');
      apiCache.get(path, (err, value, cache, report) => {
        if(err){
          throw err;
        }
        reply (value);
      })
    }
});


server.route({
    method: 'GET',
    path: '/{name*}',
    handler: function (request, reply) {

        const query = qs.stringify(request.query);
        const url = request.path + (query.length ? '?' + query : '');
        const memoryHistory = createMemoryHistory(url);
        const store = configureStore(memoryHistory);
        const history = syncHistoryWithStore(memoryHistory, store)

        var replyCalled = false;
        match({ history, routes, location: url }, (error, redirectLocation, renderProps) => {
            if (error) {
              console.log("error");// res.status(500).send(error.message)
            } else if (redirectLocation) {
              console.log("not implemented"); //res.redirect(302, redirectLocation.pathname + redirectLocation.search)
            } else if (renderProps) {
              console.log("not implemented");

              reply(getMarkup(store, renderProps));
              replyCalled = true;
            }
          })

          if(!replyCalled){
            reply(url);
            replyCalled = true;
          }
    }
});

server.start(() => {
    console.log('Server running at:', server.info.uri);
});
