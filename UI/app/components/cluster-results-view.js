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


class ClusterResultsView extends Component {

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

        var results = JSON.parse(await fetch.getAllClusterAnnotations())

        this.setState({results})

    }



   render() {

     if ( this.state.results ){

      return <div><Card style={{padding:20}}>
          <div style={{display: "inline"}}>
          {
            this.state.results.fields.map( (f,i) => <div style={{display: "inline"}} key={i} > {f.name+","}</div>)
          }
          </div>

          <div>
          {
            this.state.results.rows.map( (f,i) => <div key={i} > {f.cn+","+f.concept+","+f.rep_cuis+","+f.excluded_cuis+","+f.status}</div>)
          }
          </div>
      </Card></div>
    } else {
      return <div>no results</div>
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
)(ClusterResultsView);
