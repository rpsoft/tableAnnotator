import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import { templateListSet } from '../actions/actions';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import {URL_BASE} from '../links'

import fetchData from '../network/fetch-data';

import Bootstrap from '../../assets/bootstrap.css';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import DownArrow from 'material-ui/svg-icons/navigation/arrow-drop-down';
import TextField from 'material-ui/TextField';

import SelectField from 'material-ui/SelectField';


import { push } from 'react-router-redux'

import Checkbox from 'material-ui/Checkbox';

import Annotation from './annotation'

// import style from './table.css'

var ReactDOMServer = require('react-dom/server');

var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;


class ResultsView extends Component {

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

        var results = JSON.parse(await fetch.getAllAnnotations())

        this.setState({results})

    }



   render() {

     if ( this.state.results ){
      return <div>

        <Card id="results" style={{padding:15}}>
          <div>{'"user","docid","page","corrupted","tableType","location","number","content","qualifiers"'}</div>
          <div>{

            this.state.results.rows.map( (value, i) => {

              return <div key={i}>{  '"'+value.user
                                          +'","'+value.docid
                                          +'","'+value.page
                                          +'","'+value.corrupted
                                          +'","'+value.tableType
                                          +'","'+value.location
                                          +'","'+value.number
                                          +'","'+(Object.keys(value.jsoncontent).join(';'))
                                          +'","'+(Object.keys(value.jsonqualifier).join(';'))+'"'}</div>

            } )

          }</div>
        </Card>

      </div>
    } else {
      return <div>no results</div>
    }
    }
}

const mapStateToProps = (state, ownProps) => ({
  templateList: state.templateList || null,
  // if route contains params
  params: ownProps.params,
  location: ownProps.location
})

const mapDispatchToProps = (dispatch) => ({
  setTemplateList: (templateList) => {
    dispatch(templateListSet(templateList))
  },
  goToUrl: (url) => dispatch(push(url))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResultsView);
