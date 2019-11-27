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
import Delete from '@material-ui/icons/HighlightOff';

import SortIcon from '@material-ui/icons/Sort';
import WarningIcon from '@material-ui/icons/Warning';

import SelectField from '@material-ui/core/Select';

 import Loader from 'react-loader-spinner'

import { push } from 'connected-react-router'

import Checkbox from '@material-ui/core/Checkbox';

import Annotation from './annotation'

import MultiplePopover from './MultiplePopover'

import CommonStyles from './common-styles.css';

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
      hideUnannotated : urlparams.get("hua") ? urlparams.get("hua") == "true" : false,
      activeDelete : "",

    };

  }

  async componentDidMount () {
    let fetch = new fetchData();
    var annotations = JSON.parse(await fetch.getAllAnnotations())
    var tables = JSON.parse(await fetch.getAllAvailableTables())

    var allInfo = JSON.parse(await fetch.getAllInfo(this.state.tableTopic.join("_"), this.state.tableType.join("_"), this.state.hideUnannotated))

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

     var hua = urlparams.get("hua") ? urlparams.get("hua") == "true" : false
     var changed_hua = this.state.hideUnannotated != hua
     // debugger
     if ( !this.state.allInfo || isNewTopic || isNewType || changed_hua){
       let fetch = new fetchData();
       var annotations = JSON.parse(await fetch.getAllAnnotations())
       var tables = JSON.parse(await fetch.getAllAvailableTables())

       var allInfo = JSON.parse(await fetch.getAllInfo(filter_topic.join("_"), filter_type.join("_"), hua ))

       this.setState({
           user: urlparams.get("user") && urlparams.get("user") != "undefined" ? urlparams.get("user") : "",
           tableTopic : filter_topic,
           tableType : filter_type,
           annotations,tables,allInfo,
           hideUnannotated : hua,
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
      this.props.goToUrl("/?user="+event.currentTarget.value +"&filter_topic="+ttop.join("_")+"&filter_type="+ttype.join("_")+(this.state.hideUnannotated ? "&hua=true" : ""))
  }

  toggleHideAnnotated(){
    // debugger
      var hua = this.state.hideUnannotated ? false : true
      this.props.goToUrl("/?user="+event.currentTarget.value + this.formatFiltersForURL()+ (hua ? "&hua=true" : ""))
  }

  formatFiltersForURL(){
      return ""
              + (this.state.tableTopic.length > 0 ? "&filter_topic="+encodeURIComponent(this.state.tableTopic.join("_")) : "")
              + (this.state.tableType.length > 0 ? "&filter_type="+encodeURIComponent(this.state.tableType.join("_")) : "")
  }

  async deleteTable( docid, page ){

    let fetch = new fetchData();
    var delTable = await fetch.deleteTable(docid,page)

    var annotations = JSON.parse(await fetch.getAllAnnotations())
    var tables = JSON.parse(await fetch.getAllAvailableTables())
    var allInfo = JSON.parse(await fetch.getAllInfo(this.state.tableTopic.join("_"), this.state.tableType.join("_"), this.state.hideUnannotated))

    this.setState({annotations,tables,allInfo})
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

        <Card >
            <Card><div style={{padding:10, fontWeight:"bold", fontSize:20}}>{"All tables, and annotations (Total: "+ (this.state.allInfo ? this.state.allInfo.abs_index.length : 0)+" )"}</div>

            {
              this.state.allInfo ?
                <div style={{display:"inline"}}>
                    <div style={{margin:15, marginBottom:5}}>
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
                      <div style={{marginTop:10, marginBottom:0}}>
                           Hide Unnanotated
                           <Checkbox
                             value={"hideUnannotated"}
                             checked={ this.state.hideUnannotated }
                             onChange={ () => {this.toggleHideAnnotated()} }/>
                      </div>
                    </div>
                </div> : ""
            }

            </Card>

            <div style={{height:"72vh",overflowY:"scroll", paddingTop:10, padding:20, marginTop: 1}}>{this.state.tables && this.state.allInfo ?
                (
                    this.state.allInfo.abs_index.length > 0 ? this.state.allInfo.abs_index.map(
                      (v,i) => <div key={v.docid+"_"+v.page}>
                            <Delete className={"deleteButton"} onClick={ () => { this.setState({activeDelete: v.docid+"_"+v.page == this.state.activeDelete ? "" : v.docid+"_"+v.page })  }}></Delete>
                            { this.state.activeDelete == (v.docid+"_"+v.page) ? <div className={"delete"} style={{display:"inline"}} onClick={ () => { this.deleteTable( v.docid, v.page );} }> Delete </div> : "" }
                            <div style={{display:"inline",fontWeight:"bold"}}>{v.docid+"_"+v.page +" : "}</div>
                            {
                              (annotations_formatted[v.docid+"_"+v.page]
                              ? annotations_formatted[v.docid+"_"+v.page].map( (u,l) => {
                                return <a key={u+"-"+l} style={{cursor: "pointer", marginLeft:10, fontStyle: "italic", marginLeft: 10, textDecoration: "underline", color: "blue"}}
                                  onClick={
                                    () => this.props.goToUrl("table?docid="+encodeURIComponent(v.docid)+"&page="+v.page+"&user="+u+this.formatFiltersForURL()+(this.state.hideUnannotated ? "&hua=true" : ""))}
                                        >{u+(this.state.allInfo.labellers[v.docid+"_"+v.page] ? " ("+this.state.allInfo.labellers[v.docid+"_"+v.page]+")" : "")+", "}</a>})
                              : "")
                            }
                            <a style={{cursor: "pointer", marginLeft:10, fontStyle: "italic", marginLeft: 10, textDecoration: "underline", color: "blue"}}
                              onClick={
                                () => this.props.goToUrl("table?docid="+encodeURIComponent(v.docid)+"&page="+v.page+(this.state.user ? "&user="+this.state.user : "")+this.formatFiltersForURL()+(this.state.hideUnannotated ? "&hua=true" : ""))}
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
