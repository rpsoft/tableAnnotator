import React from 'react'
import { Router, Route, IndexRoute, IndexRedirect } from 'react-router'

/**
 * React-router components.
 *
 * React router help to render component related to the path or url.
 *
 * Please have a look to:
 * https://github.com/reactjs/react-router
 *
 */

// Please add new core components to /components/index.js

import {
  // Core components
  AppContainer,
  CommonView,
  // BrowserContainer,
  // Browse,
  // BrowseNames,
  // BrowseFilter,
  // Search,
  // Entry,
} from './components/'

import App from './App'

import {
  URL_BASE,
} from './links'

const urlBase = URL_BASE

var routes = (history) => (
  <Router history={history}>
      <Route path={"/"} component={AppContainer} >
        <IndexRoute component={CommonView} />
      </Route>
  </Router>
)

export default routes
