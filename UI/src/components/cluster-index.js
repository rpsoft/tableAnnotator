import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { push } from 'react-router-redux'

import fetchData from '../network/fetch-data';

import {URL_BASE} from '../links'
import Card from '@material-ui/core/Card';
import Bootstrap from '../../assets/bootstrap.css';
import RaisedButton from '@material-ui/core/Button';

import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import TextField from '@material-ui/core/TextField';
import SelectField from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

// var ReactDOMServer = require('react-dom/server');
// var HtmlToReact = require('html-to-react')
// var HtmlToReactParser = require('html-to-react').Parser;


class ClusterIndex extends Component {

  constructor(props) {
    super()
    this.state = {
        table: null
    };

  }

  async componentWillReceiveProps(next) {
        // this.loadPageFromProps(next)
  }

  async componentWillMount() {
      //
      // this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){
        //
        // let fetch = new fetchData();
        //
        // var results = JSON.parse(await fetch.getAllAnnotations())
        //
        // this.setState({results})

    }



   render() {
      return <div> cluster index </div>
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
)(ClusterIndex);
