
import React, { Component } from 'react';

// import createPalette from '@material-ui/styles/createPalette';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';


import muiLMSTheme from '../muiLMSTheme';


import ClusterResultsView from './cluster-results-view';
// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = createMuiTheme(muiLMSTheme)

export default class ClusterResultsContainer extends Component {
  render() {
    return (
     <div id="maincontainer" style={{height:"calc(100%)",  backgroundSize: "52%",backgroundAttachment:"fixed"}}>
       <MuiThemeProvider theme={ muiTheme }>
         <ClusterResultsView {...this.props} />
       </MuiThemeProvider>
     </div>
    );
  }
}
