import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import RaisedButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import SelectField from '@material-ui/core/Select';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Card from '@material-ui/core/Card';
import Popover from '@material-ui/core/Popover';
import Checkbox from '@material-ui/core/Checkbox';

import MetaItem from './meta-item'

import Eye from '@material-ui/icons/RemoveRedEye';


class MetaAnnotator extends Component {
  constructor(props) {
      super()
      this.state = {
        opened: true,
        cuis_data : props.cuis_data,
      };

    }

  handleChange = (event, data, source) => {
     var prevState = this.state
     prevState[source] = event.currentTarget.value
     console.log(prevState)
     this.setState(prevState);
     this.props.addAnnotation(this.state)
  };

  async componentDidMount() {
  }

  async componentWillReceiveProps(next) {

    // debugger
    this.setState({cuis_data: next.cuis_data})

  }

  render() {


    var concepts = {}

    if ( this.props.annotationData ){
      var data = this.props.annotationData

      data.map( (annotated_record) =>
                  Object.keys(annotated_record).map( (qualifier) => {
                            var concept = annotated_record[qualifier];
                            var stored_qualifier = concepts[qualifier];
                            concepts[qualifier] = stored_qualifier ? [...stored_qualifier,concept] : [concept]
              }))




    }

    return (
      <Card style={{ width: this.state.opened ? "50%" : 85, minHeight: 600, height: "100%", float: "right", position: "fixed",  top: 0, right: 0, zIndex: 1,overflowY:"scroll"}}>
            <RaisedButton variant={"contained"}
                      style={{width:50,float:"right",margin:2}}
                      onClick={ () => { this.setState({opened: this.state.opened ? false : true}) } }><Eye style={{color : Object.keys(concepts).length > 0 ? "red": "inherit"}}/></RaisedButton>
            <hr style={{marginTop:45,marginLeft:5,marginRight:5}}/>


            {
              this.state.opened ?
                  <div style={{margin:10}}>
                  {
                    Object.keys(concepts).map(
                      v => ["row","col","value"].indexOf(v) > -1 ? ""
                      : <div>
                            <h4>{v}</h4>
                            <div>{concepts[v].map( (concept,i) => {

                              return concepts[v].indexOf(concept) < i ? ""
                                    : <MetaItem term = {concept} cuis_data = {this.state.cuis_data}/>


                            })}</div>
                      </div>)
                  }
                  </div>
                  : ""

            }
      </Card>
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
)(MetaAnnotator);
