
import React, { Component } from 'react';

// import createPalette from '@material-ui/styles/createPalette';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';


import muiLMSTheme from '../muiLMSTheme';


import CuiAdminView from './cui-admin-view';
// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors
const muiTheme = createMuiTheme(muiLMSTheme)

export default class CuiAdminContainer extends Component {
  render() {
    return (
     <div id="maincontainer" style={{height:"calc(100%)",  backgroundSize: "52%",backgroundAttachment:"fixed"}}>
       <MuiThemeProvider theme={ muiTheme }>
         <CuiAdminView {...this.props} />
       </MuiThemeProvider>
     </div>
    );
  }
}
