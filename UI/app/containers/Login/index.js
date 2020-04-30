/**
 *
 * Login
 *
 */

import React, { useEffect, memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { makeSelectLogin, makeLoginSelector } from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

import TextField from '@material-ui/core/TextField';

import {loginAction, loginSuccessAction, loginFailedAction, changeLoginDetailsAction} from './actions'

export function Login({
  token,
  username,
  password,
  changeLoginDetails,
}) {

  // const hey = useState(0);

  useInjectReducer({ key: 'login', reducer });
  useInjectSaga({ key: 'login', saga });
  //
  // useEffect(() => {
  //   // When initial state username is not null, submit the form to load repos
  //   if (username && username.trim().length > 0) login();
  // }, []);
  //
  // console.log("username", username)
  // console.log("token", token)
  // console.log("password", password)

  const loginProps = {
    token,
  };

  return (
    <div>
      <Helmet>
        <title>Login</title>
        <meta name="description" content="Description of Login" />
      </Helmet>

      <TextField
        id="username"
        value={username}
        placeholder="Set your username here"
        onChange={ (evt) => {changeLoginDetails(evt.currentTarget.value, password)} }
        />

      <TextField
        id="password"
        value={username}
        placeholder="Set your Password here"
        onChange={ (evt) => {changeLoginDetails(username, evt.currentTarget.value )} }
        />

      <FormattedMessage {...messages.header} />
    </div>
  );
}

Login.propTypes = {
  // dispatch: PropTypes.func.isRequired,
  token : PropTypes.string,
  username : PropTypes.string,
  password : PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  token: makeLoginSelector(),
});

function mapDispatchToProps(dispatch) {
  return {
    // dispatch,
    changeLoginDetails : () => {dispatch(changeLoginDetailsAction(username,password))},
    // doLogin : (evt) => dispatch(loginAction(evt.target.value))
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Login);
