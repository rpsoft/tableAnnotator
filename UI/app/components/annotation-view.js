import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Link, Route } from 'react-router-dom';

// import { templateListSet } from '../actions/actions';
import QString from 'query-string';

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
import Home from '@material-ui/icons/Home';
import TextField from '@material-ui/core/Input';
// import Input from '@material-ui/core/Input';
import SortIcon from '@material-ui/icons/Sort';
import SelectField from '@material-ui/core/Select';
import Loader from 'react-loader-spinner'
import { push } from 'connected-react-router'
import Checkbox from '@material-ui/core/Checkbox';

import Annotation from './annotation'

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@material-ui/core';

var ReactDOMServer = require('react-dom/server');
var HtmlToReact = require('html-to-react')
var HtmlToReactParser = require('html-to-react').Parser;

class AnnotationView extends Component {

  constructor(props) {
    super()

    var parsed = QString.parse(props.location.search);

    this.state = {
        user: parsed.user ? parsed.user : "",
        table: null,
        annotations:[],
        corrupted: false,
        corrupted_text: "",
        tableType : "",
        preparingPreview : false,
        sortBy: {
          key : "row",
          dir : "asc"
        },
        toggeLiveResults: true,
    };
    //debugger
  }

  async componentDidMount () {
    var parsed = QString.parse(this.props.location.search);

    let fetch = new fetchData();
    var annotation = JSON.parse(await fetch.getAnnotationByID(parsed.docid,parsed.page,this.state.user))

    var all_annotations = JSON.parse(await fetch.getAllAnnotations())

    var annotations_formatted = {}
        all_annotations.rows.map( (v,i) => {
          if ( annotations_formatted[v.docid+"_"+v.page] ){
            annotations_formatted[v.docid+"_"+v.page].push(v.user)
          } else {
            annotations_formatted[v.docid+"_"+v.page] = [v.user]
          }
        })



    this.setState({
      //user : this.state.user.length > 0 ? this.state.user : this.props.location.query.user,
      corrupted : annotation.corrupted === 'true',
      corrupted_text : annotation.corrupted_text,
      docid : (annotation || annotation.docid) || parsed.docid,
      page: annotation.page || parsed.page,
      tableType : annotation.tableType ? annotation.tableType : "",
      annotations : annotation.annotation ? annotation.annotation.annotations : [],
      allAnnotations: annotations_formatted
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

    var parsed = QString.parse(props.location.search);


    if ( Object.keys(parsed).length > 0 &&
        parsed.docid && parsed.page) {

          this.setState({
            table: null
          })

        let fetch = new fetchData();

        var all_annotations = JSON.parse(await fetch.getAllAnnotations())

        //var annotations = this.state.annotations ? this.state.annotations.rows : []
        var annotations_formatted = {}
            all_annotations.rows.map( (v,i) => {
              if ( annotations_formatted[v.docid+"_"+v.page] ){
                annotations_formatted[v.docid+"_"+v.page].push(v.user)
              } else {
                annotations_formatted[v.docid+"_"+v.page] = [v.user]
              }
            })

        var data = await fetch.getTable(parsed.docid,parsed.page)
        var allInfo = JSON.parse(await fetch.getAllInfo())

        var documentData = allInfo.available_documents[parsed.docid]
        var current_table_g_index = documentData.abs_pos[documentData.pages.indexOf(parsed.page)]
        this.getPreview()

        var annotation
        if( this.state.user && this.state.user.length > 0){
          annotation = JSON.parse(await fetch.getAnnotationByID(parsed.docid,parsed.page,this.state.user))
        }

        //var user = this.state.user != props.location.query.user ? this.state.user


        if ( annotation ){
          this.setState({
            table: JSON.parse(data),
            docid : annotation.docid || parsed.docid,
            page: annotation.page || parsed.page,
            allInfo,
            gindex: current_table_g_index,
            user : parsed.user ? parsed.user : "",
            corrupted : annotation.corrupted === 'true',
            corrupted_text : annotation.corrupted_text,
            tableType : annotation.tableType ? annotation.tableType : "",
            annotations : annotation.annotation ? annotation.annotation.annotations : [],
            allAnnotations: annotations_formatted
          })
        } else {
          this.setState({
            table: JSON.parse(data),
            docid : parsed.docid,
            page: parsed.page,
            allInfo,
            gindex: current_table_g_index,
            user : parsed.user ? parsed.user : "",
            allAnnotations: annotations_formatted
          })
        }
    }
   }

   // Retrieve the table given general index and number N.
   shiftTables(n){

    var parsed = QString.parse(this.props.location.search);


     var documentData = this.state.allInfo.available_documents[this.state.docid]
     var current_table_g_index = documentData.abs_pos[documentData.pages.indexOf( (this.state.page || parsed.page) +"")]

     var new_index = current_table_g_index+n

      // check it is not out of bounds on the right
         new_index = new_index > this.state.allInfo.abs_index.length-1 ? this.state.allInfo.abs_index.length-1 : new_index
      //  now left
         new_index = new_index < 0 ? 0 : new_index

     var newDocument = this.state.allInfo.abs_index[new_index]

     this.setState({annotations:[],gindex: current_table_g_index})

     this.props.goToUrl("/table?docid="+encodeURIComponent(newDocument.docid)+"&page="+newDocument.page+"&user="+this.state.user)

   }

   newAnnotation(){
     var annotations = this.state.annotations
         annotations[annotations.length] = {}

     this.setState({annotations})
   }

   autoAdd(){

     var auto_annotations = []

     var process_auto_annotations = (annotations,loc) => {
       return Object.keys(annotations).map( (N) => {

          var current = annotations[N]

          var content = {}
          for (var n in current.descriptors ){
            content[current.descriptors[n]] = true
          }

          var qualifiers = {};

          if ( current.unique_modifier.indexOf("indent") > -1 ){ qualifiers["indented"] = true }
          if ( current.unique_modifier.indexOf("bold") > -1 ){ qualifiers["bold"] = true }
          if ( current.unique_modifier.indexOf("empty_row") > -1 ){ qualifiers["empty_row"] = true }
          if ( current.unique_modifier.indexOf("emptyTextField_row_with_p_value") > -1 ){ qualifiers["empty_row_with_p_value"] = true }
          if ( current.unique_modifier.indexOf("ital") > -1 ){ qualifiers["italic"] = true }


          return {"location": loc,"content":content,"qualifiers":qualifiers,"number":(parseInt(current.c)+1)}
       } )
     }

     // debugger
     var col_annotations = process_auto_annotations (this.state.table.predicted.cols,"Col")
     var row_annotations = process_auto_annotations (this.state.table.predicted.rows,"Row")

    this.setState({annotations : col_annotations.concat(row_annotations)})

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
     this.props.goToUrl("/table?docid="+encodeURIComponent(newDocument.docid)+"&page="+newDocument.page)
   }

   async saveAnnotations(){

    if (!this.state.user){
        alert("Specify a user before saving and try again!!")
        return
    }

    var parsed = QString.parse(this.props.location.search);



    let fetch = new fetchData();
    await fetch.saveAnnotation(parsed.docid,parsed.page,this.state.user,this.state.annotations,this.state.corrupted, this.state.tableType,this.state.corrupted_text)
    //alert("Annotations Saved!")

    var all_annotations = JSON.parse(await fetch.getAllAnnotations())

    //var annotations = this.state.annotations ? this.state.annotations.rows : []
    var annotations_formatted = {}
        all_annotations.rows.map( (v,i) => {
          if ( annotations_formatted[v.docid+"_"+v.page] ){
            annotations_formatted[v.docid+"_"+v.page].push(v.user)
          } else {
            annotations_formatted[v.docid+"_"+v.page] = [v.user]
          }
        })

    this.setState({preview,allAnnotations: {}})

    var preview = await fetch.getAnnotationPreview(parsed.docid,parsed.page, this.state.user)
    this.setState({preview,allAnnotations: annotations_formatted})

   }

   async getPreview(disableAlert){

     if (!this.state.user){
       if (!disableAlert){
          //alert("Specify a user before Preview")
        }
         return
     }

     var parsed = QString.parse(this.props.location.search);



     this.setState({preparingPreview : true})

     let fetch = new fetchData();
     var preview = JSON.parse(await fetch.getAnnotationPreview(parsed.docid,parsed.page, this.state.user))

     this.setState({preview, preparingPreview: false})

   }


   render() {

       var preparedPreview = <div>Preview not available</div>

       var previousAnnotations = <div></div>

       var parsed = QString.parse(this.props.location.search);



        if( this.state.allAnnotations && this.state.allAnnotations[parsed.docid+"_"+parsed.page] ){

          previousAnnotations = <div style={{color:"red",display:"inline"}}>
                      <div style={{display:"inline"}} >Already Annotated by: </div>
                      {
                        this.state.allAnnotations[parsed.docid+"_"+parsed.page].map(
                           (us,j) => <div
                             style={{display:"inline",cursor: "pointer", textDecoration: "underline"}}
                             key={j}
                             onClick={ () => this.props.goToUrl("/table/?docid="+encodeURIComponent(parsed.docid)+"&page="+parsed.page+"&user="+us)}
                             >{us+", "}</div>
                        )
                      }
                    </div>

        }

       if( this.state.preview ){
            var header = [];
            var data;
            var columns = []

            if(this.state.preview.state == "good" && this.state.preview.result.length > 0 ){
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
                        }
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

                              var ak = a[key] ? a[key] : ""
                              var bk = b[key] ? b[key] : ""

                              if( key == "row" || key == "col"){
                                if ( dir == "asc" ) {
                                  return parseInt(ak) - parseInt(bk);
                                } else {
                                  return parseInt(bk) - parseInt(ak);
                                }
                              } else {
                                if ( dir == "asc" ) {
                                  return ak.localeCompare(bk)
                                } else {
                                  return bk.localeCompare(ak)
                                }
                              }

                              })




              preparedPreview =  <Table height={"300px"}>
                                  <TableHeader
                                    displaySelectAll={false}
                                    adjustForCheckbox={false}
                                    >
                                    <TableRow>
                                      {columns.map( (v,i) => <TableCell
                                                                    key={i}
                                                                    style={{fontWeight:"bolder",color:"black",fontSize:15}}
                                                                    >
                                                                    <div onClick={ (event) => { this.doSort(v) } } > {v}<SortIcon style={{marginLeft:5,cursor:"pointer"}}></SortIcon> </div>
                                                            </TableCell>) }
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody
                                    displayRowCheckbox={false}
                                    >
                                    {
                                      data ? data.map( (v,i) => <TableRow key={i}>
                                        {
                                          columns.map( (key,j) => <TableCell key={j}>{v[key]}</TableCell>)
                                        }
                                      </TableRow>) : null
                                    }
                                  </TableBody>
                                </Table>
                } else {
                  preparedPreview = <div style={{marginTop:20}}>Table could not be produced. Try altering annotations, or move on</div>
                }
              } else {
                preparedPreview = <div style={{marginTop:20}}>Table could not be produced. Try altering annotations, or move on</div>
              }

       }

      return <div  style={{paddingLeft:"5%",paddingRight:"5%"}} >

        <Card id="userData" style={{padding:15}}>
          <Home style={{float:"left",height:45,width:45, cursor:"pointer"}} onClick={() => this.props.goToUrl("/"+(this.state.user ? "?user="+this.state.user : "" ))}/>

          <TextField
            value={this.state.user}
            placeholder="Set your username here"
            onChange={(event,value) => {this.setState({user: value})}}
            style={{width:200,marginLeft:20,marginRight:20,float:"left"}}
            onKeyDown={(event, index) => {

              if (event.key === 'Enter') {
                  this.shiftTables(0)
                  event.preventDefault();
              }
            }}
            />

          <div>{this.state.gindex+" / "+ (this.state.allInfo ? this.state.allInfo.total-1 : "")}
          <TextField
            value={this.state.currentGPage}
            placeholder="Go to page"
            onChange={(event,value) => {
                                  this.setState({currentGPage: value})
                                }}
            onKeyDown={(event, index) => {
              if (event.key === 'Enter') {
                  this.goToGIndex(this.state.currentGPage)
                  event.preventDefault();
              }
            }}

            style={{width:100,marginLeft:20}}

            />
            <RaisedButton variant={"contained"} style={{marginLeft:20}} onClick={ () => { this.goToGIndex(this.state.currentGPage) } }>Go!</RaisedButton>
          </div>

          <div>{previousAnnotations}</div>

          <div style={{float:"right", position: "relative", top: -45}}>

                      <RaisedButton variant={"contained"} onClick={ () => {this.loadPageFromProps(this.props)} } backgroundColor={"#79b5fe"} style={{margin:1,marginRight:5,fontWeight:"bolder"}}><Refresh />Show Saved Changes</RaisedButton>
                      <RaisedButton variant={"contained"} onClick={ () => {this.shiftTables(-1)} } style={{padding:5,marginRight:5}}>Previous Table</RaisedButton>
                      <RaisedButton variant={"contained"} onClick={ () => {this.shiftTables(1)} } style={{padding:5,marginRight:5}}>Next Table</RaisedButton>


          </div>
        </Card>

        <Card id="tableHeader" style={{padding:15,marginTop:10, textAlign: this.state.table ? "left" : "center"}}>

            { !this.state.table ?  <Loader type="Circles" color="#00aaaa" height={150} width={150}/> : <div>
                                                                                                            <div style={{paddingBottom: 10, fontWeight:"bold",marginBottom:10}}><Link to={"https://www.ncbi.nlm.nih.gov/pubmed/?term="+ this.state.docid} target="_blank">{"PMID: " + this.state.docid }</Link> { " | " + (this.state.table.title ? this.state.table.title.title.trim() : "")}</div>
                                                                                                            {/* <div style={{marginTop:10,}}> {}</div> */}
                                                                                                            <div style={{paddingBottom: 10, fontWeight:"bold"}} dangerouslySetInnerHTML={{__html:this.state.table.htmlHeader}}></div>
                                                                                                        </div> }
        </Card>

        <Card id="tableHolder" style={{padding:15,marginTop:10, textAlign: this.state.table ? "left" : "center"}}>
              {
                this.state.table ? <CKEditor
                    editor={ ClassicEditor }
                    data={this.state.table.formattedPage || ""}
                    onInit={ editor => {
                        // You can store the "editor" and use when it is needed.
                        console.log( 'Editor is ready to use!', editor );
                    } }
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        console.log( { event, editor, data } );
                    } }
                    onBlur={ editor => {
                        console.log( 'Blur.', editor );
                    } }
                    onFocus={ editor => {
                        console.log( 'Focus.', editor );
                    } }
                /> : ""
              }
            { //!this.state.table ?  <Loader type="Circles" color="#00aaaa" height={150} width={150}/> : <div dangerouslySetInnerHTML={{__html:this.state.table.formattedPage}}></div>
          }
        </Card>

        <Card style={{padding:8,marginTop:10,fontWeight:"bold"}}>
            <div style={{width:"100%"}}>

                <table>
              <tbody>
                  <tr>
                    <td style={{padding:"0px 0px 0px 0px", verticalAlign: "top", paddingRight:50}}>
                      <div style={{fontWeight:"bold"}}>Any comments errors or issues?</div> <TextField
                            value={this.state.corrupted_text && this.state.corrupted_text != 'undefined' ? this.state.corrupted_text : ""}
                            placeholder="Please specify here"
                            onChange={(event) => {this.setState({corrupted_text: event.target.value})}}
                            style={{width:500,marginLeft:20,fontWeight:"normal"}}
                            multiline={true}
                            rows={1}
                            rowsMax={5}
                          />
                    </td>
                    <td style={{padding:"0px 0px 0px 0px", verticalAlign: "top", paddingLeft:50}}>
                      <div style={{fontWeight:"bold"}}>Specify Table type</div>
                      <SelectField
                           value={this.state.tableType}
                           onChange={(event,data) => {this.setState({tableType : data.props.value})} }
                           style={{fontWeight:"normal"}}
                         >
                           <MenuItem value={"baseline_table"} key={1}>baseline characteristic table</MenuItem>
                           <MenuItem value={"other_table"} key={2}> other table </MenuItem>
                           <MenuItem value={"result_table_subgroup"} key={3}> results table with subgroups </MenuItem>
                           <MenuItem value={"result_table_without_subgroup"} key={4}> results table without subgroups </MenuItem>

                      </SelectField>
                    </td>
                  </tr>
                  </tbody>
                </table>
            </div>
        </Card>

        <Card id="annotations" style={{padding:10,minHeight:200,paddingBottom:40,marginTop:10}}>

          <h3 style={{marginBottom:0,marginTop:0}}>Annotations
              <RaisedButton variant={"contained"} backgroundColor={"#aade94"} style={{marginLeft:10}} onClick={ () => {this.newAnnotation()} }>+ Add</RaisedButton>
              <RaisedButton variant={"contained"} backgroundColor={"#58cbff"} style={{marginLeft:10,float:"right"}} onClick={ () => {this.autoAdd()} }>Auto Add</RaisedButton>
          </h3>
          <hr />
          {
            this.state.annotations ? this.state.annotations.map(
              (v,i) => {
                return <Annotation key={i}
                                   annotationData ={this.state.annotations[i]}
                                   addAnnotation={ (data) => {this.addAnnotation(i,data)}}
                                   deleteAnnotation = { () => {this.deleteAnnotations(i)} }
                                   />
             }
           ) : null
          }

        </Card>


        <Card style={{padding:5,marginTop:10,marginBottom:500}}>
          <RaisedButton variant={"contained"} onClick={ () => {this.saveAnnotations(); this.loadPageFromProps(this.props); } } backgroundColor={"#ffadad"} style={{margin:1,height:45,marginRight:5,fontWeight:"bolder"}}>Save Changes & Update!</RaisedButton>
          <RaisedButton variant={"contained"} onClick={ () => {this.loadPageFromProps(this.props)} } backgroundColor={"#79b5fe"} style={{margin:1,height:45,marginRight:5,fontWeight:"bolder"}}><Refresh/>Reload Changes</RaisedButton>
        </Card>



        <div style={{marginTop:10, position: "fixed", width: "100vw", bottom: 0, left:0, backgroundColor:"#00000061"}}>
        <Card style={{padding:10,  paddingBottom:40, maxHeight:600, width: "90%",marginLeft:"5%",marginTop:3}}>

        {/* <RaisedButton variant={"contained"} onClick={ () => {this.loadPageFromProps(this.props)} } backgroundColor={"#79b5fe"} style={{margin:1,height:45,width:210,marginRight:5,float:"left",fontWeight:"bolder"}}><Refresh style={{float:"left", marginTop:10, marginLeft:10, marginRight:-12}} />Show Saved Changes</RaisedButton><br /><br /> */}

        {/* <RaisedButton variant={"contained"} onClick={ () => {this.getPreview()} } backgroundColor={"#99b8f1"} style={{margin:1,height:45,width:150,marginRight:5,fontWeight:"bolder"}}>Update Preview</RaisedButton> */}
        <RaisedButton variant={"contained"} onClick={ () => {this.setState({toggeLiveResults : this.state.toggeLiveResults ? false : true })} } style={{padding:5}}> Toggle Live Results </RaisedButton>

        {

        this.state.toggeLiveResults ?
          <div>

            {
              this.state.preparingPreview ?  <Loader type="Circles" color="#00aaaa" height={150} width={150}/> :  (this.state.preview ? preparedPreview : "Save changes to see preview")
            }

          </div> : ""
        }

        </Card>
        </div>

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
  // setTemplateList: (templateList) => {
  //   dispatch(templateListSet(templateList))
  // },
  goToUrl: (url) => dispatch(push(url))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AnnotationView);
