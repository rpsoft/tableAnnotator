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
import Refresh from '@material-ui/icons/Refresh';
import TextField from '@material-ui/core/TextField';

import SortIcon from '@material-ui/icons/Sort';
import WarningIcon from '@material-ui/icons/Warning';

import SelectField from '@material-ui/core/Select';

 import Loader from 'react-loader-spinner'

import { push } from 'connected-react-router'

import Checkbox from '@material-ui/core/Checkbox';

import Annotation from './annotation'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '@material-ui/core/Table';

var ReactDOMServer = require('react-dom/server');

var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;


class CommonView extends Component {

  constructor(props) {
    super()

    var urlparams = new URLSearchParams(props.location.search);

    this.state = {
      annotations:null,
      tables:null,
      user: urlparams.get("user") ? urlparams.get("user") : "",
    };

  }

  async componentDidMount () {
    let fetch = new fetchData();
    var annotations = JSON.parse(await fetch.getAllAnnotations())
    var tables = JSON.parse(await fetch.getAllAvailableTables())
    var allInfo = JSON.parse(await fetch.getAllInfo())

    this.setState({annotations,tables,allInfo})
  }

  async componentWillReceiveProps(next) {

    var user = next.location.query ? next.location.query.user : null

   if( user != this.state.user ) {
        this.setState({user})
   }

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

      var corrupted_texts = {}

      if ( this.state.annotations ){
          this.state.annotations.rows.map( (v) => {
                    if (  v.corrupted_text != undefined && v.corrupted_text != "undefined" ) {
                      corrupted_texts[v.docid+"_"+v.page] = v.corrupted_text
                    }
                }
          )
      }

      return <div  style={{paddingLeft:"5%",paddingRight:"5%"}} >
        <Card style={{marginBottom:10}}>

          <h2 style={{marginTop:0,padding:10}}>Welcome Our Annotator!</h2>

        </Card>



        <Card id="userData" style={{padding:15,marginBottom:10}}>
          <TextField
            value={this.state.user}
            placeholder="Set your username here"
            onChange={(event) => {this.props.goToUrl("/?user="+event.currentTarget.value)}}
            style={{width:200,marginLeft:20,marginRight:20}}
            />

        </Card>

        <Card style={{padding:15,marginBottom:10}}>
        <div style={{display:"inline"}}>
            Looking for the <div style={{fontWeight:"bolder", display:"inline"}}> term annotation tool</div>? Click on the following button --->
        </div>
        <div style={{width: 300,display:"inline-block", marginLeft:30}}>
          <RaisedButton variant={"contained"} style={{padding:10, fontWeight:"bolder", display:"inline"}} onClick={
            () => this.props.goToUrl("/cluster?page=0")}
            > Access Term Annotation Tool Here</RaisedButton>
        </div>
        </Card>

        <Card >
            <Card><div style={{padding:10,fontWeight:"bold",fontSize:20}}>{"All tables, and annotations (Total: "+ (this.state.allInfo ? this.state.allInfo.abs_index.length : 0)+" )"}</div></Card>

            <div style={{height:"70vh",overflowY:"scroll", marginTop:10, padding:20,paddingTop:5}}>{this.state.tables && this.state.allInfo ?
                (
                    this.state.allInfo.abs_index.map(
                      (v,i) => <div key={v.docid+"_"+v.page}>
                            <div style={{display:"inline",fontWeight:"bold"}}>{v.docid+"_"+v.page +" : "}</div>
                            {
                              (annotations_formatted[v.docid+"_"+v.page]
                              ? annotations_formatted[v.docid+"_"+v.page].map( (u,l) => {
                                return <a key={u+"-"+l} style={{cursor: "pointer", marginLeft:10, fontStyle: "italic", marginLeft: 10, textDecoration: "underline", color: "blue"}}
                                  onClick={
                                    () => this.props.goToUrl("table?docid="+encodeURIComponent(v.docid)+"&page="+v.page+"&user="+u)}
                                        >{u+","}</a>})
                              : "")
                            }
                            <a style={{cursor: "pointer", marginLeft:10, fontStyle: "italic", marginLeft: 10, textDecoration: "underline", color: "blue"}}
                              onClick={
                                () => this.props.goToUrl("table?docid="+encodeURIComponent(v.docid)+"&page="+v.page+(this.state.user ? "&user="+this.state.user : ""))}
                                >
                              [New]
                            </a>
                            {  corrupted_texts[v.docid+"_"+v.page] ? <div style={{display:"inline",fontWeight:"bold",paddingLeft:20}}><WarningIcon style={{marginRight:5}} />{  corrupted_texts[v.docid+"_"+v.page] }</div> : ""}
                         </div>

                    )
                ) : <Loader type="Circles" color="#00aaaa" height={150} width={150}/>
                }</div>
        </Card>

      </div>
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
)(CommonView);
