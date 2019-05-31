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
  ResultsView,
  ResultsContainer,
  TableContainer,
  AnnotationView,
  ClusterContainer,
  ClusterView,
  ClusterIndex,
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

      <Route path="allresults" component={ResultsContainer}>
            <Route path={urlBase + "allresults"} component={ResultsView} ></Route>
      </Route>


      <Route path="table" component={TableContainer}>
            <Route path={urlBase + "table"} component={AnnotationView} ></Route>
      </Route>

      <Route path="clusterindex" component={ClusterContainer}>
            <Route path={urlBase + "clusterindex"} component={ClusterIndex} ></Route>
      </Route>

      <Route path="cluster" component={ClusterContainer}>
            <Route path={urlBase + "cluster"} component={ClusterView} ></Route>
      </Route>

  </Router>
)

export default routes
