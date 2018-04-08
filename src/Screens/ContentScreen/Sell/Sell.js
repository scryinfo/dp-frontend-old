import React, { Component } from 'react';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Icon from 'material-ui/Icon';
import AttachFile from 'material-ui-icons/AttachFile';
import ButtonBase from 'material-ui/ButtonBase';
import Snackbar from 'material-ui/Snackbar';
import CloseIcon from 'material-ui-icons/Close';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import { LinearProgress } from 'material-ui/Progress';

import './Sell.css';
import { MainContext } from '../../../Context';
import { HOST } from '../../../Components/Remote';
import ErrorPopup from '../../ErrorPopup';
import ItemList from '../ItemList/ItemList';

const styles = theme => ({
  stepperRoot: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 180,
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
});

function getSteps() {
  return ['Select a file', 'Set a price', 'Submit'];
}

class Sell extends Component {
  constructor() {
    super();
    this.state = {
      activeStep: 0,
      file: {},
      itemPrice: '',
      uploadCompleted: 0,
    };
    this.getTheFile = this.getTheFile.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.setItemPrice = this.setItemPrice.bind(this);
  }

  handleNext = () => {
    this.setState({
      activeStep: this.state.activeStep + 1,
    });
  };

  handleBack = () => {
    this.setState({
      activeStep: this.state.activeStep - 1,
    });
  };

  getStepContent(step, classes) {
    switch (step) {
      case 0:
        return (
          <div>
            <div>First choose a file that you would like to upload</div>
            <div>
              <label htmlFor="file-input">
                <Button
                  className={classes.button}
                  variant="raised"
                  color="primary"
                  component="label"
                  // disabled={this.state.loading}
                  onClick={this.handleButtonClick}
                >
                  Choose a file
                  <input id="file-input" type="file" name="file" onChange={this.getTheFile} />
                  <AttachFile className={classes.rightIcon} style={{ height: '18px' }} />
                </Button>
              </label>
              <span>{this.state.uploadStatus}</span>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            {/* <div></div> */}
            <TextField
              id="itemPrice"
              label="Price"
              className={classes.textField}
              type="number"
              margin="normal"
              value={this.state.itemPrice}
              onChange={this.setItemPrice}
            />
            <div>
              <Button
                className={classes.button}
                variant="raised"
                color="primary"
                // disabled={this.state.loading}
                onClick={() => this.setState({ activeStep: this.state.activeStep + 1 })}
              >
                Confirm
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div>
              <span style={{ fontWeight: 800 }}>File name: </span>
              {this.state.file.name}
            </div>
            <div>
              <span style={{ fontWeight: 800 }}>File size: </span>
              {this.state.file.size}kb
            </div>
            {/* <div>
              <span style={{ fontWeight: 800 }}>File name: </span>
              {this.state.file.type}
            </div> */}
            <div>
              <span style={{ fontWeight: 800 }}>Price </span>
              {this.state.itemPrice} tokens
            </div>
            <div>
              <Button
                className={classes.button}
                variant="raised"
                color="primary"
                // disabled={this.state.loading}
                onClick={this.onFileChange}
              >
                Upload
              </Button>
            </div>
            <LinearProgress variant="determinate" value={this.state.uploadCompleted} />
          </div>
        );
      default:
        return 'Unknown step';
    }
  }

  renderErrorPopup = () => (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={this.state.errorPopupOpen}
      autoHideDuration={6000}
      onClose={() => this.setState({ errorPopupOpen: false })}
      SnackbarContentProps={{
        className: this.props.classes.errorPopup,
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">{this.state.errorMessage}</span>}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={() => this.setState({ errorPopupOpen: false })}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    />
  );

  async onFileChange(event, server) {
    // event.stopPropagation();
    // event.preventDefault();
    this.setState({ uploadStatus: '', uploadProgress: '', status: '' });
    const { file } = this.state;
    const { username, address } = this.context.state;
    const { itemPrice } = this.state;

    // eslint-disable-next-line
    const data = new FormData();
    data.append('data', file);

    let whereToUpload = 'locally';
    let url = 'http://127.0.0.1:8080/ipfs/';
    if (server === 'scry') {
      url = 'https://dev.scry.info/scry/seller/upload';
      whereToUpload = 'to Scry.info';
    }
    axios({
      method: 'POST',
      url,
      headers: {
        'content-type': 'multipart/form-data',
      },
      data,
      onUploadProgress: progress => {
        const status = Math.floor(progress.loaded / progress.total * 100);
        this.setState({ uploadProgress: status, status: `Uploading ${whereToUpload}: ${status}% done` });
        console.log(progress);
      },
    })
      .then(response => {
        console.log(response);
        const ipfsId = response.headers['ipfs-hash'];
        axios({
          method: 'POST',
          url: `${HOST}/seller/upload?account=${address}&name=${file.name}&CID=${ipfsId}&size=${
            file.size
          }&price=${itemPrice}&username=${username}`,
          headers: {
            Authorization: localStorage.getItem('id_token'),
          },
        }).then(res => {
          console.log('uploaded', res);
          this.setState({
            done: true,
            status: 'Uploaded successfully',
            uploadProgress: 0,
            file: {},
            activeStep: this.state.activeStep + 1,
          });
          this.context.getItems();
          setTimeout(() => this.setState({ status: '', activeStep: 0 }), 3000);
        });
      })
      .catch(err => {
        console.log(err.request);
        if (err.request.status === 405) {
          console.log('request', err);
          this.setState({ status: 'IPFS should be writable', done: true });
          return;
        }
        if (!err.request.response) {
          console.log('Please install IPFS');
          this.setState({
            status: 'Please install IPFS',
            done: true,
            viaScry: true,
            uploadText: 'Install IPFS',
          });
          return;
        }
        if (err.request.status === 400) {
          console.log('request', err);
          this.setState({ status: 'File already exists. Try another', done: true });
        }
      });
  }

  getTheFile(event) {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    console.log('file here', file);
    this.setState({ file, status: '', activeStep: this.state.activeStep + 1 });
  }

  setItemPrice(event) {
    this.setState({ itemPrice: event.target.value });
    event.preventDefault();
  }

  _round = number => Math.round(number * 100) / 100;

  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div className="sell-container">
              <ErrorPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
              <div className="sell-stepper">
                <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepperRoot}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                      <StepContent>
                        {this.getStepContent(index, classes)}

                        {/* <div className={classes.actionsContainer}>
                        <div>
                          <Button disabled={activeStep === 0} onClick={this.handleBack} className={classes.button}>
                            Back
                          </Button>
                          <Button variant="raised" color="primary" onClick={this.handleNext} className={classes.button}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                          </Button>
                        </div>
                      </div> */}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </div>
              <div className="recent-items-container">
                <div className="content-title" style={{ marginTop: '30px' }}>
                  Recent Files
                </div>
                <div>
                  <ItemList items={this.context.state.myItems} />
                </div>
              </div>
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Sell);
