import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { push } from 'react-router-redux'

import { templateListSet } from '../actions/actions';
import fetchData from '../network/fetch-data';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import TextField from 'material-ui/TextField';

import SelectField from 'material-ui/SelectField';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import Dialog from 'material-ui/Dialog';

import Popover from 'material-ui/Popover';
import Checkbox from 'material-ui/Checkbox';

import MultiplePopover from './MultiplePopover'

import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';

class ClusterItem extends Component {
  constructor(props) {
      super()
      this.state = {
        hover: false,
        item: props.item,
        open: false,
        searchTerm: "",
        selectedTarget:props.item.cn,
        currentPage: props.currentPage,
      };

    }

  onMouseEnterHandler = (i,y) => {

        this.setState({
            hover: y ? y : true
        });

  }

  onMouseLeaveHandler = () => {
      this.setState({
          hover: false
      });
  }




  loadPageFromProps = async (props) => {
        this.setState({ item: props.item,  currentPage: props.currentPage })
    }


  async componentDidMount() {
    this.loadPageFromProps(this.props)
  }

  async componentWillReceiveProps(next) {
    this.loadPageFromProps(next)
  }

handleOpen = () => {
   this.setState({open: true,selectedTarget: this.state.currentPage});

 };

 handleClose = () => {
   this.setState({open: false});
 };

 doClusterChange = async ( override ) => {

   if ( this.state.searchTerm.length <= 2){
     override = this.state.directTransfer
   }

   var item = this.state.item

   this.handleClose()

   let fetch = new fetchData();

   var results = await fetch.saveClusterAnnotation(item.cn,item.concept,item.cuis,item.isdefault, (override ? override : this.state.selectedTarget))

   this.props.goToUrl("/cluster?page="+this.state.currentPage)

 }


  render() {

    var SEARCHER;

      if ( this.state.searchTerm.length > 2 ){
        SEARCHER = Object.keys(this.props.clusters).map( (c,i) => {
            var allText = this.props.clusters[c].map( item => item.concept ).join(" ")


            var searchTerms = this.state.searchTerm.split(" ")
            var found = 0

            for ( var s in searchTerms ){
              if ( searchTerms[s].length > 0 && allText.toLowerCase().indexOf(searchTerms[s].toLowerCase()) > -1 ) {
                  found = found+1;
                }
            }

            if ( found ){

              return <div key={i} style={{cursor:"pointer", fontWeight : this.state.hover == i ? "bold" : "" }} onMouseEnter={(x) => this.onMouseEnterHandler(x,i)}
                            onMouseLeave={(x) => this.onMouseLeaveHandler(x,i)} onClick={ ( x) => {this.setState({selectedTarget: c})} }>
                      <div style={{display:"inline"}}>{ c+" :: " }</div>
                      <div style={{display:"inline"}}>{ allText.length > 100 ? allText.slice(0,100) : allText }</div>
                    </div>
            }

          })

      } else {

        SEARCHER = <TextField
                          value={this.state.directTransfer}
                          hintText="Type a Cluster number to transfer directly"
                          onChange={(event,value) => {this.setState({directTransfer: value})}}
                          style={{width:400,marginLeft:20,marginRight:20,marginTop:20}}

                          onKeyDown={(event, index) => {

                            if (event.key === 'Enter') {
                                this.doClusterChange(isNaN(this.state.directTransfer) ? undefined : this.state.directTransfer )
                                event.preventDefault();
                            }
                          }}

                          />
      }





    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.doClusterChange}
      />,
    ];

    var normalStyle = {}
    var hoverStyle = {...normalStyle, fontWeight: "bold", cursor : "pointer"}

    // debugger
    return (
      <div style={{marginLeft:0}} onMouseEnter={this.onMouseEnterHandler}
                    onMouseLeave={this.onMouseLeaveHandler}>

          <div style={this.state.hover ? hoverStyle : normalStyle}>
                <div style={{display:"inline"}}>{this.state.item.concept}</div>
                { this.state.hover == true ? (this.state.item.cuis.split(";").map( (el,i) => <div key={i} style={{display:"inline", marginLeft:10}}>{el}</div>)) : "" }
                {
                  this.state.hover == true ? <div style={{display:"inline", marginLeft:30}}>
                    <RaisedButton onClick={ this.handleOpen } > {"Move"} </RaisedButton>
                    <RaisedButton onClick={ () => {} } style={{width:100,marginLeft:5}}> {"Set Default"} </RaisedButton>
                  </div> : ""
                }
          </div>

          <Dialog
            actions={actions}
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleClose}
            autoScrollBodyContent={true}
            contentStyle={{width:"70vw",maxWidth:"none",height:"70vw",maxHeight:"none"}}
            title={<div style={{display:"inline"}}>
              <div style={{display:"inline"}}>{" move: "}</div>
              <div style={{display:"inline",fontWeight:"bold"}}>{ this.state.item.concept }</div>
              <div style={{display:"inline"}}>{" to: "}</div>
              <div style={{display:"inline",fontWeight:"bold", color:"red"}}>{ this.state.selectedTarget }</div>
              <TextField
                value={this.state.searchTerm}
                hintText="Search here"
                onChange={(event,value) => {this.setState({searchTerm: value})}}
                style={{width:200,marginLeft:20,marginRight:20,marginTop:20}}
                />
            </div>}
          >

                  <div>{[""].map( x => SEARCHER)}</div>

          </Dialog>


      </div>
    );
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
)(ClusterItem);
