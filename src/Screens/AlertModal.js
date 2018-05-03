import React, { Component } from 'react';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';

import { CopyToClipboard } from 'react-copy-to-clipboard';

class MnemonicModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      mnemonic: '',
    };
    this.open = this.open.bind(this);
    // this.close = this.close.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  open = mnemonic =>
    new Promise((resolve, reject) => {
      this.setState({ isOpen: true, mnemonic });
      this.resolve = resolve;
      this.reject = reject;
    });

  // close = () => {
  //   this.setState({ isOpen: false, mnemonic: '' });
  //   if (this.reject) {
  //     this.reject('mnemonic not entered');
  //   }
  // };

  transition(props) {
    return <Slide direction="up" {...props} />;
  }

  render() {
    const { isOpen } = this.state;
    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        transition={this.transition}
        keepMounted
        open={isOpen}
        // onClose={this.close}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Save the key</DialogTitle>
        <DialogContent style={{ paddingTop: 0 }}>
          <DialogContentText style={{ width: '600px' }}>
            This is a secret key for your vault. Please save it locally. It cannot be restored.
          </DialogContentText>
          <DialogContentText style={{ width: '600px', paddingTop: '10px', fontWeight: 'bold' }}>
            {this.state.mnemonic}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CopyToClipboard
            text={this.state.mnemonic}
            onCopy={() => {
              this.props.context.showPopup('Copied successfully');
            }}
          >
            <Button color="primary">Copy</Button>
          </CopyToClipboard>
          <Button
            onClick={() => {
              this.resolve(true);
              this.setState({ isOpen: false });
            }}
            color="primary"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles()(MnemonicModal);
