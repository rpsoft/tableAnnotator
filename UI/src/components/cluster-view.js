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

class ClusterView extends Component {

  constructor(props) {
    super()

    this.state = {
        table: null,
        currentPage : props.location.query && props.location.query.page ? props.location.query.page : 1
    };

    debugger
  }

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

        this.setState({clusters : results,
                       totalClusters : Object.keys(results).length,
                       currentPage: props.location.query && props.location.query.page ? props.location.query.page : currentPage  })
    }


   changePage( number ){
     this.props.goToUrl("/cluster?page="+number)
   }

   summary(cluster) {

    var clusterFreqs = cluster.reduce( (acc,item) => { var cuis = item.cuis.split(";"); for ( var i in cuis ){ var prev = acc[cuis[i]]; prev = prev ? prev+1 : 1; acc[cuis[i]] = prev } return acc} , {});

    var keys = Object.keys(clusterFreqs)
    return <div>{ keys.map( (e,i) => <div key={i}> { e+" : "+clusterFreqs[e] }</div>) }</div>
   }


   render() {

     var CUIs = ["28 : C0043210 : female (Woman) [Population Group] ","28 : C0043210 : female (Woman) [Population Group] ","15 : C0043210 : female (Woman) [Population Group] ","28 : C0043210 : female (Woman) [Population Group] ","10 : C0043210 : female (Woman) [Population Group] "]

     if ( this.state.clusters ){


       return <Card style={{width: "90vw", marginLeft:"5vw", padding: "1vw", minHeight:600}}>

                   <TextField
                     value={this.state.user}
                     hintText="Set your username here"
                     onChange={(event,value) => {this.setState({user: value})}}
                     style={{width:200,marginLeft:20,marginRight:20}}
                     onKeyDown={(event, index) => {

                     }}
                     />

                    <div style={{float:"right "}}>
                     <RaisedButton onClick={ () => {this.changePage(parseInt(this.state.currentPage) - 1)} } style={{float:"left"}}> {"<<"} </RaisedButton>
                     <div style={{float:"left",padding:15,fontWeight:"bold"}}>{"Cluster : "+this.state.currentPage +" / "+ this.state.totalClusters }</div>
                     <RaisedButton onClick={ () => {this.changePage(parseInt(this.state.currentPage) + 1)} } style={{float:"left"}}> {">>"} </RaisedButton></div>
                    <div>

                    <Card style={{float:"right", padding:20, position:"relative", top:20}}> <div style={{marginBottom:10}}> Related CUIs and frequencies</div> {
                      this.summary(this.state.clusters[this.state.currentPage])
                    } </Card>

                    <hr />
                        {
                          this.state.clusters[this.state.currentPage].map( (v,i) => <ClusterItem key={i} item={v} clusters={this.state.clusters} currentPage={this.state.currentPage}></ClusterItem>)
                        }

                    </div>

                    <hr />
                    {// <RaisedButton onClick={ () => {} } style={{padding:5}}> {"Save Changes"} </RaisedButton>
                    }
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
