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

    var normalStyle = {}
    var hoverStyle = {...normalStyle, fontWeight: "bold", cursor : "pointer"}

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
