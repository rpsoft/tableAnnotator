import React, { Component } from 'react';

// import createPalette from '@material-ui/styles/createPalette';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';


import muiLMSTheme from '../muiLMSTheme';

const muiTheme = createMuiTheme(muiLMSTheme)


//
/**
 * Component that handles default App layout.
 *
 * React container pattern. The container component explained:
 * https://medium.com/@learnreact/container-components-c0e67432e005#.iu4v0nc2d
 *
 * Example usage (please look at ./src/routes.js):
 * ```
 * var routes = (history) => (
 *   <Router history={history}>
 *     <Route path="/" component={AppContainer}>
 *       <IndexRoute component={Dashboard} />
 * ```
 */

import AnnotationView from './annotation-view';

export default class TableContainer extends Component {
  render() {
    return (
     <div id="maincontainer" style={{height:"calc(100%)",  backgroundSize: "52%",backgroundAttachment:"fixed", backgroundColor:"grey", paddingTop:10,paddingBottom:10, minWidth:1200}}>
       <MuiThemeProvider theme={ muiTheme }>
         <AnnotationView {...this.props} />
       </MuiThemeProvider>
     </div>
    );
  }
}
