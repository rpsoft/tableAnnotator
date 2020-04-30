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

import Login from '../Login'

import {
  URL_BASE,
} from '../../links'

import {
  // Core components
  AppContainer,
  CommonView,
  ResultsContainer,
  MetaContainer,
  TableContainer,
  AnnotationView,
  CuiAdminContainer,
} from '../../components/'

const urlBase = URL_BASE

export default function App() {
  return (
    <div>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/table" component={TableContainer}></Route>
        <Route path="/allresults" component={ResultsContainer}></Route>
        <Route path="/metaresults" component={MetaContainer}></Route>
        <Route path="/cuiadmin" component={CuiAdminContainer}></Route>
        <Route path="/" component={AppContainer}></Route>
      </Switch>
      <GlobalStyle />
    </div>
  );
}
