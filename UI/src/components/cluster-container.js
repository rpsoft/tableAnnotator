import React, { Component } from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import muiLMSTheme from '../muiLMSTheme';

// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = getMuiTheme(muiLMSTheme);

// import ClusterView from './cluster-view';

export default class ClusterContainer extends Component {
  render() {
    var ChildClass = this.props.route.childRoutes[0].component
    return (
     <div id="maincontainer" style={{height:"calc(100%)",  backgroundSize: "52%",backgroundAttachment:"fixed", backgroundColor:"grey", paddingTop:10,paddingBottom:10}}>
       <MuiThemeProvider muiTheme={ muiTheme }>
         <ChildClass {...this.props} />
       </MuiThemeProvider>
     </div>
    );
  }
}
