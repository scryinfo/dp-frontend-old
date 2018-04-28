import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';

import TextField from 'material-ui/TextField';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';

import Slide from 'material-ui/transitions/Slide';

class MnemonicModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      mnemonic: '',
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  open = () =>
    new Promise((resolve, reject) => {
      this.setState({ isOpen: true });
      this.resolve = resolve;
      this.reject = reject;
    });

  close = () => {
    this.setState({ isOpen: false, mnemonic: '' });
    if (this.reject) {
      this.reject('mnemonic not entered');
    }
  };

  transition(props) {
    return <Slide direction="up" {...props} />;
  }

  render() {
    const { isOpen, mnemonic } = this.state;
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        transition={this.transition}
        keepMounted
        open={isOpen}
        onClose={this.close}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Enter your Mnemonic</DialogTitle>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.resolve(mnemonic);
            this.setState({ isOpen: false, mnemonic: '' });
          }}
        >
          <DialogContent style={{ paddingTop: 0 }}>
            <DialogContentText style={{ width: '600px' }}>
              To import your existing vault please enter your mnemonic in the field below
            </DialogContentText>
            <TextField
              id="mnemonic"
              name="mnemonic"
              label="Enter here"
              // placeholder="Placeholder"
              // autoFocus
              multiline
              fullWidth
              value={this.state.mnemonic}
              onChange={event => this.setState({ mnemonic: event.target.value })}
              // className={classes.textField}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.close} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                this.resolve(mnemonic);
                this.setState({ isOpen: false, mnemonic: '' });
              }}
              color="primary"
            >
              Import
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles()(MnemonicModal);
