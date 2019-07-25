import React from 'react'
import { Switch,Router, Route  } from 'react-router-dom';
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
  ClusterResultsView,
  ClusterResultsContainer,
} from './components/'

import {
  URL_BASE,
} from './links'

console.log(URL_BASE)
const urlBase = URL_BASE

var routes = (history) => (
  <Router history={history}>
    <Switch>
      <Route exact path={urlBase} component={AppContainer} ></Route>
      <Route path={urlBase + "table"} component={TableContainer}></Route>
      <Route path={urlBase + "allresults"} component={ResultsContainer}></Route>
      <Route path={urlBase + "cluster"} component={ClusterContainer}></Route>
      <Route path={urlBase + "clusterresults"} component={ClusterResultsContainer}></Route>
    </Switch>
  </Router>
)

export default routes
