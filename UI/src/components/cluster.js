import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router'
import { push } from 'react-router-redux'

import { templateListSet } from '../actions/actions';
import fetchData from '../network/fetch-data';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import TextField from 'material-ui/TextField';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import Dialog from 'material-ui/Dialog';

import Popover from 'material-ui/Popover';
import Checkbox from 'material-ui/Checkbox';

import MultiplePopover from './MultiplePopover'

import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';

import Tick from 'material-ui/svg-icons/action/done';
import DoubleTick from 'material-ui/svg-icons/action/done-all';
import Alert from 'material-ui/svg-icons/alert/error';

import DetaultIcon from 'material-ui/svg-icons/action/check-circle';

class Cluster extends Component {
  constructor(props) {
      super()
      this.state = {
        hover: false,
        item: props.item,
        open: false,
        searchTerm: "",
        selectedTarget: props.item.cn,
        currentPage: props.currentPage,
        clusters: props.clusters,
        checkedConcepts : props.checkedConcepts,
      };

    }

  onMouseEnterHandler = (i,y) => {

        this.setState({
            hover: y ? y : true
        });

  }

  onMouseLeaveHandler = () => {
      this.setState({
          hover: false
      });
  }




  loadPageFromProps = async (props) => {
        this.setState({ item: props.item,  currentPage: props.currentPage })
    }


  async componentDidMount() {
    this.loadPageFromProps(this.props)
  }

  async componentWillReceiveProps(next) {
    this.loadPageFromProps(next)
  }

handleOpen = () => {
   this.setState({open: this.state.open ? false : true});

 };

 handleClose = () => {
   this.setState({open: false});
 };



 summary(cluster) {

  var clusterFreqs = cluster.reduce( (acc,item) => { var cuis = item.cuis.split(";"); for ( var i in cuis ){ var prev = acc[cuis[i]]; prev = prev ? prev+1 : 1; acc[cuis[i]] = prev } return acc} , {});

  var keys = Object.keys(clusterFreqs)
  return <div>{ keys.map( (e,i) => <div key={i}> { e+" : "+clusterFreqs[e] }</div>) }</div>
 }

  render() {

    var normalStyle = {}
    var hoverStyle = {...normalStyle, fontWeight: "bold", cursor : "pointer"}

    if ( this.state.item && this.state.item.length > 0 ){

        var cuis = this.state.item.reduce( (acc, citem) => {

            var cs = citem.cuis.split(";")

            for ( var c in cs){
              if ( acc[cs[c]] ){
                acc[cs[c]] = acc[cs[c]]+1
              } else {
                acc[cs[c]] = 1
              }
            }

            return acc
        } ,{})

        var orderedCUIS = Object.keys(cuis).sort( (a,b) => cuis[b] - cuis[a] )

        var currentCluster = this.props.currentCluster

        var headerStyle = {textAlign:"center",fontWeight:"bold"}

        return (
          <div style={{marginLeft:0, marginBottom: this.state.open ? 10 : 0}}
                onMouseEnter={this.onMouseEnterHandler}
                onMouseLeave={this.onMouseLeaveHandler}>

              <div> { (currentCluster == -10 ? "discard" : currentCluster) +" : "+ "n = "+this.state.item.length+" : "+ this.state.item[0].concept }
                <div style={{display:"inline", cursor:"pointer", fontWeight:"bold"}} onClick={ this.handleOpen }> { this.state.open ? "[-]" : "[+]" } </div>

                {
                  this.props.anyChecked ?
                <div style={{display:"inline", color:"red", cursor:"pointer", fontWeight: this.state.hover ? "bold" : ""}}
                     onClick={ () => this.props.moveAllHere(currentCluster) }
                     onMouseEnter={this.onMouseEnterHandler}
                     onMouseLeave={this.onMouseLeaveHandler}>
                     > Move Here </div>
                     : ""
                }

              </div>

              { this.state.open ?

                <table >
                <tbody>

                  <tr>
                    <td style={{verticalAlign:"top"}}>{
                        this.state.item.map( (citem,i) => {

                          return <div key={i} style={{marginLeft:10}}>
                                    <input type="checkbox"
                                           checked={this.props.isChecked(citem.concept)}
                                           onClick={ () => this.props.toggleCheck(citem.concept, citem.cn_override ? citem.cn_override : citem.cn) } />
                                           <div style={{display:"inline"}}>{citem.concept}</div>
                                           <div style={{display:"inline", marginLeft: 5, fontSize: 12}}>{"[ "+citem.cuis+" ]"}</div>
                                 </div>
                        })
                    }</td>
                    <td style={{verticalAlign:"top"}}>
                      <table style={{borderLeft: "4px dotted grey", marginLeft:5}}>
                        <thead>

                                <tr>
                                  <td style={headerStyle}><DetaultIcon style={{color: "green"}} /> </td>
                                  <td style={headerStyle}>#</td>
                                  <td style={headerStyle}>CUI</td>
                                  <td style={headerStyle}>CUI Text</td>
                                  <td style={headerStyle}>Modifier</td>
                                </tr>

                        </thead>
                        <tbody>

                              {orderedCUIS.map(
                                (c,i) => <tr key={i}>
                                    <td><input type="checkbox" checked={false} onClick={false } /></td>
                                    <td>{cuis[c]}</td>
                                    <td>{c}</td>
                                    <td style={{  }}>{this.props.cuis_index[c]}</td>
                                    <td> <select value={""} onChange={(v,i) => this.handleSelectChange( v.target.value, c )}>

                                          <option value=""></option>
                                          <option value="loc">Location</option>
                                          <option value="time">Time/Period</option>
                                          <option value="other">Other</option>

                                        </select>
                                    </td>
                                </tr> )
                            }

                        </tbody>
                      </table>

                    </td>

                  </tr>
                  </tbody>
                </table>
                 : ""}



          </div>
        );
    } else {

      return <div> {this.props.currentCluster + " :: Empty Cluster" } </div>
    }
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
)(Cluster);
