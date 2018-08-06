import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import { MainContext } from '../Context';

const styles = theme => ({});

class Listing extends Component {
  state = {};

  render() {
    const { classes } = this.props;

    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return <div>Helo</div>;
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Listing);
