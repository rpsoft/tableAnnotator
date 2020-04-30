/*
 *
 * Login actions
 *
 */

import { DEFAULT_ACTION, LOGIN_ACTION, LOGIN_ACTION_SUCCESS, LOGIN_ACTION_FAILED, LOGIN_CHANGE_DETAILS } from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function loginAction(username, password) {
  return {
    type: LOGIN_ACTION,
    payload: {username, password}
  };
}

export function loginSuccessAction(token) {
  return {
    type: LOGIN_ACTION_SUCCESS,
    payload: token,
  };
}

export function loginFailedAction(error) {
  return {
    type: LOGIN_ACTION_FAILED,
    payload: error
  };
}

export function changeLoginDetailsAction(username, password) {
  debugger
  return {
    type: LOGIN_CHANGE_DETAILS,
    username,
    password,
  };
}
