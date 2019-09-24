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
import Disk from '@material-ui/icons/Save';

import fetchData from '../network/fetch-data';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

class MetaAnnotator extends Component {
  constructor(props) {
      super()

      var urlparams = new URLSearchParams(window.location.search);

      this.state = {
        user: urlparams.get("user") ? urlparams.get("user") : "",
        page: urlparams.get("page") ? urlparams.get("page") : "",
        docid: urlparams.get("docid") ? urlparams.get("docid") : "",
        opened: true,
        annotationData: props.annotationData,
        concept_metadata: {}, // The actual data in the database, that will hold the data from the interaction with the annotator.
        recommend_cuis: {} // This are the proposed cuis for concepts as per classfier and Peter's manual annotations.
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
  //
  //
  // prepareConceptData = async () => {
  //
  //         let fetch = new fetchData();
  //
  //
  //
  //
  //
  //         var data = this.props.annotationData
  //
  //         data.map( (annotated_record) =>
  //                     Object.keys(annotated_record).map( (qualifier) => {
  //                               var concept = annotated_record[qualifier];
  //                               var stored_qualifier = concepts[qualifier];
  //                               console.log(concept)
  //                               concepts[qualifier] = stored_qualifier ? [...stored_qualifier,concept] : [concept]
  //                 }))
  //
  //
  //             data ? data.rows.map (
  //               item => {
  //                 var matching_term = this.prepareTermForMatching(concept)
  //
  //                 concept_metadata[item.concept] = {
  //                   cuis: item.cuis.length > 0 ? item.cuis.split(";") : ( recommend_cuis[matching_term] ? recommend_cuis[matching_term].cuis.split(";") : [] ),
  //                   cuis_selected: item.cuis_selected.length > 0 ? item.cuis_selected.split(";") : [],
  //                   qualifiers: item.qualifiers.length > 0 ? item.qualifiers.split(";") : [],
  //                   qualifiers_selected: item.qualifiers_selected.length > 0 ? item.qualifiers_selected.split(";") : [],
  //                   matching_term : matching_term,
  //                 }
  //
  //               }) : ""
  //
  //         this.setState({})
  //
  // }

  async componentWillReceiveProps(next) {

    var annotationData = next.annotationData
    var urlparams = new URLSearchParams(window.location.search);

    let fetch = new fetchData();
    var recommend_cuis = await fetch.getConceptRecommend();
    var metadadata = await fetch.getTableMetadata(this.state.docid, this.state.page, this.state.user)


    var concept_metadata = {}
        metadadata ? metadadata.rows.map ( item => { concept_metadata[item.concept] = {
                    cuis: item.cuis.length > 0 ? item.cuis.split(";") : ( recommend_cuis[matching_term] ? recommend_cuis[matching_term].cuis : [] ),
                    cuis_selected : item.cuis_selected.length > 0 ? item.cuis_selected.split(";") : [],
                    qualifiers: item.qualifiers.length > 0 ? item.qualifiers.split(";") : [],
                    qualifiers_selected : item.qualifiers_selected.length > 0 ? item.qualifiers_selected.split(";") : [],
                    matching_term : this.prepareTermForMatching(item.concept),
                  }
                }
              ) : ""

    var concepts = {}

    next.annotationData.map( (annotated_record) => Object.keys(annotated_record).map(
                                (category) => {
                                  var concept = annotated_record[category];
                                  var stored_qualifier = concepts[category];
                                  // console.log(concept+"  , "+stored_qualifier)
                                  concepts[category] = Array.from( new Set( stored_qualifier ? [...stored_qualifier,concept] : [concept] ))
                                }
                              )
                            )


    // adding the placeholder for concepts that have not been assigned yet into concept_metadata.
    Object.keys(concepts).map( category => {
          concepts[category].map( concept => {
                  if ( !concept_metadata[concept] ){
                      var matching_term = this.prepareTermForMatching(concept)
                      concept_metadata[concept] = {
                        cuis: recommend_cuis[matching_term] ? recommend_cuis[matching_term].cuis : [],
                        cuis_selected : [],
                        qualifiers: [],
                        qualifiers_selected : [],
                        matching_term : matching_term,
                      }
                  }
          })
    });

    this.setState({
      user: urlparams.get("user") ? urlparams.get("user") : "",
      page: urlparams.get("page") ? urlparams.get("page") : "",
      docid: urlparams.get("docid") ? urlparams.get("docid") : "",
      annotationData: next.annotationData,
      concept_metadata : concept_metadata,
      recommend_cuis : recommend_cuis,
    })

  }

  prepareTermForMatching = (term) => {

    term = term+""
    term = term.replaceAll(/[^A-z0-9\^ ]/," ")
    term = term.replaceAll('[0-9]+',"$nmbr$")
    term = term.replaceAll(/\^/g, '');
    term = term.replaceAll(' +'," ").trim().toLowerCase()

    return term
  }

  async saveAll() {
        alert("Metadata Changes Saved!")
  }

  updateConceptData = (concept, data) => {

      var current_metadata = this.state.concept_metadata
      var current_concept_data = current_metadata[concept];

      current_concept_data = {
                  cuis: data.assigned_cuis,
                  cuis_selected: data.cuis_selected,
                  qualifiers: data.assigned_qualifiers,
                  qualifiers_selected: data.qualifiers_selected,
                  matching_term: data.matching_term,
              }

      current_metadata[concept] = current_concept_data

      this.setState({concept_metadata : current_metadata})

  }

  // toggleElementSelect = (concept, code, type) => {
  //
  //   var current_metadata = this.state.concept_metadata
  //
  //   debugger;
  //
  // }

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

    let fetch = new fetchData();



    return (
      <Card style={{ width: this.state.opened ? "50%" : 85, minHeight: 600, height: "100%", float: "right", position: "fixed",  top: 0, right: 0, zIndex: 1,overflowY:"scroll"}}>


            <RaisedButton variant={"contained"}
                      style={{width:50,float:"right",margin:2}}
                      onClick={ () => { this.setState({opened: this.state.opened ? false : true}) } }><Eye style={{color : Object.keys(concepts).length > 0 ? "red": "inherit"}}/></RaisedButton>

            {
              this.state.opened ? <RaisedButton variant={"contained"}
                      style={{width:50,float:"left",margin:2,marginLeft:4}}
                      onClick={ () => { this.saveAll() } }><Disk/></RaisedButton> : ""
            }

            <hr style={{marginTop:45,marginLeft:5,marginRight:5}}/>


            {
              this.state.opened && Object.keys(this.state.concept_metadata).length > 0 ?
                  <div style={{margin:10}}>
                  {
                    Object.keys(concepts).map(
                      (v,j) => ["row","col","value"].indexOf(v) > -1 ? ""
                      : <div key = {"concept_"+j} >
                            <h3 style={{fontVariantCaps: "small-caps", fontSize: 30, marginBottom: 3}}>{v}</h3>
                            <div style={{marginLeft:10}}>{concepts[v].map( (concept,i) => {


                              var matching_term = this.prepareTermForMatching(concept)

                              // var concept_exists = this.state.concept_metadata[concept] ? true : false

                              // if ( !concept_exists ){
                              //
                              //   //initialise DB with new element, using recommended_cuis or empty if its not there.
                              //   fetch.setTableMetadata(this.state.docid,
                              //                         this.state.page,
                              //                         concept,
                              //                         this.state.recommend_cuis[matching_term] ? this.state.recommend_cuis[matching_term].cuis.join(";") : "",
                              //                         "Presence",
                              //                         this.state.user )
                              // }
                              // var state = this.state
                              //
                              // debugger

                              return concepts[v].indexOf(concept) < i ? ""
                                    : <MetaItem
                                                key = {"concept_item_"+concept}
                                                term = {concept}
                                                matching_term = { this.state.concept_metadata[concept].matching_term}
                                                assigned_cuis = { this.state.concept_metadata[concept].cuis }
                                                assigned_qualifiers = { this.state.concept_metadata[concept].qualifiers }
                                                cuis_selected = { this.state.concept_metadata[concept].cuis_selected }
                                                qualifiers_selected = {this.state.concept_metadata[concept].qualifiers_selected }
                                                updateConceptData = {this.updateConceptData}
                                      />
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
