import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import { templateListSet } from '../actions/actions';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import SelectField from 'material-ui/SelectField';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';


import Popover from 'material-ui/Popover';
import Checkbox from 'material-ui/Checkbox';

import MultiplePopover from './MultiplePopover'

import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';

class ClusterItem extends Component {
  constructor(props) {
      super()
      this.state = {
        hover: false,
        item_text: props.item_text
      };

    }

  onMouseEnterHandler = () => {
        this.setState({
            hover: true
        });

        //console.log('enter');
  }

  onMouseLeaveHandler = () => {
      this.setState({
          hover: false
      });
      //console.log('leave');
  }


  // handleChange = (event, index, value, source) => {
  //    var prevState = this.state
  //    prevState[source] = value
  //    console.log(prevState)
  //    this.setState(prevState);
  //
  //    this.props.addAnnotation(this.state)
  // };
  //
  // handleMultiChoice = (variable,values) => {
  //   var prevState = this.state
  //       prevState[variable] = values
  //     //  debugger
  //   console.log(prevState)
  //   this.setState(prevState)
  // //   debugger
  //   this.props.addAnnotation(this.state)
  // }

  async componentDidMount() {
      // this.setState(this.props.annotationData)
  }

  async componentWillReceiveProps(next) {

      // this.setState(next.annotationData)

  }


  render() {

    var normalStyle = {}
    var hoverStyle = {...normalStyle, fontWeight: "bold", cursor : "pointer"}

    return (
      <div style={{marginLeft:0}} onMouseEnter={this.onMouseEnterHandler}
                    onMouseLeave={this.onMouseLeaveHandler}>

          <div style={this.state.hover ? hoverStyle : normalStyle}>
                <div style={{display:"inline"}}>{this.state.item_text}</div>
                {
                this.state.hover ? <div style={{display:"inline", marginLeft:30}}>
                  <RaisedButton onClick={ () => {alert("removing from cluster")} } style={{}}> {<RemoveCircle />} </RaisedButton>
                  <RaisedButton onClick={ () => {this.setState({currentPage: this.state.currentPage + 1 })} } style={{}}> {"-"} </RaisedButton>
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
