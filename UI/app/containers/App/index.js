/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';

import GlobalStyle from '../../global-styles';

import {
  URL_BASE,
} from '../../links'

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
} from '../../components/'

const urlBase = URL_BASE

export default function App() {
  return (
    <div>
      <Switch>
        <Route exact path={urlBase} component={AppContainer} ></Route>
        <Route path={urlBase + "table"} component={TableContainer}></Route>
        <Route path={urlBase + "allresults"} component={ResultsContainer}></Route>
        <Route path={urlBase + "cluster"} component={ClusterContainer}></Route>
        <Route path={urlBase + "clusterresults"} component={ClusterResultsContainer}></Route>
      </Switch>
      <GlobalStyle />
    </div>
  );
}
