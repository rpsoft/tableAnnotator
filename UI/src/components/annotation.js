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

// import ContentLinkIcon from 'material-ui/svg-icons/content/link';

class Annotation extends Component {
  constructor(props) {
      super()
      this.state = {
        location: "Col",
        content : {},
        qualifiers : {}
      };

    }


  handleChange = (event, index, value, source) => {
     var prevState = this.state
     prevState[source] = value
     console.log(prevState)
     this.setState(prevState);

     this.props.addAnnotation(this.state)
  };

  handleMultiChoice = (variable,values) => {
    var prevState = this.state
        prevState[variable] = values
      //  debugger
    console.log(prevState)
    this.setState(prevState)
  //   debugger
    this.props.addAnnotation(this.state)
  }

  async componentDidMount() {
      this.setState(this.props.annotationData)
  }

  async componentWillReceiveProps(next) {

      this.setState(next.annotationData)

  }


  render() {

    var descriptors = ["outcomes", "arms", "measures", "subgroup_name", "subgroup_level","baseline_level_1","baseline_level_2", "time/period", "other", "p-interaction"]
        descriptors = ["outcomes", "characteristic_name", "characteristic_level", "arms", "measures", "time/period", "other", "p-interaction"]


    return (
      <div style={{marginLeft:0, height: 40}}>
            <RaisedButton
                backgroundColor={"#ffadad"}
                style={{marginRight:35}}
                onClick={() => {this.props.deleteAnnotation()}}
                label= {"Delete"}
              />
            <SelectField
                value={this.state.location}
                onChange={(event,index,value) => {this.handleChange(event,index,value,"location")}}
                style={{width:130, top: 25}}
                >
                <MenuItem value={"Col"} key={1} primaryText={"Column"} />
                <MenuItem value={"Row"} key={2} primaryText={"Row"} />
            </SelectField>

            <TextField
                  value={this.state.number}
                  hintText="N"
                  onChange={(event,value) => {this.handleChange(event,"",value,"number")}}
                  style={{width:20,marginLeft:20}}
                />

           <MultiplePopover
                            value={this.state.content}
                            variable={"content"}
                            options={descriptors}
                            updateAnnotation={ (values) => { this.handleMultiChoice("content",values) } }
                            />

           <MultiplePopover
                            value={this.state.qualifiers}
                            variable={"qualifiers"}
                            options={["plain", "bold", "indented", "itallic", "empty_row","empty_row_with_p_value"]}
                            updateAnnotation={ (values) => { this.handleMultiChoice("qualifiers",values) } }
                            />



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
)(Annotation);
