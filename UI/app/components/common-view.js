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

import MultiplePopover from './MultiplePopover'

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

    var filter_topics = urlparams.get("filter_topic") ? urlparams.get("filter_topic").split("_") : []
    var filter_type = urlparams.get("filter_type") ? urlparams.get("filter_type").split("_") : []

    this.state = {
      annotations:null,
      tables:null,
      user: urlparams.get("user") && urlparams.get("user") != "undefined" ? urlparams.get("user") : "",
      tableTopic : filter_topics,
      tableType : filter_type,
    };

  }

  async componentDidMount () {
    let fetch = new fetchData();
    var annotations = JSON.parse(await fetch.getAllAnnotations())
    var tables = JSON.parse(await fetch.getAllAvailableTables())

    var allInfo = JSON.parse(await fetch.getAllInfo(this.state.tableTopic.join("_"), this.state.tableType.join("_")))

    this.setState({annotations,tables,allInfo})
  }

  // componentWillUnmount() {
  //     this._source.cancel( 'Operation canceled due component being unmounted.' )
  // }

  async componentWillReceiveProps(next) {

     var urlparams = new URLSearchParams(next.location.search);

     var filter_topic = urlparams.get("filter_topic") ? urlparams.get("filter_topic").split("_") : []
     var filter_type = urlparams.get("filter_type") ? urlparams.get("filter_type").split("_") : []

     var isNewTopic = urlparams.get("filter_topic") !== this.state.tableTopic.join("_")
     var isNewType = urlparams.get("filter_type") !== this.state.tableType.join("_")

     // debugger
     if ( !this.state.allInfo || isNewTopic || isNewType ){
       let fetch = new fetchData();
       var annotations = JSON.parse(await fetch.getAllAnnotations())
       var tables = JSON.parse(await fetch.getAllAvailableTables())

       var allInfo = JSON.parse(await fetch.getAllInfo(filter_topic.join("_"), filter_type.join("_")))

       this.setState({
           user: urlparams.get("user") && urlparams.get("user") != "undefined" ? urlparams.get("user") : "",
           tableTopic : filter_topic,
           tableType : filter_type,
           annotations,tables,allInfo
       })
     } else {
       this.setState({
           user: urlparams.get("user") ? urlparams.get("user") : "",
       })
     }
  }

  async setFilters(tableTopic, tableType){

      var ttop = Object.keys(tableTopic).reduce( (acc, item) => {if ( tableTopic[item] ){acc.push(item)} return acc},[]);
      var ttype = Object.keys(tableType).reduce( (acc, item) => {if ( tableType[item] ){acc.push(item)} return acc},[]);
      // debugger
      this.props.goToUrl("/?user="+event.currentTarget.value +"&filter_topic="+ttop.join("_")+"&filter_type="+ttype.join("_"))
  }

  formatFiltersForURL(){
      return ""
              + (this.state.tableTopic.length > 0 ? "&filter_topic="+encodeURIComponent(this.state.tableTopic.join("_")) : "")
              + (this.state.tableType.length > 0 ? "&filter_type="+encodeURIComponent(this.state.tableType.join("_")) : "")
  }

  arrayToObject (arr){
      return arr.reduce( (acc,item) => {acc[item] = true; return acc}, {})
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

          <h2 style={{marginTop:0,padding:20}}>TableTidier Prototype</h2>

        </Card>



        <Card id="userData" style={{padding:15,marginBottom:10}}>
          <TextField
            value={this.state.user}
            placeholder="Set your username here"
            onChange={(event) => {this.setState({user: event.currentTarget.value})}}
            style={{width:200,marginLeft:20,marginRight:20}}
            />
        </Card>

        {
        // <Card style={{padding:15,marginBottom:10}}>
        // <div style={{display:"inline"}}>
        //     Looking for the <div style={{fontWeight:"bolder", display:"inline"}}> term annotation tool</div>? Click on the following button --->
        // </div>
        // <div style={{width: 300,display:"inline-block", marginLeft:30}}>
        //   <RaisedButton variant={"contained"} style={{padding:10, fontWeight:"bolder", display:"inline"}} onClick={
        //     () => this.props.goToUrl("/cluster?page=0")}
        //     > Access Term Annotation Tool Here</RaisedButton>
        // </div>
        // </Card>
        }

        <Card >
            <Card><div style={{padding:10, fontWeight:"bold", fontSize:20}}>{"All tables, and annotations (Total: "+ (this.state.allInfo ? this.state.allInfo.abs_index.length : 0)+" )"}</div>

            {
              this.state.allInfo ?
                <div style={{display:"inline"}}>
                  {
                    // <SelectField
                    //      value={this.state.filter}
                    //      onChange={(event,data) => {this.props.goToUrl("/?user="+this.state.user+"&filter="+data.props.value) } }
                    //      style={{fontWeight:"normal"}}
                    //    >
                    //    <MenuItem value={"nofilter"} >{"Select Filter"}</MenuItem>
                    //    {
                    //      this.state.allInfo.msh_categories.allcats.sort().map( (cat,i) => <MenuItem value={cat} key={i+"-"+cat}>{cat}</MenuItem>)
                    //    }
                    // </SelectField>
                  }
                    <div style={{margin:15}}>
                      <MultiplePopover
                                     value={this.arrayToObject(this.state.tableTopic)}
                                     variable={"Table Topic"}
                                     options={this.state.allInfo.msh_categories.allcats.sort()}
                                     updateAnnotation={ (values) => { this.setFilters(values, this.arrayToObject(this.state.tableType)) } }
                              />
                      <MultiplePopover
                                     value={this.arrayToObject(this.state.tableType)}
                                     variable={"Table Types"}
                                     options={["Baseline Characteristics", "Results with subgroups", "Results without subgroups", "Other", "Unassigned"]}
                                     updateAnnotation={ (values) => { this.setFilters(this.arrayToObject(this.state.tableTopic), values) } }
                              />
                    </div>

                </div> : ""
            }

            </Card>

            <div style={{height:"80vh",overflowY:"scroll", paddingTop:10, padding:20, marginTop: 1}}>{this.state.tables && this.state.allInfo ?
                (
                    this.state.allInfo.abs_index.length > 0 ? this.state.allInfo.abs_index.map(
                      (v,i) => <div key={v.docid+"_"+v.page}>
                            <div style={{display:"inline",fontWeight:"bold"}}>{v.docid+"_"+v.page +" : "}</div>
                            {
                              (annotations_formatted[v.docid+"_"+v.page]
                              ? annotations_formatted[v.docid+"_"+v.page].map( (u,l) => {
                                return <a key={u+"-"+l} style={{cursor: "pointer", marginLeft:10, fontStyle: "italic", marginLeft: 10, textDecoration: "underline", color: "blue"}}
                                  onClick={
                                    () => this.props.goToUrl("table?docid="+encodeURIComponent(v.docid)+"&page="+v.page+"&user="+u+this.formatFiltersForURL())}
                                        >{u+","}</a>})
                              : "")
                            }
                            <a style={{cursor: "pointer", marginLeft:10, fontStyle: "italic", marginLeft: 10, textDecoration: "underline", color: "blue"}}
                              onClick={
                                () => this.props.goToUrl("table?docid="+encodeURIComponent(v.docid)+"&page="+v.page+(this.state.user ? "&user="+this.state.user : "")+this.formatFiltersForURL())}
                                >
                              [New]
                            </a>
                            {  corrupted_texts[v.docid+"_"+v.page] ? <div style={{display:"inline",fontWeight:"bold",paddingLeft:20}}><WarningIcon style={{marginRight:5}} />{  corrupted_texts[v.docid+"_"+v.page].replace(/(%[A-z0-9]{2})/g," ") }</div> : ""}
                         </div>

                    ) : ""
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
