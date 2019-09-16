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

import CommonStyles from './commom-styles.css';

import fetchData from '../network/fetch-data';


class MetaItem extends Component {

  static displayName = ''; // Esto funciona ! igual que en JAVA.

  constructor(props) {
      super()

      var urlparams = new URLSearchParams(window.location.search);

      this.state = {
        user: urlparams.get("user") ? urlparams.get("user") : "",
        page: urlparams.get("page") ? urlparams.get("page") : "",
        docid: urlparams.get("docid") ? urlparams.get("docid") : "",
        term : props.term,
        matching_term : props.matching_term, // This is the term after processing/cleaning to match it with our knowledge base.
        anchorEl : null,
        assigned_cuis : props.assigned_cuis,
        assigned_qualifiers : props.assigned_qualifiers,
        cuis_data : props.cuis_data,
        cuisearch : "",
        cuisearch_msh_only : true,
        adder_opened : false,
        adder_cui : "",
        adder_text : "",
        dialogType : "cuiAdder"
      }

    }


  handleChange = (event, data, source) => {

  }

  toggleCUI = async (cui) => {
      var assigned_cuis = this.state.assigned_cuis
      var ispresent = assigned_cuis.indexOf(cui)

      if ( ispresent > -1){
        assigned_cuis.splice(ispresent,1)
      } else {
        assigned_cuis.push(cui)
      }


      var state = this.state

      let fetch = new fetchData();
      fetch.setTableMetadata(state.docid, state.page, state.term, assigned_cuis.join(";"), state.assigned_qualifiers, state.user )

      this.setState({assigned_cuis})
  }

  toggleQualifier = async (qualifier) => {
      var assigned_qualifiers = this.state.assigned_qualifiers
      var ispresent = assigned_qualifiers.indexOf(qualifier)

      if ( ispresent > -1){
        assigned_qualifiers.splice(ispresent,1)
      } else {
        assigned_qualifiers.push(qualifier)
      }


      var state = this.state

      let fetch = new fetchData();
      await fetch.setTableMetadata(state.docid, state.page, state.term, state.assigned_cuis, assigned_qualifiers.join(";"), state.user )

      this.setState({assigned_qualifiers})
  }

  handleCUIClick = (event, cui) => {
      if ( this.state.dialogType === "cuiAdder"){
        this.toggleCUI(cui)
      } else {
        this.toggleQualifier(cui)
      }
  }

  isAddedCui = (cui) =>{
    return (this.state.assigned_cuis.indexOf(cui) > -1)
  }

  toggleAdder = () => {

    var isopened = this.state.adder_opened ? false : true

    if ( isopened ){
        this.setState({adder_cui: "", adder_text: ""})
    }

    this.setState({adder_opened: isopened})


  }

  async componentDidMount() {

      // this.setState(this.props.annotationData)
  }

  async componentWillReceiveProps(next) {

    var urlparams = new URLSearchParams(window.location.search);

    this.setState({
      user: urlparams.get("user") ? urlparams.get("user") : "",
      page: urlparams.get("page") ? urlparams.get("page") : "",
      docid: urlparams.get("docid") ? urlparams.get("docid") : "",
      matching_term : next.matching_term,
      assigned_cuis : next.assigned_cuis,
      assigned_qualifiers : next.assigned_qualifiers,
      cuis_data : next.cuis_data,
    });

  }

  handleClick = (event, dialogType) => {
    this.setState({anchorEl : event.currentTarget, dialogType : dialogType });
  }

  handleClose = () => {
    this.setState({anchorEl : null});
  }

  handleTextChange = (varname,value) => {

    var newState = {}
    newState[varname] = value
    this.setState(newState);

  }

  render() {

    var concept_CUI_modifiers = ["Presence", "Severity", "Magnitude", "Duration", "Exposed", "Timing", "Accuracy"]

    var cuis_search_results;

    if ( this.state.cuisearch && this.state.cuisearch.length > 1 ){

      cuis_search_results = Object.keys(this.state.cuis_data).reduce( (agg,cui) => {

                if ( this.state.cuisearch_msh_only  && this.state.cuis_data[cui].hasMesh == false ){

                } else {

                    var matches = 0;

                    if ( cui.indexOf(this.state.cuisearch.trim()) > -1 ){
                      matches++
                    }

                    if ( this.state.cuis_data[cui].preferred.indexOf(this.state.cuisearch.trim()) > -1 ){
                      matches++
                    }


                    if ( matches > 0 ){
                      agg[cui] = this.state.cuis_data[cui];
                    }

                }

              return agg;
            },{} );

    }


    //+" / "+this.state.matching_term


    return (
      <div style={{marginBottom:5}}>
            <div style={{display:"inline-block", fontWeight:"bolder"}}>{this.state.term+" : "}</div>

            { this.state.assigned_cuis ? this.state.assigned_cuis.map (
              cui => <div className={"cui_selected"} style={{display:"inline-block", marginLeft:15, cursor:"pointer"}} onClick={ () => {this.toggleCUI(cui)}}>{cui+" [ "+ (this.state.cuis_data[cui] ? this.state.cuis_data[cui].preferred : "") +" ] "}</div>
            ) : ""}

            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={(ev) => this.handleClick(ev,"cuiAdder")} style={{backgroundColor:"#e4ffdd", fontWeight:"bolder"}}>
              + Concept
            </Button>

            <div style={{display:"inline-block", fontWeight:"bolder"}}>{" / "}</div>

            { this.state.assigned_qualifiers ? this.state.assigned_qualifiers.map (
              cui => <div className={"cui_selected"} style={{display:"inline-block", marginLeft:15, cursor:"pointer"}} onClick={ () => {this.toggleQualifier(cui)}}>{cui+" [ "+ (this.state.cuis_data[cui] ? this.state.cuis_data[cui].preferred : "") +" ] "}</div>
            ) : ""}

            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={(ev) => this.handleClick(ev,"qualifierAdder")} style={{backgroundColor:"#d1dcfb", fontWeight:"bolder", marginLeft:5}}>
              + Qualifier
            </Button>

            <Popover
              id={this.state.term+"_menu"}
              anchorEl={this.state.anchorEl}
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left',}}

            >
              {
              this.state.dialogType === "cuiAdder" ? <TextField
                value={this.state.cuisearch}
                placeholder="search concepts here"
                onChange={(event) => {this.setState({cuisearch : event.currentTarget.value})}}
                style={{margin:5}}
                onKeyDown={(event, index) => {
                  if (event.key === 'Enter') {
                      event.preventDefault();
                  }
                }}
                /> : ""
              }
              {
                              // <div style={{display:"inline-block"}}> MSH only? </div>
                              // <Checkbox
                              //   checked={this.state.cuisearch_msh_only}
                              //   onChange={() =>{ this.setState({cuisearch_msh_only : this.state.cuisearch_msh_only ? false : true})}}
                              //   inputProps={{
                              //     'aria-label': 'indeterminate checkbox',
                              //   }}
                              // />
              }

              {
              this.state.dialogType === "cuiAdder" ? <Button onClick={ this.toggleAdder } style={{fontWeight:"bolder",margin:5}}>
                Add New Concept
              </Button> : ""
              }

              {
                this.state.dialogType === "cuiAdder" ? "" : concept_CUI_modifiers.map(
                  (v,i ) => <MenuItem key={v+"_item_"+i } style={{color: this.isAddedCui(v) ? "red" : "black"}} onClick={ (ev) => {this.handleCUIClick(ev,v)} } >
                                {v}
                            </MenuItem>
                )
              }

              {
                this.state.dialogType === "cuiAdder" && cuis_search_results && Object.keys(cuis_search_results).length > 0 ? Object.keys(cuis_search_results).map(
                  (v,i ) => <MenuItem key={v+"_item_"+i} style={{color: this.isAddedCui(v) ? "red" : "black"}} onClick={ (ev) => {this.handleCUIClick(ev,v)} }>
                                  {v+" -- "+cuis_search_results[v].preferred}
                            </MenuItem>
                  ) : ""
              }


              {
                this.state.dialogType === "cuiAdder" && this.state.adder_opened ?
                <div style={{margin:10}}>
                    <hr />
                    <TextField
                      value={this.state.adder_cui}
                      placeholder="concept id here"
                      onChange={ (event) => {this.handleTextChange("adder_cui",event.currentTarget.value)}}
                    />
                    <TextField
                      value={this.state.adder_text}
                      placeholder="concept definition"
                      onChange={ (event) => {this.handleTextChange("adder_text",event.currentTarget.value)}}
                      style={{marginLeft:5,marginRight:5}}
                    />

                    <Button onClick={ () => { }} style={{fontWeight:"bolder",margin:5}}> Add </Button>
                 </div>

                : ""
              }
            </Popover>
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
