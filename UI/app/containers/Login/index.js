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
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card'

import {loginAction, loginSuccessAction, loginFailedAction, changeLoginDetailsAction} from './actions'

export function Login({
  token,
  username,
  password,
  changeLoginDetails,
}) {

  const [user_name, setUsername] = useState("");
  const [pass_word, setPassword] = useState("");
  // const hey = useState(0);
// debugger
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
    <div style={{width:"100%", height:"100%"}}>
      <Helmet>
        <title>Login</title>
        <meta name="description" content="Description of Login" />
      </Helmet>

      <Card style={{padding:5}}>

        <TextField
          id="username"
          value={user_name}
          placeholder="Username"
          onChange={ (evt) => {setUsername(evt.currentTarget.value)} }

          />

        <br />
        <TextField
          id="password"
          value={pass_word}
          placeholder="Password"
          type="password"
          onChange={ (evt) => {setPassword(evt.currentTarget.value)} }
          />

        <br />
        <div style={{marginTop:10, marginBottom:10}} >
          <Button variant="contained" onClick={ () => { changeLoginDetails(user_name,pass_word) } } >Login</Button>
          <Button variant="contained" style={{marginLeft:5}}>Register</Button>
        </div>

        <div>name here : {user_name} {pass_word}</div>
      </Card>
    </div>
  );
}

// <FormattedMessage {...messages.header} />

Login.propTypes = {
  // dispatch: PropTypes.func.isRequired,
  token : PropTypes.string,
  username : PropTypes.string,
  password : PropTypes.string,
  changeLoginDetails : PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  token: makeLoginSelector(),
});

function mapDispatchToProps(dispatch) {
  return {
    // dispatch,
    changeLoginDetails : (username,password) => dispatch(changeLoginDetailsAction(username,password)),
    // doLogin : (evt) => dispatch(loginAction(evt.target.value))
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Login);
