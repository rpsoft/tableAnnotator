import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { push } from 'connected-react-router'

import fetchData from '../network/fetch-data';

import {URL_BASE} from '../links'
import Card from '@material-ui/core/Card';
//import Bootstrap from '../../assets/bootstrap.css';
import RaisedButton from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import TextField from '@material-ui/core/TextField';
import SelectField from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

import Loader from 'react-loader-spinner'

import Toggle from '@material-ui/core/Switch'

import { FixedSizeList as List } from 'react-window';
import Home from '@material-ui/icons/Home';

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
        goto : props.location.query && props.location.query.page ? props.location.query.page : 1,
        paging : props.location.query && props.location.query.paging ? props.location.query.paging : 20,
        checkedConcepts : {},
        clusters : {},
        totalClusters : 0,
        searchTerm : "",
        cuis_index: {},
        clusterData: {},
        modifiers: {},
        open: {},
        hideCompleted: false,
        hideUnhelpful: false,
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

    this.props.goToUrl("/cluster?page="+this.state.currentPage)
  }

  handleModifierChange = (v, c) => {
    alert(v+" -- "+c)
  };

  handleClusterDataChange = async ( clusterData, clusterNumber, operation ) => {

//    alert(JSON.stringify(clusterData)+" "+clusterNumber+" "+operation);

    let fetch = new fetchData();

    var previousData = this.state.clusterData[clusterNumber]

    if ( !previousData ){
       previousData = {cn : clusterNumber, rep_cuis: [], excluded_cuis: [], status: "inprogress"} //inprogress, completed, completedchecked
    }

    switch (operation) {
      case "status":
        previousData.status = clusterData
        break;
      case "rep":
        var i = previousData.rep_cuis.indexOf(clusterData);

        if ( i > -1){
          previousData.rep_cuis.splice(i,1)
        } else {
          previousData.rep_cuis.push(clusterData)
        }

        break;
      case "exclude":
        var i = previousData.excluded_cuis.indexOf(clusterData);

        if ( i > -1){
          previousData.excluded_cuis.splice(i,1)
        } else {
          previousData.excluded_cuis.push(clusterData)
        }

        break;
      default:

    }

    await fetch.setClusterData(previousData)



    await this.loadPageFromProps(this.props)

  }


  async componentWillReceiveProps(next) {
      this.loadPageFromProps(next)
  }

  async componentWillMount() {
      this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){
        let fetch = new fetchData();

        var open = {}

        var clusters = await fetch.getAllClusters()

            clusters = clusters.reduce( (acc, item) =>{ var cnumb = item.cn_override ? item.cn_override : item.cn; open[cnumb] = this.state.open[cnumb] ? this.state.open[cnumb] : false; var prev = acc[cnumb]; if ( prev ){ prev.push(item); } else { prev = [item] } acc[item.cn_override ? item.cn_override : item.cn] = prev; return acc },{})

        var clusterData = await fetch.getClusterData()

            clusterData = clusterData.reduce( (agg,v) => {
                    var newElem = v;
                      newElem.rep_cuis = v.rep_cuis.trim().split(";");
                      newElem.excluded_cuis = v.excluded_cuis.trim().split(";");
                      agg[newElem.cn] = newElem;
                    return agg;
                  },{} );

        var cuis_index = await fetch.getCUISIndex()

        this.setState({clusters : clusters,
                       totalClusters : Object.keys(clusters).length,
                       checkedConcepts:{},
                       cuis_index : cuis_index,
                       clusterData: clusterData,
                       currentPage : this.state.currentPage ? this.state.currentPage : (props.location.query && props.location.query.page ? props.location.query.page : 1),
                       goto : this.state.currentPage ? this.state.currentPage : (props.location.query && props.location.query.page ? props.location.query.page : 1),
                       paging : props.location.query && props.location.query.paging ? props.location.query.paging : 20,
                       open: open,
                      })
    }


   changePage( number ){

     this.props.goToUrl("/cluster?page="+number)
   }

   handleOpen = ( cluster ) => {

     var open = this.state.open
     open[cluster] = open[cluster] ? false : true
     this.setState({open : open, openAll: false});
   }

   handleOpenAllVisible = () => {
     var open = this.state.open

     var openAll = this.state.openAll ? false : true

     Object.keys(open).map( v => {open[v] = openAll })

     // open[cluster] = open[cluster] ? false : true
     this.setState({open : open, openAll : openAll});
   }


   searchTerms () {

     var state = this.state;

     var theclusters = {}

     var hide =  this.state.hideCompleted || this.state.hideUnhelpful


     var keys = Object.keys(state.clusters)

          keys.map(function (v,i) {

           if ( hide ){
             var noData = state.clusterData[keys[i]] == undefined

             if ( !noData ){
               var comp = (state.hideCompleted && (state.clusterData[keys[i]].status == "completedchecked"))
               var unhelp = (state.hideUnhelpful && (state.clusterData[keys[i]].status == "unhelpful"))

                if (!(comp || unhelp)){
                    theclusters[keys[i]] = state.clusters[keys[i]]
                }

             } else {
               theclusters[keys[i]] = state.clusters[keys[i]]
             }

           } else {
             theclusters[keys[i]] = state.clusters[keys[i]]
           }

         })

     keys = Object.keys(theclusters)


     if( this.state.searchTerm.length > 3 ){
       var found = []

       var searchTerms = this.state.searchTerm.trim().split(" ")

       var clustersToReturn = {}

       Object.keys(theclusters).map( (c,i) => {

          var totalFound = theclusters[c].reduce( (acc, citem) => {

                  var nfound = 0

                  for( var t in searchTerms ){
                    if ( citem.concept.indexOf(searchTerms[t]) > -1 ){
                      nfound = nfound+1
                    }

                    if ( citem.cuis && citem.cuis.indexOf(searchTerms[t]) > -1 ){
                      nfound = nfound+1
                    }
                  }

                  return acc+nfound;
              } , 0 );

           if (totalFound > 0 ){
             found.push({cn : c, found: totalFound})
             clustersToReturn[c] = theclusters[c]
           }
       })

       found = found.sort(function(a, b){return b.found - a.found})

       return found.map( v => v.cn )
     } else {
       return keys
     }

   }



   render() {

     //var CUIs = ["28 : C0043210 : female (Woman) [Population Group] ","28 : C0043210 : female (Woman) [Population Group] ","15 : C0043210 : female (Woman) [Population Group] ","28 : C0043210 : female (Woman) [Population Group] ","10 : C0043210 : female (Woman) [Population Group] "]

     //
     // <div style={{float:"right "}}>
     //  <RaisedButton variant={"contained"} onClick={ () => {this.changePage(parseInt(this.state.currentPage) - 1)} } style={{float:"left"}}> {"<<"} </RaisedButton>
     //  <div style={{float:"left",padding:15,fontWeight:"bold"}}>{"Cluster : "+this.state.currentPage +" / "+ this.state.totalClusters }</div>
     //  <RaisedButton variant={"contained"} onClick={ () => {this.changePage(parseInt(this.state.currentPage) + 1)} } style={{float:"left"}}> {">>"} </RaisedButton></div>



     if ( this.state.clusters && Object.keys(this.state.clusters).length > 0 ){

       var maxIndex = Object.keys(this.state.clusters).reduce( (v,max) => { return parseInt(v) > max ? v : max }, -99999)

           maxIndex = this.state.clusters[maxIndex].length == 0 ? maxIndex : parseInt(maxIndex)+1

       var found_clusters = this.searchTerms()

       var currentClusters = found_clusters.map( (v,i) => { return <Cluster key={i} item={this.state.clusters[v]}
                                                                 clusters={this.state.clusters}
                                                                 currentCluster={v}
                                                                 isChecked={ (c) => { return Object.keys(this.state.checkedConcepts).indexOf(c) > -1 }}
                                                                 clearChecked={ () => {this.setState({checkedConcepts : {}})}}
                                                                 open = {this.state.open[v]}
                                                                 handleOpen = { this.handleOpen }
                                                                 toggleCheck={ this.toggleCheck }
                                                                 moveAllHere={ this.moveAllHere }
                                                                 anyChecked={ Object.keys(this.state.checkedConcepts).length > 0  }
                                                                 cuis_index={ this.state.cuis_index }
                                                                 handleModifierChange = { this.handleModifierChange }
                                                                 handleClusterDataChange = { this.handleClusterDataChange }
                                                                 modifiers={this.state.modifiers}
                                                                 status={this.state.clusterData[v] ? this.state.clusterData[v].status : "inprogress"}
                                                                 rep_cuis={this.state.clusterData[v] && this.state.clusterData[v].rep_cuis ? this.state.clusterData[v].rep_cuis : []}
                                                                 excluded_cuis={this.state.clusterData[v] && this.state.clusterData[v].excluded_cuis ? this.state.clusterData[v].excluded_cuis : []}
                                                               ></Cluster>})


       var currentPage = this.state.currentPage-1

       var start = currentPage*this.state.paging
           start = start > (currentClusters.length-1-this.state.paging) ? (currentClusters.length-1-this.state.paging) : start
           start = start < 0 ? 0 : start


       var end = start + this.state.paging
           end = end > (currentClusters.length) ? currentClusters.length : end

       var total = Math.ceil(currentClusters.length / this.state.paging)
       currentClusters = currentClusters.slice(start,end+1)


       var discard = <Cluster key={"-10"} item={this.state.clusters["-10"]}
         clusters={this.state.clusters}
         currentCluster={"-10"}
         isChecked={ (c) => { return Object.keys(this.state.checkedConcepts).indexOf(c) > -1 }}
         clearChecked={ () => {this.setState({checkedConcepts : {}})}}
         open = {this.state.open["-10"]}
         handleOpen = { this.handleOpen }
         toggleCheck={ this.toggleCheck }
         moveAllHere={ this.moveAllHere }
         anyChecked={ Object.keys(this.state.checkedConcepts).length > 0  }
         cuis_index={ this.state.cuis_index }
         handleModifierChange = { this.handleModifierChange }
         handleClusterDataChange = { this.handleClusterDataChange }
         modifiers={this.state.modifiers}
         status={this.state.clusterData["-10"] ? this.state.clusterData["-10"].status : "inprogress"}
         rep_cuis={this.state.clusterData["-10"] && this.state.clusterData["-10"].rep_cuis ? this.state.clusterData["-10"].rep_cuis : []}
         excluded_cuis={this.state.clusterData["-10"] && this.state.clusterData["-10"].excluded_cuis ? this.state.clusterData["-10"].excluded_cuis : []}
       ></Cluster>


       // <Infinite containerHeight={1020} elementHeight={60}>
       //     { currentClusters }
       // </Infinite>


       var page_styler= { cursor: "pointer", color: "blue", textDecoration: "underline" }

       return <Card style={{width: "90vw", marginLeft:"5vw", padding: "1vw", minHeight:600}}>

              <div style={{float:"right",display:"inline"}}>
                  <Toggle label="Hide Completed" toggled={this.state.hideCompleted} onToggle={ (v) => this.setState({hideCompleted: this.state.hideCompleted ? false : true})} />
                  <Toggle label="Hide Unhelpful" toggled={this.state.hideUnhelpful} onToggle={ (v) => this.setState({hideUnhelpful: this.state.hideUnhelpful ? false : true})} />
                  <Toggle label="Collapse/Uncollapse All" toggled={this.state.openAll} onToggle={ this.handleOpenAllVisible } />
               </div>
                   <Card style={{position:"fixed",top:0, backgroundColor: "white", left: "40%", padding:10, display:"inline"}}>
                      <div style={{...page_styler, display:"inline", marginRight: 5 }} onClick={ () => {
                                                                                               this.setState({currentPage : 1, goto: 1})
                                                                                           }}>First</div>
                      <div style={{...page_styler, display:"inline", marginLeft:5, marginRight:5 }} onClick={ () => {
                                                                                                var cpage = parseInt(this.state.currentPage)-1 < 1 ? 1 : parseInt(this.state.currentPage)-1;
                                                                                                this.setState({currentPage: cpage, goto: cpage})
                                                                                              }}>Previous</div>
                      <div style={{...page_styler, display:"inline", marginLeft: 5 }}>
                      <TextField
                        value={this.state.goto}
                        placeholder="Go"
                        onChange={(event,value) => {this.setState({goto: value})}}
                        style={{width:30,marginLeft:5}}
                        onKeyDown={(event, index) => {

                            if(event.key === 'Enter'){
                              if ( this.state.goto ){

                              var newpage = parseInt(this.state.goto) < 1 ? 1 : parseInt(this.state.currentPage)
                                  newpage = parseInt(this.state.goto) > total ? total : parseInt(this.state.goto)

                              this.setState({currentPage:newpage});

                              }
                            }

                        }}
                        />
                      </div>
                      <div style={{display:"inline",marginRight:5}}>{" / "+total}</div>
                      <div style={{...page_styler, display:"inline", marginLeft: 5, marginRight:5 }} onClick={ () => {
                                                                                                  var cpage = parseInt(this.state.currentPage)+1 > total ? total : parseInt(this.state.currentPage)+1;
                                                                                                  this.setState({currentPage : cpage, goto: cpage})
                                                                                              }}>Next</div>
                      <div style={{...page_styler, display:"inline", marginLeft: 5 }} onClick={ () => {
                                                                                                  this.setState({currentPage : total, goto: total})
                                                                                              }}>Last</div>
                   </Card>

                   <Home style={{float:"left",height:45,width:45, cursor:"pointer"}} onClick={() => this.props.goToUrl("/"+(this.state.user ? "?user="+this.state.user : "" ))}/>

                   <TextField
                     value={this.state.searchTerm}
                     placeholder="Filter by text here"
                     onChange={(event,value) => {this.setState({searchTerm: value, currentPage: 1 })}}
                     style={{width:200,marginLeft:20,marginRight:20}}
                     onKeyDown={(event, index) => {

                     }}
                     />


                     {
                      Object.keys(this.state.checkedConcepts).length > 0 ? <Card style={{position:"fixed", top:20, right:20, minWidth: "20vw", minHeight: "20vh",padding:5,paddingTop:15,paddingRight:10}}>
                       <div style={{height:"100%",width:"100%"}}>
                       <RaisedButton variant={"contained"} onClick={ () => { this.setState({checkedConcepts:[]}); console.log(this.state.checkedConcepts); } } style={{float:"right"}}> {"Clear"} </RaisedButton>
                       <div style={{fontWeight:"bold",marginLeft:5}}>Selected Items</div>

                       <hr style={{marginTop:25}}/>
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


                              <RaisedButton variant={"contained"} onClick={ () => { this.moveAllHere(maxIndex) } } style={{float:"left",marginLeft:5, paddingLeft:5, paddingRight:5}}> {"To New Cluster"} </RaisedButton>

                              <RaisedButton variant={"contained"} onClick={ () => { this.moveAllHere("-10") } } style={{float:"right",marginLeft:5}}> {"Discard All"} </RaisedButton>

                         </div>
                       </div>
                     </Card> : ""
                    }

                    <hr style={{marginTop:40}}/>

                    { currentClusters }

                    <hr style={{marginTop:40}}/>
                    <hr />

                    { discard }

                    <div style={{marginTop:40}} > </div>
              </Card>


     } else {
       return <Card style={{width: "90vw", marginLeft:"5vw", padding: "1vw", minHeight:600}}> <div> <Loader type="Circles" color="#00aaaa" height={150} width={150}/> </div> </Card>
     }
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
)(ClusterView);
