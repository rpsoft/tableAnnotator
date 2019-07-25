// import React from 'react';
// import ReactDOM from 'react-dom';
//
// import { applyMiddleware, compose, createStore, combineReducers } from 'redux'
// import { Provider } from 'react-redux'
// import { createBrowserHistory } from 'history'
// import { BrowserRouter, Link, Route } from 'react-router-dom';
// import { syncHistoryWithStore, routerReducer, routerMiddleware, push  } from 'react-router-redux'
// import Routes from './routes';
//
// import templateList from './reducers/template-list';
//
// // The initial state from server-generated HTML
// // have a look to server code.
// const initialState = window.__INITIAL_STATE__ || {}
//
// const browserHistory = createBrowserHistory()
//
// // https://github.com/reactjs/react-router-redux
// const middleware = routerMiddleware(browserHistory)
//
// // // Create Redux store with initial state
// const store = createStore(
//   combineReducers({
//     routing: routerReducer,
//     templateList,
//     // task,
//   }),
//   initialState,
//   compose(
//     applyMiddleware(middleware),
//     // Redux devToolsExtension
//     window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
//   )
// )
//
// // Create an enhanced history that syncs navigation events with the store
// const history = syncHistoryWithStore(browserHistory, store)
//
// ReactDOM.render(
//   <Provider store={store}>
//     {Routes( history )}
//   </Provider>,
//   document.getElementById('root')
// );

import { AppContainer } from 'react-hot-loader/root'
import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import configureStore, { history } from './configureStore'

import Routes from './routes';

import "core-js/stable";
import "regenerator-runtime/runtime";

const store = configureStore()

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        {Routes(history)}
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  )
}

render()

// Hot reloading
if (module.hot) {
  // Reload components
  module.hot.accept('./App', () => {
    render()
  })
}
