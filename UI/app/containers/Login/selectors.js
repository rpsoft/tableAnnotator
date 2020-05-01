import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the login state domain
 */

const selectLoginDomain = state => state.login || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Login
 */
const makeSelectLogin = () =>
  createSelector(
    selectLoginDomain,
    substate => substate,
  );

const makeLoginSelector = () =>
  createSelector(
    selectLoginDomain,
    substate => substate.token,
  );

export default makeSelectLogin;
export { selectLoginDomain, makeLoginSelector, makeSelectLogin  };
