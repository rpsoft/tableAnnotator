import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import { templateListSet } from '../actions/actions';

import Card from '@material-ui/core/Card';

import {URL_BASE} from '../links'

import fetchData from '../network/fetch-data';

import Bootstrap from '../../assets/bootstrap.css';
import RaisedButton from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import TextField from '@material-ui/core/TextField';

import SelectField from '@material-ui/core/Select';


import { push } from 'react-router-redux'

import Checkbox from '@material-ui/core/Checkbox';

import Annotation from './annotation'

// import style from './table.css'

var ReactDOMServer = require('react-dom/server');

var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;


class Landing extends Component {

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

        var results = this.state.results
        var finalResults = {}

        /**
        * There are multiple versions of the annotations. When calling reading the results from the database, here we will return only the latest/ most complete version of the annotation.
        * Independently from the author of it. Completeness here measured as the result with the highest number of annotations and the highest index number (I.e. Newest, but only if it has more information/annotations).
        * May not be the best in some cases.
        *
        */

        for ( var r in results.rows){
          var ann = results.rows[r]
          var existing = finalResults[ann.docid+"_"+ann.page]
          if ( existing ){
            if ( ann.N > existing.N && ann.annotation.annotations.length >= existing.annotation.annotations.length ){
                  finalResults[ann.docid+"_"+ann.page] = ann
            }
          } else { // Didn't exist so add it.
            finalResults[ann.docid+"_"+ann.page] = ann
          }
        }

        var finalResults_array = []
        for (  var r in finalResults ){
          var ann = finalResults[r]
          finalResults_array[finalResults_array.length] = ann
        }

        // debugger

      return <div>

        <Card id="results" style={{padding:15}}>
          <div>{'"user","docid","page","corrupted","tableType","location","number","content","qualifiers"'}</div>
          <div>{

            finalResults_array.map( (value, i) => {

              return value.annotation.annotations.map( (ann , j ) => {
                try {
                return <div key={i+"_"+j}>{  '"'+value.user
                                            +'","'+value.docid
                                            +'","'+value.page
                                            +'","'+value.corrupted
                                            +'","'+value.tableType
                                            +'","'+ann.location
                                            +'","'+ann.number
                                            +'","'+(Object.keys(ann.content).join(';'))
                                            +'","'+(Object.keys(ann.qualifiers).join(';'))+'"'}</div>
                } catch (e){
                  console.log("an empty annotation, no worries: "+JSON.stringify(ann))
                }

              } )

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
)(Landing);
