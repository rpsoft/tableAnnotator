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
        user: "",
        table: null,
        annotations:[],
        corrupted: false,
        corrupted_text: "",
        tableType : "",
        preparingPreview : false,
        sortBy: {
          key : "row",
          dir : "asc"
        }
    };

  }

  async componentDidMount () {




    let fetch = new fetchData();
    var annotation = JSON.parse(await fetch.getAnnotationByID(this.props.location.query.docid,this.props.location.query.page,this.state.user))

    this.setState({
      user : this.state.user.length > 0 ? this.state.user : this.props.location.query.user,
      corrupted : annotation.corrupted === 'true',
      corrupted_text : annotation.corrupted_text,
      docid : (annotation || annotation.docid) || this.props.location.query.docid,
      page: annotation.page || this.props.location.query.page,
      tableType : annotation.tableType ? annotation.tableType : "",
      annotations : annotation.annotation ? annotation.annotation.annotations : []
    })

    if( !this.state.preview ){
      this.getPreview()
    }


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

          this.setState({
            table: null
          })

        let fetch = new fetchData();

        var data = await fetch.getTable(props.location.query.docid,props.location.query.page)
        //debugger
        var allInfo = JSON.parse(await fetch.getAllInfo())

        var documentData = allInfo.available_documents[props.location.query.docid]
        var current_table_g_index = documentData.abs_pos[documentData.pages.indexOf(props.location.query.page)]
        // debugger
        // this.setState({})
        this.getPreview()

        // Here
        var annotation
        if( this.state.user && this.state.user.length > 0){
          annotation = JSON.parse(await fetch.getAnnotationByID(this.props.location.query.docid,this.props.location.query.page,this.state.user))
          //debugger
        }

        if ( annotation ){
          this.setState({
            table: JSON.parse(data),
            docid : annotation.docid || this.props.location.query.docid,
            page: annotation.page || this.props.location.query.page,
            allInfo,
            gindex: current_table_g_index,
            user : this.state.user && this.state.user.length > 0 ? this.state.user : this.props.location.query.user,
            corrupted : annotation.corrupted === 'true',
            corrupted_text : annotation.corrupted_text,
            tableType : annotation.tableType ? annotation.tableType : "",
            annotations : annotation.annotation ? annotation.annotation.annotations : []
          })
        } else {
          this.setState({
            table: JSON.parse(data),
            docid : this.props.location.query.docid,
            page: this.props.location.query.page,
            allInfo,
            gindex: current_table_g_index,
            user : this.state.user && this.state.user.length > 0 ? this.state.user : this.props.location.query.user,
          })
        }


    }
   }

   // Retrieve the table given general index and number N.
   shiftTables(n){

     var documentData = this.state.allInfo.available_documents[this.state.docid]
     var current_table_g_index = documentData.abs_pos[documentData.pages.indexOf( (this.state.page || this.props.location.query.page) +"")]

     var new_index = current_table_g_index+n

      // check it is not out of bounds on the right
         new_index = new_index > this.state.allInfo.abs_index.length-1 ? this.state.allInfo.abs_index.length-1 : new_index
      //  now left
         new_index = new_index < 0 ? 0 : new_index
         // debugger

     var newDocument = this.state.allInfo.abs_index[new_index]

     this.setState({annotations:[],gindex: current_table_g_index})

     this.props.goToUrl("/?docid="+encodeURIComponent(newDocument.docid)+"&page="+newDocument.page+"&user="+this.state.user)

   }

   newAnnotation(){
     var annotations = this.state.annotations
         annotations[annotations.length] = {}

     this.setState({annotations})
   }

   removeFalseKeys(obj){

     var newObject = {}

     var keys = Object.keys(obj)

     for(var k in keys){
       var ckey = keys[k]
       if ( obj[ckey] != false ){
         newObject[ckey] = obj[ckey]
       }

     }
     return newObject
   }

   doSort(v){

     var sort_key = v
     var sort_dir = this.state.sortBy.dir

     if (this.state.sortBy.key == v){
      //  debugger
       sort_dir = sort_dir == "asc" ? "des" : "asc"
     }

     console.log(sort_key+" -- "+ sort_dir)

     this.setState(
       {
         sortBy: {
           key : sort_key,
           dir : sort_dir
         }
       }
     )
   }

   addAnnotation(i,data){

     var content = this.removeFalseKeys(data.content)
     var qualifiers = this.removeFalseKeys(data.qualifiers)

     data.content = content
     data.qualifiers = qualifiers


     var annotations = this.state.annotations
         annotations[i] = data
         // debugger
         console.log("ADDED ANNOTATION: "+JSON.stringify(annotations))
     this.setState({annotations})
   }

   deleteAnnotations(i){

     var annotations = this.state.annotations
         annotations.splice(i,1);

     this.setState({annotations})
   }

   goToGIndex(index){
     var newDocument = this.state.allInfo.abs_index[index]
     this.props.goToUrl("/?docid="+encodeURIComponent(newDocument.docid)+"&page="+newDocument.page)
   }

   // textChange(event,value) {
   //
   //
   //
   // }

   async saveAnnotations(){

    if (!this.state.user){
        alert("Specify a user before saving and try again!!")
        return
    }

    let fetch = new fetchData();
    await fetch.saveAnnotation(this.props.location.query.docid,this.props.location.query.page,this.state.user,this.state.annotations,this.state.corrupted, this.state.tableType,this.state.corrupted_text)
    alert("Annotations Saved!")

    var preview = await fetch.getAnnotationPreview(this.props.location.query.docid,this.props.location.query.page, this.state.user)
    this.setState({preview})

   }

   async getPreview(disableAlert){

     if (!this.state.user){
       if (!disableAlert){
          alert("Specify a user before Preview")
        }
         return
     }


     this.setState({preparingPreview : true})

     let fetch = new fetchData();
     var preview = JSON.parse(await fetch.getAnnotationPreview(this.props.location.query.docid,this.props.location.query.page, this.state.user))

     this.setState({preview, preparingPreview: false})

   }


   render() {

       var preparedPreview = <div>Preview not available</div>
       // if ( this.state.table ){
       //
       //   debugger
       // }
       if( this.state.preview ){
            var header = [];
            var data;
            var columns = []

            if(this.state.preview.state == "good" && this.state.preview.result.length > 0 ){
                //
                // header = <div>{
                //         Object.keys(this.state.preview.result[0]).map( (v,i) => <div key={i} style = {{display: "inline-block", marginRight:10, fontWeight:"bold"}}>{v+","}</div>)
                // }</div>
                //
                // content = <div> {
                data = this.state.preview.result.map(
                  (v,i) => {

                        var element = {}

                        for ( var n in Object.keys(v)){
                            var key_value = Object.keys(v)[n]

                            if ( key_value == "docid_page"){
                              continue
                            }

                            element[key_value] = v[key_value]+""
                            if ( columns.indexOf(key_value ) < 0 ){

                                columns.push(key_value)
                                header.push(
                                            {property: key_value,
                                              header: {
                                                label: key_value
                                              }
                                            })
                            }
                            //columns.indexOf(Object.keys(v)[n] < 0) ? columns.push(Object.keys(v)[n]) : null
                        }
                        // debugger

                        return element
                        }
                )




            }


            if ( this.state.preview.state == "good" ){

              if( this.state.preview.result.length > 0){


                      var sorting = this.state.sortBy

                      data = data.sort(function (a, b) {
                              var key = sorting.key
                              var dir = sorting.dir

                              if( key == "row" || key == "col"){
                                if ( dir == "asc" ) {
                                  return parseInt(a[key]) - parseInt(b[key]);
                                } else {
                                  return parseInt(b[key]) - parseInt(a[key]);
                                }
                              } else {
                                if ( dir == "asc" ) {
                                  return a[key].localeCompare(b[key])
                                } else {
                                  return b[key].localeCompare(a[key])
                                }
                              }

                              })




              preparedPreview =  <Table height={"300px"}>
                                  <TableHeader
                                    displaySelectAll={false}
                                    adjustForCheckbox={false}
                                    >
                                    <TableRow>
                                      {columns.map( (v,i) => <TableHeaderColumn
                                                                    key={i}
                                                                    style={{fontWeight:"bolder",color:"black",fontSize:15}}
                                                                    >
                                                                    <div onClick={ (event) => { this.doSort(v) } } > {v}<SortIcon style={{marginLeft:5,cursor:"pointer"}}></SortIcon> </div>
                                                            </TableHeaderColumn>) }
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody
                                    displayRowCheckbox={false}
                                    >
                                    {
                                      data ? data.map( (v,i) => <TableRow key={i}>
                                        {
                                          columns.map( (key,j) => <TableRowColumn key={j}>{v[key]}</TableRowColumn>)
                                        }
                                      </TableRow>) : null
                                    }
                                  </TableBody>
                                </Table>
                } else {
                  preparedPreview = <div>Table could not be reshaped. Try changing metadata, or move on</div>
                }
              } else {
                preparedPreview = <div>Table could not be reshaped. Try changing metadata, or move on</div>
              }

       }

      return <div  style={{paddingLeft:"5%",paddingRight:"5%"}} >

        <Card id="userData" style={{padding:15}}>
          <TextField
            value={this.state.user}
            hintText="Set your username here"
            onChange={(event,value) => {this.setState({user: value})}}
            style={{width:200,marginLeft:20,marginRight:20,float:"left"}}
            onKeyDown={(event, index) => {

              if (event.key === 'Enter') {
                  this.loadPageFromProps(this.props)
                  event.preventDefault();
              }
            }}
            />

          <div>{this.state.gindex+" / "+ (this.state.allInfo ? this.state.allInfo.total-1 : "")}
          <TextField
            value={this.state.currentGPage}
            hintText="Go to page"
            onChange={(event,value) => {
                                  this.setState({currentGPage: value})
                                }}
            onKeyDown={(event, index) => {
            //  debugger
              if (event.key === 'Enter') {
                  this.goToGIndex(this.state.currentGPage)
                  event.preventDefault();
              }
            }}

            style={{width:100,marginLeft:20}}

            />
            <RaisedButton style={{marginLeft:20}} onClick={ () => { this.goToGIndex(this.state.currentGPage) } }>Go!</RaisedButton>
          </div>


          <div style={{float:"right", position: "relative", top: -47}}>

                      <RaisedButton onClick={ () => {this.loadPageFromProps(this.props)} } backgroundColor={"#79b5fe"} style={{margin:1,height:45,width:210,marginRight:5,fontWeight:"bolder"}}><Refresh style={{float:"left", marginTop:10, marginLeft:10, marginRight:-12}} />Show Saved Changes</RaisedButton>
                      <RaisedButton onClick={ () => {this.shiftTables(-1)} } style={{padding:5,marginRight:5}}>Previous Table</RaisedButton>
                      <RaisedButton onClick={ () => {this.shiftTables(1)} } style={{padding:5,marginRight:5}}>Next Table</RaisedButton>


          </div>
        </Card>

        {/* <Card id="navigation" style={{textAlign:"right",padding:5,marginTop:10}}>

          <RaisedButton onClick={ () => {this.loadPageFromProps(this.props)} } backgroundColor={"#79b5fe"} style={{margin:1,height:45,width:210,marginRight:5,fontWeight:"bolder"}}><Refresh style={{float:"left", marginTop:10, marginLeft:10, marginRight:-12}} />Show Saved Changes</RaisedButton>
          <RaisedButton onClick={ () => {this.shiftTables(-1)} } style={{padding:5,marginRight:5}}>Previous Table</RaisedButton>
          <RaisedButton onClick={ () => {this.shiftTables(1)} } style={{padding:5,marginRight:5}}>Next Table</RaisedButton>;

        </Card> */}

        <Card id="tableHeader" style={{padding:15,marginTop:10, textAlign: this.state.table ? "left" : "center"}}>

            { !this.state.table ?  <Loader type="Circles" color="#00aaaa" height={150} width={150}/> : <div>
                                                                                                            <div style={{paddingBottom: 10, fontWeight:"bold",marginBottom:10}}>{"PMID: " + this.state.docid + " | " + (this.state.table.title ? this.state.table.title.title.trim() : "")}</div>
                                                                                                            {/* <div style={{marginTop:10,}}> {}</div> */}
                                                                                                            <div style={{paddingBottom: 10, fontWeight:"bold"}} dangerouslySetInnerHTML={{__html:this.state.table.htmlHeader}}></div>
                                                                                                        </div> }
        </Card>

        <Card id="tableHolder" style={{padding:15,marginTop:10, textAlign: this.state.table ? "left" : "center"}}>
            { !this.state.table ?  <Loader type="Circles" color="#00aaaa" height={150} width={150}/> : <div dangerouslySetInnerHTML={{__html:this.state.table.formattedPage}}></div> }
        </Card>

        <Card style={{padding:8,marginTop:10,fontWeight:"bold"}}>
            <div style={{width:"100%"}}>
                {/* <Checkbox
                      label={"I don’t understand how to fill out the form for this table?"}
                      labelPosition= "left"
                      checked={ this.state.corrupted }
                      onCheck={ () => {this.setState({corrupted : !this.state.corrupted})}}
                /> */}
                <table>
                  <tr>
                    <td style={{padding:"0px 0px 0px 0px", verticalAlign: "top", paddingRight:50}}>
                      <div style={{fontWeight:"bold"}}>Any comments errors or issues?</div> <TextField
                            value={this.state.corrupted_text ? this.state.corrupted_text : ""}
                            hintText="Please specify here"
                            onChange={(event,value) => {this.setState({corrupted_text: value})}}
                            style={{width:500,marginLeft:20,fontWeight:"normal"}}
                            multiLine={true}
                            rows={1}
                            rowsMax={5}
                          />
                    </td>
                    <td style={{padding:"0px 0px 0px 0px", verticalAlign: "top", paddingLeft:50}}>
                      <div style={{fontWeight:"bold"}}>Specify Table type</div> <SelectField

                           value={this.state.tableType}
                           onChange={(event,index,value) => {this.setState({tableType : value})} }

                           style={{fontWeight:"normal"}}

                         >

                           <MenuItem value={"baseline_table"} key={1} primaryText={`baseline characteristic table`} />
                           <MenuItem value={"other_table"} key={2} primaryText={`other table`} />
                           {/* <MenuItem value={"subgroup_text"} key={3} primaryText={`sub-group text`} /> */}
                           <MenuItem value={"result_table_subgroup"} key={3} primaryText={`results table with subgroups`} />
                           <MenuItem value={"result_table_without_subgroup"} key={4} primaryText={`results table without subgroups`} />

                      </SelectField>
                    </td>
                  </tr>
                </table>
            </div>
        </Card>

        <Card id="annotations" style={{padding:10,minHeight:200,paddingBottom:40,marginTop:10}}>

          <h3 style={{marginBottom:0,marginTop:0}}>Annotations

              <RaisedButton backgroundColor={"#aade94"} style={{marginLeft:10}} onClick={ () => {this.newAnnotation()} }>+ Add</RaisedButton>

          </h3>
          <hr />
          {

            this.state.annotations ? this.state.annotations.map(
              (v,i) => {
              //  debugger
                return <Annotation key={i}
                                   annotationData ={this.state.annotations[i]}
                                   addAnnotation={ (data) => {this.addAnnotation(i,data)}}
                                   deleteAnnotation = { () => {this.deleteAnnotations(i)} }
                                   />
             }
           ) : null
          }

        </Card>


        <Card style={{textAlign:"right",padding:5,marginTop:10}}><RaisedButton onClick={ () => {this.saveAnnotations()} } backgroundColor={"#ffadad"} style={{margin:1,height:45,width:150,marginRight:5,fontWeight:"bolder"}}>Save Changes!!</RaisedButton></Card>



        <Card style={{padding:10,minHeight:200,paddingBottom:40,marginTop:10}}>

        <RaisedButton onClick={ () => {this.loadPageFromProps(this.props)} } backgroundColor={"#79b5fe"} style={{margin:1,height:45,width:210,marginRight:5,float:"left",fontWeight:"bolder"}}><Refresh style={{float:"left", marginTop:10, marginLeft:10, marginRight:-12}} />Show Saved Changes</RaisedButton><br /><br />

        {/* <RaisedButton onClick={ () => {this.getPreview()} } backgroundColor={"#99b8f1"} style={{margin:1,height:45,width:150,marginRight:5,fontWeight:"bolder"}}>Update Preview</RaisedButton> */}

        <hr />
        <div>

          {
            this.state.preparingPreview ?  <Loader type="Circles" color="#00aaaa" height={150} width={150}/> :  (this.state.preview ? preparedPreview : "Save changes to see preview")
          }


        </div>


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
