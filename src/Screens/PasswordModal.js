import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';

import TextField from 'material-ui/TextField';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';

class PasswordModal extends Component {
  state = {
    isOpen: false,
    password: '',
  };

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
    this.setState({ isOpen: false, password: '' });
    this.reject('password not entered');
  };

  render() {
    const { isOpen, password } = this.state;
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={isOpen}
        onClose={this.close}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Enter your password</DialogTitle>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.resolve(password);
            this.setState({ isOpen: false, password: '' });
          }}
        >
          <DialogContent
            style={{
              paddingTop: 0,
            }}
          >
            <DialogContentText style={{ width: '600px' }} />
            <TextField
              name="password"
              label="Password"
              type="password"
              autoFocus
              fullWidth
              value={password}
              onChange={event => this.setState({ password: event.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.close} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                this.resolve(password);
                this.setState({ isOpen: false, password: '' });
              }}
              color="primary"
            >
              Confirm
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles()(PasswordModal);
