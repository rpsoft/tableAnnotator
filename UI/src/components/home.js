import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import { Link } from 'react-router'
import RaisedButton from 'material-ui/RaisedButton';

import fetchData from '../network/fetch-data';

export default class Home extends Component {

    constructor() {
      super()
      this.state = {
        //isAMobile: (navigator.userAgent.indexOf('Mobile') > -1)? true : false,
      };
    }

  async componentWillMount() {
         let fetch = new fetchData();
         var rawHtml = await fetch.getStaticPage("home")
         this.setState({rawHtml})
   }


  render() {

        var rawContent = this.state.rawHtml ? this.state.rawHtml : "This is Home."


        return <Card style={{marginTop:20,marginBottom:10,padding:15,textAlign:"left"}}>
                    <div dangerouslySetInnerHTML={{__html: rawContent }}></div>
                     {this.props.children}
              </Card>
  }
}
