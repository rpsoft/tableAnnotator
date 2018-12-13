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
import { push } from 'react-router-redux'

import Checkbox from 'material-ui/Checkbox';

import Annotation from './annotation'

// import style from './table.css'

var ReactDOMServer = require('react-dom/server');

var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;


class CommonView extends Component {

  constructor(props) {
    super()
    this.state = {
        table: null,
        annotations:[]
    };

  }

  async componentWillReceiveProps(next) {
        this.loadPageFromProps(next)
  }

  async componentWillMount() {

      this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){

    if ( Object.keys(props.location.query).length > 0 &&
        props.location.query.docid && props.location.query.page) {


        let fetch = new fetchData();

        var data = await fetch.getTable(props.location.query.docid,props.location.query.page)
        var allInfo = JSON.parse(await fetch.getAllInfo())

        // debugger
        this.setState({table: data, docid: props.location.query.docid, page: props.location.query.page, allInfo})

    }
   }

   // Retrieve the table given general index and number N.
   shiftTables(n){

     var documentData = this.state.allInfo.available_documents[this.state.docid]
     var current_table_g_index = documentData.abs_pos[documentData.pages.indexOf(this.state.page)]

     var new_index = current_table_g_index+n

      // check it is not out of bounds on the right
         new_index = new_index > this.state.allInfo.abs_index.length-1 ? this.state.allInfo.abs_index.length-1 : new_index
      //  now left
         new_index = new_index < 0 ? 0 : new_index


     var newDocument = this.state.allInfo.abs_index[new_index]

     this.setState({annotations:[]})

     this.props.goToUrl("/?docid="+encodeURIComponent(newDocument.docid)+"&page="+newDocument.page)

   }

   newAnnotation(){
     var annotations = this.state.annotations
         annotations[annotations.length] = {}

     this.setState({annotations})
   }

   addAnnotation(i,data){

     var annotations = this.state.annotations
         annotations[i] = data

         console.log("ADDED ANNOTATION: "+JSON.stringify(annotations))
     this.setState({annotations})
   }

   deleteAnnotations(i){

     var annotations = this.state.annotations
         annotations.splice(i,1);

     this.setState({annotations})
   }

   async saveAnnotations(){
     let fetch = new fetchData();
     await fetch.saveAnnotation(this.props.location.query.docid,this.props.location.query.page,"user",this.state.annotations,this.state.corrupted)

   }

   render() {
     // <div dangerouslySetInnerHTML={ {__html:this.state.table+"<script type='text/javascript'>alert('fuck!')</script>"}} ></div>

     // var reactElement;
     //
     // if ( this.state.table ){
     //     var htmlInput = this.state.table;
     //     var htmlToReactParser = new HtmlToReactParser();
     //         reactElement = htmlToReactParser.parse(htmlInput);
     //     var reactHtml = ReactDOMServer.renderToStaticMarkup(reactElement);
     //    // debugger
     //
     //    var isValidNode = function () {
     //      return true;
     //    };
     //
     //    var processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
     //
     //    // Order matters. Instructions are processed in
     //    // the order they're defined
     //    var processingInstructions = [
     //      {
     //        // This is REQUIRED, it tells the parser
     //        // that we want to insert our React
     //        // component as a child
     //        replaceChildren: false,
     //        shouldProcessNode: function (node) {
     //
     //          return node.name === "td" ;
     //        },
     //        processNode: function (node, children, index) {
     //          // debugger
     //          return React.createElement('td', {key: index, onClick: () => {alert("BOOM") }}, children);
     //        }
     //      },
     //      {
     //        // Anything else
     //        shouldProcessNode: function (node) {
     //          return true;
     //        },
     //        processNode: processNodeDefinitions.processDefaultNode,
     //      },
     //    ];
     //
     //    reactElement = htmlToReactParser.parseWithInstructions(
     //      htmlInput, isValidNode, processingInstructions);
     //    // var reactHtml = ReactDOMServer.renderToStaticMarkup(
     //    //   reactComponent);
     //
     // }

     // var scripter = '<script src="https://code.jquery.com/jquery-1.9.1.min.js"></script><script>$( document ).ready(function() {  document.getElementsByTagName("col")[0].style.width = "200pt" });</script>'



      return <div>

        <Card id="userData" style={{padding:15}}>
          <div> User data </div>

        </Card>

        <Card id="navigation" style={{textAlign:"right",padding:5,marginTop:10}}>

          <RaisedButton onClick={ () => {this.saveAnnotations()} } backgroundColor={"#ffadad"} style={{margin:1,height:45,width:150,marginRight:5,float:"left",fontWeight:"bolder"}}>Save Changes!!</RaisedButton>

          <RaisedButton onClick={ () => {this.shiftTables(-1)} } style={{padding:5,marginRight:5}}>Previous Table</RaisedButton>
          <RaisedButton onClick={ () => {this.shiftTables(1)} } style={{padding:5,marginRight:5}}>Next Table</RaisedButton>;

        </Card>

        <Card id="tableHolder" style={{padding:15,marginTop:10}}>
            <div dangerouslySetInnerHTML={{__html:this.state.table}}></div>
        </Card>

        <Card style={{padding:8,marginTop:10,fontWeight:"bold"}}>
            <div style={{width:250}}>
                <Checkbox label={"Is the table corrupted?"}
                      labelPosition= "left"
                      checked={ this.state.corrupted }
                      onCheck={ () => {this.setState({corrupted : !this.state.corrupted})}}
                />
            </div>
        </Card>

        <Card id="annotations" style={{padding:10,minHeight:200,paddingBottom:40,marginTop:10}}>

          <h3 style={{marginBottom:0,marginTop:0}}>Annotations

              <RaisedButton backgroundColor={"#aade94"} onClick={ () => {this.newAnnotation()} }>+ Add</RaisedButton>

          </h3>

          {
            this.state.annotations.map(
              (v,i) => {
                return <Annotation key={i}
                                   annotationData ={this.state.annotations[i]}
                                   addAnnotation={ (data) => {this.addAnnotation(i,data)}}
                                   deleteAnnotation = { () => {this.deleteAnnotations(i)} }
                                   />
             }
            )
          }

        </Card>

        <Card style={{textAlign:"right",padding:5,marginTop:10}}><RaisedButton onClick={ () => {this.saveAnnotations()} } backgroundColor={"#ffadad"} style={{margin:1,height:45,width:150,marginRight:5,fontWeight:"bolder"}}>Save Changes!!</RaisedButton></Card>

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
