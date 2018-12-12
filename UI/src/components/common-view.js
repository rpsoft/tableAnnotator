import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router'

import { templateListSet } from '../actions/actions';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import {URL_BASE} from '../links'

import fetchData from '../network/fetch-data';

import Bootstrap from '../../assets/bootstrap.css';
import RaisedButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Divider from 'material-ui/Divider';
import DownArrow from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { push } from 'react-router-redux'

import {StyleSheet} from 'react-native';
import HTMLView from 'react-native-htmlview';

class CommonView extends Component {

  constructor(props) {
    super()
    this.state = {
        table: null
    };

  }

  async componentWillReceiveProps(next) {
        this.loadPageFromProps(next)
  }

  async componentWillMount() {

      this.loadPageFromProps(this.props)
  }

  async loadPageFromProps(props){

    if ( Object.keys(props.location.query).length > 0 &&
        props.location.query.docid && props.location.query.page) {


        let fetch = new fetchData();

        var data = await fetch.getTable(props.location.query.docid,props.location.query.page)
        var allInfo = JSON.parse(await fetch.getAllInfo())

        // debugger
        this.setState({table: data, docid: props.location.query.docid, page: props.location.query.page, allInfo})

    }
   }

   // Retrieve the table given general index and number N.
   shiftTables(n){

     var documentData = this.state.allInfo.available_documents[this.state.docid]
     var current_table_g_index = documentData.abs_pos[this.state.page-1]

     var new_index = current_table_g_index+n

      // check it is not out of bounds on the right
         new_index = new_index > this.state.allInfo.abs_index.length-1 ? this.state.allInfo.abs_index.length-1 : new_index
      //  now left
         new_index = new_index < 0 ? 0 : new_index


     var newDocument = this.state.allInfo.abs_index[new_index]

     this.props.goToUrl("/?docid="+encodeURIComponent(newDocument.docid)+"&page="+newDocument.page)

     console.log("palante: "+n)

   }


   render() {
     // <div dangerouslySetInnerHTML={ {__html:this.state.table+"<script type='text/javascript'>alert('fuck!')</script>"}} ></div>
      return <div>

        <Card id="userData">
          <div> User data </div>

        </Card>

        <Card id="navigation" style={{textAlign:"right"}}>

          <RaisedButton onClick={ () => {this.shiftTables(-1)} }>Previous Table</RaisedButton>
          <RaisedButton onClick={ () => {this.shiftTables(1)} }>Next Table</RaisedButton>;

        </Card>

        <Card id="tableHolder">

          <HTMLView
                  value={this.state.table}
                  stylesheet={styles}
                />
        </Card>

        <Card id="annotations">
          <div> annotations </div>

        </Card>

      </div>
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
)(CommonView);
