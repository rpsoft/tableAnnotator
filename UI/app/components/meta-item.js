import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import SelectField from '@material-ui/core/Select';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Card from '@material-ui/core/Card';


import Popover from '@material-ui/core/Popover';
import Checkbox from '@material-ui/core/Checkbox';

import MultiplePopover from './MultiplePopover'

class MetaItem extends Component {
  constructor(props) {
      super()

      this.state = {
        term : props.term,
        anchorEl : null,
        assigned_cuis : ["C0000545","C0000545","C0000545","C0000545","C0000545","C0000545"],
        cuis_data : props.cuis_data,
      }

    }


  handleChange = (event, data, source) => {

  }


  async componentDidMount() {
      // this.setState(this.props.annotationData)
  }

  async componentWillReceiveProps(next) {
      // this.setState(next.annotationData)
      //

  }

  handleClick = (event) => {
    this.setState({anchorEl : event.currentTarget});
  }

  handleClose = () => {
    this.setState({anchorEl : null});
  }

  render() {

    var concept_CUI_modifiers = ["Presence", "Severity", "Magnitude", "Duration", "Exposed", "Timing", "Accuracy"]
    // debugger
    return (
      <div style={{}}>
            <div style={{display:"inline-block", fontWeight:"bolder"}}>{this.state.term+" : "}</div>

            {this.state.assigned_cuis ? this.state.assigned_cuis.map( cui => <div style={{display:"inline-block",marginLeft:5}}>{this.state.cuis_data[cui] ? this.state.cuis_data[cui].preferred : ""}</div>) : ""}

            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={this.handleClick}>
              +
            </Button>
            <Menu
              id={this.state.term+"_menu"}
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleClose}
            >
              {
                concept_CUI_modifiers.map(
                  (v,i ) => <MenuItem key={v+"_item_"+i } onClick={this.handleClose}>{v}</MenuItem>
                )
              }
            </Menu>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  // if route contains params
  params: ownProps.params,
  location: ownProps.location
})

const mapDispatchToProps = (dispatch) => ({

  goToUrl: (url) => dispatch(push(url))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MetaItem);
