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
        currentPage : 0
    };

  }

  async componentWillReceiveProps(next) {
      this.loadPageFromProps(next)
  }

  async componentWillMount() {

      this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){

        let fetch = new fetchData();

        var results = JSON.parse(await fetch.getAllClusters())

        this.setState({clusters : results, totalClusters : Object.keys(results).length  })

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
                       //
                       // if (event.key === 'Enter') {
                       //     this.shiftTables(0)
                       //     event.preventDefault();
                       // }
                     }}
                     />



                    <div style={{float:"right "}}>
                     <RaisedButton onClick={ () => {this.setState({currentPage: this.state.currentPage - 1 })} } style={{float:"left"}}> {"<<"} </RaisedButton>
                     <div style={{float:"left",padding:15,fontWeight:"bold"}}>{"Cluster : "+this.state.currentPage +" / "+ this.state.totalClusters }</div>
                     <RaisedButton onClick={ () => {this.setState({currentPage: this.state.currentPage + 1 })} } style={{float:"left"}}> {">>"} </RaisedButton></div>
                    <div>

                    <hr />

                    <Card style={{float:"right", padding:20}}> <div style={{marginBottom:10}}> Related CUIs and frequencies</div> {
                      CUIs.map( (v) => <div> {v} </div> )
                    } </Card>

                    <Card> </Card>
                        {
                          this.state.clusters[this.state.currentPage].map( v => <ClusterItem item_text={v}></ClusterItem>)
                        }

                    </div>

                    <hr />
                    <RaisedButton onClick={ () => {} } style={{padding:5}}> {"Save Changes"} </RaisedButton>
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
