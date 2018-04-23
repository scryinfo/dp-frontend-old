import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';

import TextField from 'material-ui/TextField';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';

class PasswordModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      password: '',
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
    this.setState({ isOpen: false });
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
        <DialogContent>
          <DialogContentText style={{ width: '600px' }} />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoFocus
            fullWidth
            value={this.state.password}
            onChange={event => this.setState({ password: event.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ isOpen: false, password: '' })} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.resolve(password);
              this.close();
            }}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles()(PasswordModal);
