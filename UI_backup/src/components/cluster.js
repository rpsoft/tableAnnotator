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

import SelectField from 'material-ui/SelectField';

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
        open: props.open,
        searchTerm: "",
        currentPage: props.currentPage,
        clusters: props.clusters,
        checkedConcepts : props.checkedConcepts,
        excluded_cuis : props.excluded_cuis,
        rep_cuis : props.rep_cuis,
        cluster_status : props.status,
        highlighted_cui : "",
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

        this.setState({ item: props.item,
          currentPage: props.currentPage,
          cluster_status : props.status,
          excluded_cuis : props.excluded_cuis,
          rep_cuis : props.rep_cuis,
          open : props.open})
    }


  async componentDidMount() {
    this.loadPageFromProps(this.props)
  }

  async componentWillReceiveProps(next) {

    this.loadPageFromProps(next)
  }

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

          var cs
            try{
             cs = citem.cuis.split(";")
           } catch (e ){
             cs = []
           }

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



        var status = <SelectField
                        value={this.state.cluster_status}
                        onChange={(v,i,newStatus) => {this.props.handleClusterDataChange(newStatus, currentCluster, "status")}}
                        hintText="Status"
                        style={{width:60,top:30, marginRight: -10}}
                        underlineStyle={{display:"none"}}
                      >
                          <MenuItem key={"completedchecked"} value={"completedchecked"} primaryText={<DoubleTick style={{color: "blue"}} />} />
                          <MenuItem key={"completed"} value={"completed"} primaryText={<Tick style={{color: "green"}} />} />
                          <MenuItem key={"inprogress"} value={"inprogress"} primaryText={<Alert style={{color: "#cfcf20"}} />} />
                          <MenuItem key={"unhelpful"} value={"unhelpful"} primaryText={<RemoveCircle style={{color: "red"}} />} />



                      </SelectField>


        var headerStyle = {textAlign:"center",fontWeight:"bold"}


        return (
          <div style={{marginLeft:0, marginBottom: this.state.open ? 10 : 0, marginTop: 0}}
                onMouseEnter={this.onMouseEnterHandler}
                onMouseLeave={this.onMouseLeaveHandler}>

              <div> <div style={{display:"inline", cursor:"pointer", fontWeight:"bold"}}> { status } </div> { (currentCluster == -10 ? "discard" : currentCluster) +" : "+ "n = "+this.state.item.length+" : "+ this.state.item[0].concept }
                <div style={{display:"inline", cursor:"pointer", fontWeight:"bold"}} onClick={ () => this.props.handleOpen(currentCluster) }> { this.state.open ? "[-]" : "[+]" } </div>


                {
                  this.props.anyChecked ?
                <div style={{display:"inline", color:  (this.state.hover ? "red" : "white") , cursor:"pointer", fontWeight: this.state.hover ? "bold" : ""}}
                     onClick={ () => this.props.moveAllHere(currentCluster) }
                     onMouseEnter={this.onMouseEnterHandler}
                     onMouseLeave={this.onMouseLeaveHandler}>
                     > Move Here </div>
                     : ""
                }

              </div>

              { this.state.open ?

                <table style={{marginTop:30}}>
                <tbody>

                  <tr>
                    <td style={{verticalAlign:"top"}}>{
                        this.state.item.map( (citem,i) => {

                          return <div key={i} style={{marginLeft:10}}>
                                    <input type="checkbox"
                                           checked={this.props.isChecked(citem.concept)}
                                           onClick={ () => this.props.toggleCheck(citem.concept, citem.cn_override ? citem.cn_override : citem.cn) } />
                                           <div style={{display:"inline"}}>{citem.concept}</div>
                                           <div style={{display:"inline", marginLeft: 5, fontSize: 12}}>

                                           <div style={{display:"inline"}}>[</div>{

                                             citem.cuis ? citem.cuis.split(";").map(
                                               (cui,i) => <div style={{display:"inline", color: this.state.highlighted_cui == cui ? "blue" : "black", cursor:"pointer", fontWeight : this.state.highlighted_cui == cui ? "bolder" : "normal"}}
                                                               key={i}
                                                               onMouseEnter={ () => this.setState({highlighted_cui : cui})}
                                                               onMouseLeave={ () => this.setState({highlighted_cui : this.state.highlighted_cui == cui ? "" : this.state.highlighted_cui})}
                                               > {cui} </div>
                                             ) : ""

                                           }<div style={{display:"inline"}}>]</div>

                                           </div>


                                 </div>
                        })
                    }</td>
                    <td style={{verticalAlign:"top"}}>
                      <div style={{overflowY: "scroll", maxHeight:"80vw"}}>
                      <table style={{borderLeft: "4px dotted grey", marginLeft:5}}>
                        <thead>

                                <tr>
                                  <td style={headerStyle}><DetaultIcon style={{color: "green"}} /> </td>
                                  <td style={headerStyle}><RemoveCircle style={{color: "red"}} /> </td>
                                  <td style={headerStyle}>#</td>
                                  <td style={headerStyle}>CUI</td>
                                  <td style={headerStyle}>Msh</td>
                                  <td style={headerStyle}>CUI Text</td>

                                </tr>

                        </thead>
                        <tbody >

                              {orderedCUIS.map(
                                (c,i) => <tr key={i}>
                                    <td><input type="checkbox" checked={this.props.rep_cuis.indexOf(c) > -1 ? true : false} onClick={() => this.props.handleClusterDataChange(c, currentCluster, "rep") } /></td>
                                    <td><input type="checkbox" checked={this.props.excluded_cuis.indexOf(c) > -1 ? true : false } onClick={() => this.props.handleClusterDataChange(c, currentCluster, "exclude")  } /></td>
                                    <td>{cuis[c]}</td>
                                    <td style={{cursor:"pointer", color: this.state.highlighted_cui == c ? "blue" : "black", fontWeight : this.state.highlighted_cui == c ? "bolder" : "normal"}}
                                        onMouseEnter={ () => this.setState({highlighted_cui : c})}
                                        onMouseLeave={ () => this.setState({highlighted_cui : this.state.highlighted_cui == c ? "" : this.state.highlighted_cui})} >{c}</td>
                                    <td style={{textAlign:"center"}}>{ this.props.cuis_index[c].hasMSH == "true" ? " * " : ""}</td>
                                    <td>{this.props.cuis_index[c].preferred}</td>
                                </tr> )
                            }

                        </tbody>
                      </table>
                      </div>
                    </td>

                  </tr>
                  </tbody>
                </table>
                 : ""}
          </div>
        );
    } else {

      return <div></div>
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
