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
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import TextField from 'material-ui/TextField';

import SortIcon from 'material-ui/svg-icons/content/sort';

import SelectField from 'material-ui/SelectField';

 import Loader from 'react-loader-spinner'

import { push } from 'react-router-redux'

import Checkbox from 'material-ui/Checkbox';

import Annotation from './annotation'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

// import style from './table.css'

var ReactDOMServer = require('react-dom/server');

var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;


class CommonView extends Component {

  constructor(props) {
    super()


    this.state = {
      annotations:null,
      tables:null
    };

  }

  async componentDidMount () {

    let fetch = new fetchData();
    var annotations = JSON.parse(await fetch.getAllAnnotations())

    var tables = JSON.parse(await fetch.getAllAvailableTables())

    this.setState({annotations,tables})

  }

  async componentWillReceiveProps(next) {


  }

  async componentWillMount() {


  }

  async loadPageFromProps(props){


   }



   render() {
      var annotations = this.state.annotations ? this.state.annotations.rows : []
      var annotations_formatted = {}
          annotations.map( (v,i) => {
            if ( annotations_formatted[v.docid+"_"+v.page] ){
              annotations_formatted[v.docid+"_"+v.page].push(v.user)
            } else {
              annotations_formatted[v.docid+"_"+v.page] = [v.user]
            }
          })


      return <div  style={{paddingLeft:"5%",paddingRight:"5%"}} >
        <Card style={{marginBottom:-10}}>
          <h2 style={{marginTop:0,padding:10}}>Welcome the Subgroup Annotator!</h2>
        </Card>

        <Card >
            <Card><div style={{padding:10,fontWeight:"bold",fontSize:20}}>All tables, and annotations</div></Card>

            <div style={{height:"40vw",overflowY:"scroll", marginTop:10, padding:20}}>{this.state.tables ?
                (
                    Object.keys(this.state.tables).map(
                      (v,i) => this.state.tables[v].pages.map( (w,j) =>
                          <div key={v+"_"+w}>
                            <div style={{display:"inline",fontWeight:"bold"}}>{v+"_"+w +" : "}</div>
                            {
                              (annotations_formatted[v+"_"+w]
                              ? annotations_formatted[v+"_"+w].map( (u,l) => {return <a target={"_blank"} style={{marginLeft:10}} href={"table/?docid="+v+"&page="+w+"&user="+u}>{u+","}</a>})
                              : "")
                            }
                            <a style={{marginLeft:10}} target={"_blank"} href={"table/?docid="+v+"&page="+w}>[New]</a>
                         </div>
                      )
                    )
                ) : ""
                }</div>
        </Card>

      </div>
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
)(CommonView);
