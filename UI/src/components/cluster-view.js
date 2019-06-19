import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { push } from 'react-router-redux'

import fetchData from '../network/fetch-data';

import { templateListSet } from '../actions/actions';

import {URL_BASE} from '../links'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
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
import Checkbox from 'material-ui/Checkbox';

// var ReactDOMServer = require('react-dom/server');
// var HtmlToReact = require('html-to-react')
// var HtmlToReactParser = require('html-to-react').Parser;

import ClusterItem from './cluster-item'
import Cluster from './cluster'

class ClusterView extends Component {

  constructor(props) {
    super()

    this.state = {
        table: null,
        currentPage : props.location.query && props.location.query.page ? props.location.query.page : 1,
        checkedConcepts : {},
        clusters : {},
        totalClusters : 0,
        searchTerm : "",
        cuis_index: {},
        clusterData: {},
        modifiers: {},
    };

  }

  toggleCheck = (concept,cn) => {

       var checked = this.state.checkedConcepts

       var i = Object.keys(checked).indexOf(concept)

       if ( i < 0 ){
         checked[concept] = cn

       } else {
         delete checked[concept]
       }
       console.log(checked)
       this.setState({checkedConcepts: checked})
  }

  moveAllHere = async (override) => {

    let fetch = new fetchData();

    var checked = this.state.checkedConcepts

    Object.keys(checked).map( async (concept,i) => {

        var prevCluster = this.state.checkedConcepts[concept]
        var item = this.state.clusters[prevCluster].filter(item => item.concept == concept)[0]
            await fetch.saveClusterAnnotation(item.cn,item.concept,item.cuis,item.isdefault, override )

    })

    this.loadPageFromProps(this.props)

    this.props.goToUrl("/cluster")
  }

  handleModifierChange = (v, c) => {
    alert(v+" -- "+c)
  };


  async componentWillReceiveProps(next) {
      this.loadPageFromProps(next)
  }

  async componentWillMount() {
      this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){
        let fetch = new fetchData();


        var results = await fetch.getAllClusters()

            results = results.reduce( (acc, item) =>{ var prev = acc[item.cn_override ? item.cn_override : item.cn]; if ( prev ){ prev.push(item); } else { prev = [item] } acc[item.cn_override ? item.cn_override : item.cn] = prev; return acc },{})

        var cuis_index = await fetch.getCUISIndex()

        this.setState({clusters : results,
                       totalClusters : Object.keys(results).length,
                       checkedConcepts:{},
                       cuis_index : cuis_index})
    }


   changePage( number ){
     this.props.goToUrl("/cluster?page="+number)
   }


   searchTerms () {



     if( this.state.searchTerm.length > 3 ){
       var found = []

       var searchTerms = this.state.searchTerm.trim().split(" ")

       var clustersToReturn = {}

       Object.keys(this.state.clusters).map( (c,i) => {

          var totalFound = this.state.clusters[c].reduce( (acc, citem) => {

                  var nfound = 0

                  for( var t in searchTerms ){
                    if ( citem.concept.indexOf(searchTerms[t]) > -1 ){
                      nfound = nfound+1
                    }

                    if ( citem.cuis.indexOf(searchTerms[t]) > -1 ){
                      nfound = nfound+1
                    }
                  }

                  return acc+nfound;
              } , 0 );

           if (totalFound > 0 ){
             found.push({cn : c, found: totalFound})
             clustersToReturn[c] = this.state.clusters[c]
           }
       })

       found = found.sort(function(a, b){return b.found - a.found});

       return found.map( v => v.cn )
     } else {
       return Object.keys(this.state.clusters)
     }

   }



   render() {

     //var CUIs = ["28 : C0043210 : female (Woman) [Population Group] ","28 : C0043210 : female (Woman) [Population Group] ","15 : C0043210 : female (Woman) [Population Group] ","28 : C0043210 : female (Woman) [Population Group] ","10 : C0043210 : female (Woman) [Population Group] "]

     //
     // <div style={{float:"right "}}>
     //  <RaisedButton onClick={ () => {this.changePage(parseInt(this.state.currentPage) - 1)} } style={{float:"left"}}> {"<<"} </RaisedButton>
     //  <div style={{float:"left",padding:15,fontWeight:"bold"}}>{"Cluster : "+this.state.currentPage +" / "+ this.state.totalClusters }</div>
     //  <RaisedButton onClick={ () => {this.changePage(parseInt(this.state.currentPage) + 1)} } style={{float:"left"}}> {">>"} </RaisedButton></div>



     if ( this.state.clusters ){


       return <Card style={{width: "90vw", marginLeft:"5vw", padding: "1vw", minHeight:600}}>

                   <TextField
                     value={this.state.searchTerm}
                     hintText="Filter by text here"
                     onChange={(event,value) => {this.setState({searchTerm: value})}}
                     style={{width:200,marginLeft:20,marginRight:20}}
                     onKeyDown={(event, index) => {

                     }}
                     />


                     {
                      Object.keys(this.state.checkedConcepts).length > 0 ? <Card style={{position:"fixed", top:20, right:20, minWidth: "20vw", minHeight: "20vh",padding:5,paddingTop:15,paddingRight:10}}>
                       <div style={{height:"100%",width:"100%"}}>
                       <div style={{fontWeight:"bold",marginLeft:5}}>Selected Items</div>
                       <hr />
                        <div style={{minHeight: "20vh", maxWidth:"30vw", maxHeight:"50vh", overflowX: "scroll", overflowY: "scroll", }}>
                         {
                           Object.keys(this.state.checkedConcepts).map( (c,i) => <div key={i} style={{marginLeft:10}}>
                                     <input type="checkbox"
                                            checked={true}
                                            onClick={ () => this. toggleCheck(c,this.state.checkedConcepts[c]) } />{c}
                                  </div> )
                         }
                         </div>
                         <div style={{height:"20%",marginTop:5 }}>
                              <RaisedButton onClick={ () => { this.setState({checkedConcepts:[]}); console.log(this.state.checkedConcepts); } } style={{float:"left"}}> {"Clear All"} </RaisedButton>
                              <RaisedButton onClick={ () => { this.moveAllHere(-10) } } style={{float:"right",marginLeft:5}}> {"Discard All"} </RaisedButton>

                         </div>
                       </div>
                     </Card> : ""
                    }

                    <hr />
                    <div>
                        {
                          this.searchTerms().map( (v,i) => <Cluster key={i} item={this.state.clusters[v]}
                                                                                                          clusters={this.state.clusters}
                                                                                                          currentCluster={v}
                                                                                                          isChecked={ (c) => { return Object.keys(this.state.checkedConcepts).indexOf(c) > -1 }}
                                                                                                          clearChecked={ () => {this.setState({checkedConcepts : {}})}}
                                                                                                          toggleCheck={ this.toggleCheck }
                                                                                                          moveAllHere={ this.moveAllHere }
                                                                                                          anyChecked={ Object.keys(this.state.checkedConcepts).length > 0  }
                                                                                                          cuis_index={ this.state.cuis_index }
                                                                                                          handleModifierChange = { this.handleModifierChange }
                                                                                                          modifiers={this.state.modifiers}
                                                                                                        ></Cluster>)
                                                                                                      }

                    </div>

                    <hr />

              </Card>


     } else {
       return <div> loading </div>
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
)(ClusterView);
