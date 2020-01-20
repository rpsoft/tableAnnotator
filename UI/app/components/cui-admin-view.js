import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import Card from '@material-ui/core/Card';

import {URL_BASE} from '../links'

import fetchData from '../network/fetch-data';

//import Bootstrap from '../../assets/bootstrap.css';
import RaisedButton from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import TextField from '@material-ui/core/TextField';

import SelectField from '@material-ui/core/Select';


import { push } from 'connected-react-router'

import Checkbox from '@material-ui/core/Checkbox';

import Annotation from './annotation'


var ReactDOMServer = require('react-dom/server');

var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;


class CuiAdminView extends Component {

  constructor(props) {
    super()
    this.state = {
        table: null
    };

  }

  async componentWillReceiveProps(next) {
        this.loadPageFromProps(next)
  }

  async componentWillMount() {

      this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){

        let fetch = new fetchData();
        var cuisIndex = await fetch.getCUISIndex()

        this.setState({cuisIndex})

    }



   render() {
     if ( this.state.cuisIndex ){

      debugger

      return <div style={{paddingLeft:"5%",paddingRight:"5%"}}><Card><div style={{padding:"1%"}}>
            <h3>CUI admin</h3>
            {
              Object.keys(this.state.cuisIndex).map( (e,i) => this.state.cuisIndex[e].userDefined ? <div key={i} style={{marginBottom:5}}> { e } </div> : "")
            }

            </div></Card></div>
     } else {
       return "admin interface"
     }

   }
}

const mapStateToProps = (state, ownProps) => ({

  params: ownProps.params,
  location: ownProps.location
})

const mapDispatchToProps = (dispatch) => ({

  goToUrl: (url) => dispatch(push(url))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CuiAdminView);
