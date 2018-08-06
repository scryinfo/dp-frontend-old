import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { TextField, Input, Chip, Paper } from 'material-ui';
import { LinearProgress } from 'material-ui/Progress';

import './Sell.css';
import { MainContext } from '../../../Context';
import ItemList from '../ItemList/ItemList';

import UploadFileModal from '../../UploadFileModal';

const styles = theme => ({
  stepperRoot: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    // width: 180,
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  resetContainer: {
    padding: theme.spacing.unit * 3,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
});

class Sell extends Component {
  state = {
    keywords: [],
    tempKeyword: '',
    uploadModalOpen: false,
  };

  _round = number => Math.round(number * 100) / 100;

  render() {
    const { classes } = this.props;
    const { keywords, tempKeyword } = this.state;

    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <Fragment>
              <div className="content-header">
                <div className="content-title">My Files</div>
                <Button onClick={() => this.setState({ uploadModalOpen: true })}>Upload file ya</Button>
              </div>
              <ItemList items={this.context.state.myItems} type="sell" />
              <UploadFileModal
                open={this.state.uploadModalOpen}
                onClose={() => this.setState({ uploadModalOpen: false })}
              />
            </Fragment>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Sell);
