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
        cuis_data : props.cuis_data,
        concept_metadata: {},
        recommend_cuis: {}
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

      let fetch = new fetchData();

      var data = await fetch.getTableMetadata(this.state.docid, this.state.page, this.state.user)

      var concept_metadata = {}

          data ? data.rows.map ( item => { concept_metadata[item.concept] = {cuis: item.cuis.split(";"), qualifiers: item.qualifiers.split(";")} }) : ""


      var rec_cuis = await fetch.getConceptRecommend();

      this.setState({concept_metadata : concept_metadata, recommend_cuis : rec_cuis })

  }

  async componentWillReceiveProps(next) {

    var urlparams = new URLSearchParams(window.location.search);

    this.setState({
      user: urlparams.get("user") ? urlparams.get("user") : "",
      page: urlparams.get("page") ? urlparams.get("page") : "",
      docid: urlparams.get("docid") ? urlparams.get("docid") : "",
      cuis_data: next.cuis_data, cuis_data : next.cuis_data
    })

  }

  prepareTermForMatching = (term) => {
    term = term.replaceAll(/[^A-z0-9\^ ]/," ")
    term = term.replaceAll('[0-9]+',"$nmbr$")
    term = term.replaceAll(/\^/g, '');
    term = term.replaceAll(' +'," ").trim().toLowerCase()
    return term
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

    let fetch = new fetchData();

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
                      (v,j) => ["row","col","value"].indexOf(v) > -1 ? ""
                      : <div key = {"concept_"+j} >
                            <h3 style={{fontVariantCaps: "small-caps", fontSize: 30, marginBottom: 3}}>{v}</h3>
                            <div style={{marginLeft:10}}>{concepts[v].map( (concept,i) => {

                              var matching_term = this.prepareTermForMatching(concept)

                              var concept_exists = this.state.concept_metadata[concept] ? true : false

                              if ( !concept_exists ){

                                //initialise DB with new element, using recommended_cuis or empty if its not there.
                                fetch.setTableMetadata(this.state.docid,
                                                      this.state.page,
                                                      concept,
                                                      this.state.recommend_cuis[matching_term] ? this.state.recommend_cuis[matching_term].cuis.join(";") : "",
                                                      "",
                                                      this.state.user )
                              }

                              return concepts[v].indexOf(concept) < i ? ""
                                    : <MetaItem
                                                key = {"concept_item_"+concept}
                                                term = {concept}
                                                matching_term = {matching_term}
                                                cuis_data = {this.state.cuis_data}
                                                assigned_cuis = { this.state.concept_metadata[concept] ? this.state.concept_metadata[concept].cuis : (this.state.recommend_cuis[matching_term] ? this.state.recommend_cuis[matching_term].cuis : []) }
                                                assigned_qualifiers = { (this.state.concept_metadata[concept] && this.state.concept_metadata[concept].qualifiers) || []}
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
