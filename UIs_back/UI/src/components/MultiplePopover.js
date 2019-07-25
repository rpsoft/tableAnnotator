import React from 'react';
import RaisedButton from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';

export default class MultiplePopover extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      checked : {}
    };
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,

    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };


  async componentWillReceiveProps(next) {


    this.setState({checked : next.value})

  }

  updateCheck = (value) => {

    var checked = this.state.checked
        checked[value] = !checked[value]
        this.setState({checked})

        // debugger

    this.props.updateAnnotation(this.state.checked)

  }

  render() {

    var options = this.props.options
    var labelname = this.props.variable ? this.props.variable : "undefined"

    var newLabel = ""

    var keys = Object.keys(this.state.checked)
    for ( var k in keys){
      if(this.state.checked[keys[k]]){
        newLabel = newLabel+keys[k]+","
      }
    }
    // debugger
      labelname = newLabel.length > 0 ? newLabel : labelname

    return (
      <div style={{display:"inline",marginLeft:15}}>
      <RaisedButton
                onClick={this.handleClick}
                label= {labelname}
              />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            { options ? options.map( (v,o) => {
              return <Checkbox
                        key={o} label={v}
                        checked={ this.state.checked[v] }
                        onCheck={ () => {this.updateCheck(v)}} />} ) : <div></div> }
          </Menu>
        </Popover>
      </div>
    );
  }
}
