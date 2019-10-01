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
        opened: false,
        annotationData: props.annotationData,
        concept_metadata: {}, // The actual data in the database, that will hold the data from the interaction with the annotator.
        recommend_cuis: {}, // This are the proposed cuis for concepts as per classfier and Peter's manual annotations.
        isSaved : false,
        titleSubgroups : props.titleSubgroups || [],
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

    var annotationData = next.annotationData
    var urlparams = new URLSearchParams(window.location.search);

    let fetch = new fetchData();
    var recommend_cuis = next.recommend_cuis
    var metadadata = next.metadata


    var unique_concepts_metadata = []

    var concept_metadata = {}
        metadadata ? metadadata.rows.map ( item => {
                  var matching_term = this.prepareTermForMatching(item.concept)
                  var cuis = item.cuis.length > 0 ? item.cuis.split(";") : ( recommend_cuis[matching_term] ? recommend_cuis[matching_term].cuis : [] )

                  unique_concepts_metadata.push(item.concept)

                  concept_metadata[item.concept] = {
                    cuis: cuis,
                    cuis_selected : item.cuis_selected.length > 0 ? item.cuis_selected.split(";") : [],
                    qualifiers: item.qualifiers.length > 0 ? item.qualifiers.split(";") : [],
                    qualifiers_selected : item.qualifiers_selected.length > 0 ? item.qualifiers_selected.split(";") : [],
                    matching_term : matching_term,
                    istitle: item.istitle,
                  }
                }
              ) : ""

    var concepts = {}

    var unique_concepts_annotation = []


    var concepts_indexing = {}

    var annotationText = this.prepareTermForMatching(this.props.annotationText).toLowerCase()

      next.annotationData ? next.annotationData.map( (annotated_record) => {
                                var cs = Object.keys(annotated_record).map(
                                   (category) => {
                                    var concept = annotated_record[category];


                                    var stored_qualifier = concepts[category];
                                    concepts[category] = Array.from( new Set( stored_qualifier ? [...stored_qualifier,concept] : [concept] ))

                                    if ( ["value","col","row"].indexOf(category) < 0 ){
                                      concepts_indexing[concept] = {index: annotationText.indexOf(concept.toLowerCase()), category : category}
                                      unique_concepts_annotation.push(concept)
                                    }

                                    return concept
                                  }
                                )

                              }
                            ) : ""




    // adding the placeholder for concepts that have not been assigned yet into concept_metadata.
    Object.keys(concepts).map( category => {

          if ( recommend_cuis && ["value","col","row"].indexOf(category) < 0){
            concepts[category].map( concept => {
                    if ( !concept_metadata[concept] ){
                        var matching_term = this.prepareTermForMatching(concept)
                        var cuis = recommend_cuis[matching_term] ? recommend_cuis[matching_term].cuis : []

                        concept_metadata[concept] = {
                          cuis: cuis,
                          cuis_selected :  cuis.length > 0 ? [cuis[0]] : [] ,
                          qualifiers: ["Presence-absense"],
                          qualifiers_selected : ["Presence-absense"],
                          matching_term : matching_term,
                          istitle: false,
                        }
                    }
            })
          }
    });



    if ( unique_concepts_annotation.length > 0 ){
      var title_concepts = unique_concepts_metadata.reduce( (total, currentValue, currentIndex, arr) => {if ( unique_concepts_annotation.indexOf(currentValue) < 0){total.push(currentValue);} return total}, [] )
      // debugger
      // if ( next.titleSubgroups )
      // this.props.addTitleSGS(title_concepts)
    }

    next.titleSubgroups ? next.titleSubgroups.map ( titleSG => {
        var matching_term = this.prepareTermForMatching(titleSG);
        var cuis = recommend_cuis[matching_term] ? recommend_cuis[matching_term].cuis : []

        var alreadyExists = concept_metadata[titleSG] ? true : false
        // debugger
        concept_metadata[titleSG] = {
              cuis: alreadyExists ? concept_metadata[titleSG].cuis : cuis,
              cuis_selected: alreadyExists ? concept_metadata[titleSG].cuis_selected : cuis.length > 0 ? [cuis[0]] : [],
              matching_term: matching_term,
              qualifiers: alreadyExists ? concept_metadata[titleSG].qualifiers : ["Presence-absense"],
              qualifiers_selected: alreadyExists ? concept_metadata[titleSG].qualifiers_selected : ["Presence-absense"],
              istitle: true,
            }

        concepts_indexing[titleSG] = {
          category: "title_subgroup",
          index: -10,
        }



    }) : "";


    var ordered_concepts = Object.keys(concepts_indexing).sort(function(a, b){return concepts_indexing[a].index-concepts_indexing[b].index});


    this.setState({
      user: urlparams.get("user") ? urlparams.get("user") : "",
      page: urlparams.get("page") ? urlparams.get("page") : "",
      docid: urlparams.get("docid") ? urlparams.get("docid") : "",
      annotationData: next.annotationData,
      concept_metadata : concept_metadata,
      recommend_cuis : recommend_cuis,
      concepts_indexing : concepts_indexing,
      ordered_concepts : ordered_concepts,
      isSaved : false,
      titleSubgroups : next.titleSubgroups,
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

        var current_metadata = this.state.concept_metadata


        let fetch = new fetchData();

        await fetch.clearTableMetadata(this.state.docid, this.state.page, this.state.user)

        //debugger



        // remove titles that are not there anymore.
        Object.keys(current_metadata).map( (concept) => {

            if ( current_metadata[concept].istitle && this.state.titleSubgroups.indexOf(concept) < 0 ){
                delete current_metadata[concept]
            }

            if ( current_metadata[concept] && !current_metadata[concept].istitle && Object.keys(this.state.concepts_indexing).indexOf(concept) < 0 ){
                delete current_metadata[concept]
            }


        })


        Object.keys(current_metadata).map( async (concept) => {
          var current_concept = current_metadata[concept]

          await fetch.setTableMetadata(this.state.docid, this.state.page, concept, current_concept.cuis.join(";"),current_concept.cuis_selected.join(";"), current_concept.qualifiers.join(";"), current_concept.qualifiers_selected.join(";"), this.state.user, current_concept.istitle )

        })

        this.setState({isSaved: true, current_metadata: current_metadata})

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
                  istitle: data.istitle,
              }

      current_metadata[concept] = current_concept_data

      this.setState({concept_metadata : current_metadata, isSaved: false})

  }

  render() {


    var concepts_by_category = {}

    if ( this.props.annotationData ){
      var data = this.props.annotationData

      data.map( (annotated_record) =>
                  Object.keys(annotated_record).map( (qualifier) => {
                            var concept = annotated_record[qualifier];
                            var stored_qualifier = concepts_by_category[qualifier];
                            concepts_by_category[qualifier] = stored_qualifier ? [...stored_qualifier,concept] : [concept]
              }))




    }


    return (
      <Card style={{ width: this.state.opened ? "50%" : 85, minHeight: 600, height: "100%", float: "right", position: "fixed",  top: 0, right: 0, zIndex: 1,overflowY:"scroll"}}>


            <RaisedButton variant={"contained"}
                      style={{width:50,float:"right",margin:2}}
                      onClick={ () => { this.setState({opened: this.state.opened ? false : true}) } }><Eye style={{color : Object.keys(concepts_by_category).length > 0 ? "red": "inherit"}}/></RaisedButton>

            {
              this.state.opened ? <RaisedButton variant={"contained"}
                      style={{width:50,float:"left",margin:2,marginLeft:4, color: this.state.isSaved ? "inherit" : "red" }}
                      onClick={ () => { this.saveAll() } }><Disk/></RaisedButton> : ""
            }

            <hr style={{marginTop:45,marginLeft:5,marginRight:5}}/>


            {
              this.state.opened && Object.keys(this.state.concept_metadata).length > 0 ?
                  <div style={{margin:10}}>

                  {this.state.ordered_concepts.map( (concept,i) => {

                              var matching_term = this.prepareTermForMatching(concept)
                              return <MetaItem
                                                key = {"concept_item_"+concept}
                                                term = {concept}
                                                matching_term = { this.state.concept_metadata[concept].matching_term}
                                                assigned_cuis = { this.state.concept_metadata[concept].cuis }
                                                assigned_qualifiers = { this.state.concept_metadata[concept].qualifiers }
                                                cuis_selected = { this.state.concept_metadata[concept].cuis_selected }
                                                qualifiers_selected = {this.state.concept_metadata[concept].qualifiers_selected }
                                                updateConceptData = {this.updateConceptData}
                                                isLevel = {this.state.concepts_indexing[concept].category.toLowerCase().indexOf("level") > -1}
                                                istitle = {this.state.concept_metadata[concept].istitle}
                                      />
                            })}
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
