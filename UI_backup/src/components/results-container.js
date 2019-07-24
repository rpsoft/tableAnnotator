
import React, { Component } from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import muiLMSTheme from '../muiLMSTheme';
import ResultsView from './results-view';
// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = getMuiTheme(muiLMSTheme);


export default class ResultsContainer extends Component {
  render() {
    return (
     <div id="maincontainer" style={{height:"calc(100%)",  backgroundSize: "52%",backgroundAttachment:"fixed"}}>
       <MuiThemeProvider muiTheme={ muiTheme }>
         <ResultsView {...this.props} />
       </MuiThemeProvider>
     </div>
    );
  }
}
