import React, { Component } from 'react';

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';

import { CopyToClipboard } from 'react-copy-to-clipboard';

class JSONModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      json: '',
      category: [],
      CategoryName: [],
    };
    this.open = this.open.bind(this);
    // this.close = this.close.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  open = category =>
    new Promise((resolve, reject) => {
      this.setState({ isOpen: true, json: category, CategoryName: category.CategoryName });
      this.resolve = resolve;
      this.reject = reject;
    });

  // close = () => {
  //   this.setState({ isOpen: false, json: '' });
  //   if (this.reject) {
  //     this.reject('json not entered');
  //   }
  // };

  transition(props) {
    return <Slide direction="up" {...props} />;
  }

  downloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(this.state.json, null, 2)], { type: 'text/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'structure.json';
    element.click();
  };

  render() {
    const { isOpen, json, category, CategoryName } = this.state;
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
        {console.log(category)}
        <DialogTitle id="form-dialog-title">{`${CategoryName[0]} -> ${CategoryName[1]} -> ${
          CategoryName[2]
        }`}</DialogTitle>
        <DialogContent style={{ paddingTop: 0 }}>
          <DialogContentText style={{ width: '700px', paddingTop: '10px', fontWeight: 'bold' }}>
            <b>STRUCTURE</b>
          </DialogContentText>
          <DialogContentText style={{ width: '700px', paddingTop: '10px', fontWeight: 'bold' }}>
            <pre>{JSON.stringify(json, null, 2)}</pre>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CopyToClipboard
            text={JSON.stringify(json, null, 2)}
            onCopy={() => {
              this.props.context.showPopup('Copied successfully');
            }}
          >
            <Button color="primary">Copy</Button>
          </CopyToClipboard>
          <Button
            onClick={() => {
              // this.resolve(true);
              // this.setState({ isOpen: false });
              this.downloadJSON();
            }}
            color="primary"
          >
            Download
          </Button>
          <Button
            onClick={() => {
              this.resolve(true);
              this.setState({ isOpen: false });
            }}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles()(JSONModal);
