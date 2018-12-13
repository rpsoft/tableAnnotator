import React, { Component } from 'react';

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

export default class Annotation extends Component {
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

    console.log(prevState)
    this.setState(prevState)
    // debugger
    this.props.addAnnotation(this.state)
  }

  async componentDidMount() {

  }

  render() {

    return (
      <div style={{marginLeft:20, height: 40}}>
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
                  id={"hello"}
                  hintText="N"
                  onChange={(event,value) => {this.handleChange(event,"",value,"number")}}
                  style={{width:20,marginLeft:20}}
                />

           <MultiplePopover variable={"content"}
                            options={["outcomes", "arms", "measures", "subgroup_name", "subgroup_level", "other"]}
                            updateAnnotation={ (values) => { this.handleMultiChoice("content",values) } }
                            />

           <MultiplePopover variable={"qualifiers"}
                            options={["plain", "bold", "indented", "itallic", "empty_row"]}
                            updateAnnotation={ (values) => { this.handleMultiChoice("qualifiers",values) } }
                            />



      </div>
    );
  }
}
