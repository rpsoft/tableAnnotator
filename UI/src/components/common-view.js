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

class CommonView extends Component {

  constructor(props) {
    super()

    this.state = {
        table: null
    };



    // if ( Object.keys(props.location.query).length > 0 ) {
    //
    //   this.runSearch()
    // }
  }
  async componentWillReceiveProps(next) {
        this.loadPageFromProps(next)
    }

  async componentWillMount() {
      this.loadPageFromProps(this.props)
   }

  async loadPageFromProps(props){
    let fetch = new fetchData();

    var data = await fetch.getTable("24383720",2)

    this.setState({table: data})
   }

 // updateAdvancedSearch = (adSearch) => {
 //   this.setState({advancedSearch : adSearch, query: adSearch.query })
 // }



 render() {
    //
    // let logoStyle = {height: 50,marginLeft:5}
    // let buttonStyle = {marginRight:10}
    // let bodyStyle = {padding:10, maxWidth:960,minWidth:960,marginLeft:"auto",marginRight:"auto"}
    // let bgStyle = {height: 50,marginLeft:5, backgroundColor: "#002147"}
    //
    // let dividerFormat = {width:"90%",marginLeft:"5%"}
    //
    // let buttonColor = "#e6e6e6"
    // let buttonHoverColor = "#b5b5b5"
    //

    return <div>

      <Card id="userData">
        <div> User data </div>

      </Card>

      <Card id="navigation">
        <div> navigation </div>

      </Card>

      <Card id="tableHolder">
        <div dangerouslySetInnerHTML={ {__html:this.state.table}} ></div>

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
