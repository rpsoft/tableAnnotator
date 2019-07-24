import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { push } from 'react-router-redux'

import fetchData from '../network/fetch-data';

import RaisedButton from '@material-ui/core/Button';
import FlatButton from '@material-ui/core/Button';
import {RadioButton, RadioButtonGroup} from '@material-ui/core/Radio';

import TextField from '@material-ui/core/TextField';

import SelectField from '@material-ui/core/Select';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Card from '@material-ui/core/Card';

import Dialog from '@material-ui/core/Dialog';

import Popover from '@material-ui/core/Popover';
import Checkbox from '@material-ui/core/Checkbox';

import MultiplePopover from './MultiplePopover'

import RemoveCircle from '@material-ui/icons/RemoveCircle';

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
                    <RaisedButton variant={"contained"} onClick={ this.handleOpen } > {"Move"} </RaisedButton>
                    <RaisedButton variant={"contained"} onClick={ () => {} } style={{width:100,marginLeft:5}}> {"Set Default"} </RaisedButton>
                  </div> : ""
                }
          </div>


      </div>
    );
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
)(ClusterItem);
