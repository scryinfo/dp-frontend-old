import React, { Component } from 'react';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
import Stepper, { Step, StepLabel, StepContent } from 'material-ui/Stepper';
import Button from 'material-ui/Button';
import AttachFile from 'material-ui-icons/AttachFile';
import { TextField, Input } from 'material-ui';
import { LinearProgress } from 'material-ui/Progress';

import './Sell.css';
import { MainContext } from '../../../Context';
import { HOST } from '../../../Components/Remote';
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

const getSteps = () => ['Select a file', 'Set a price', 'Submit'];

class Sell extends Component {
  constructor() {
    super();
    this.state = {
      activeStep: 0,
      file: {},
      itemPrice: '',
      uploadCompleted: 0,
      ipfsHash: '',
    };
    this.getTheFile = this.getTheFile.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onFileChangeLocal = this.onFileChangeLocal.bind(this);
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
    const { uploadStatus, file, itemPrice, uploadCompleted, activeStep } = this.state;
    switch (step) {
      case 0:
        return (
          <div>
            <div>First select a file that you would like to upload</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              {/* <div style={{ marginTop: '20px', marginBottom: '10px', fontWeight: '500' }}>
                Or just add the ipfs hash
              </div>
              <div>
                <Input
                  id="ipfsHash"
                  className={classes.textField}
                  placeholder="ipfs hash"
                  // margin="normal"
                  value={this.state.ipfsHash}
                  onChange={e => this.setState({ ipfsHash: e.target.value })}
                />
                <Button
                  className={classes.button}
                  variant="raised"
                  color="primary"
                  // disabled={loading}
                  onClick={() => this.setState({ activeStep: activeStep + 1 })}
                >
                  Confirm
                </Button>
              </div> */}
              {/* <span>{uploadStatus}</span> */}
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <TextField
              id="itemPrice"
              label="Price"
              className={classes.textField}
              type="number"
              margin="normal"
              value={itemPrice}
              onChange={this.setItemPrice}
            />
            <div>
              <Button
                className={classes.button}
                variant="raised"
                color="primary"
                // disabled={loading}
                onClick={() => this.setState({ activeStep: activeStep + 1 })}
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
              {file.name}
            </div>
            <div>
              <span style={{ fontWeight: 800 }}>File size: </span>
              {file.size}kb
            </div>
            <div>
              <span style={{ fontWeight: 800 }}>Price </span>
              {itemPrice} tokens
            </div>
            <div>
              <Button
                className={classes.button}
                variant="raised"
                color="primary"
                // disabled={loading}
                onClick={this.onFileChange}
              >
                Upload
              </Button>
            </div>
            <LinearProgress variant="determinate" value={uploadCompleted} />
          </div>
        );
      default:
        return 'Unknown step';
    }
  }

  async onFileChange() {
    // const server = 'scry';
    this.setState({ uploadStatus: '' });
    const { file } = this.state;
    const { username, address } = this.context.state;
    const { itemPrice } = this.state;

    const data = new FormData();
    data.append('data', file);

    const url = `${HOST}/seller/upload?account=${address}&name=${file.name}&size=${
      file.size
    }&price=${itemPrice}&username=${username}`;
    // Upload file
    try {
      await axios({
        method: 'POST',
        url,
        headers: {
          'content-type': 'multipart/form-data',
          JWT: localStorage.getItem('id_token'),
        },
        data,
        onUploadProgress: progress => {
          const status = Math.floor(progress.loaded / progress.total * 100);
          this.context.showPopup(`Uploading: ${status === 100 ? 99 : status}%`, progress);
        },
      });
      this.context.showPopup('Uploaded successfully');
      this.setState({
        file: {},
        activeStep: this.state.activeStep + 1,
      });
      this.context.getItems();
    } catch (e) {
      console.log(e);
      this.context.showPopup('File already exists, try another');
      this.setState({ activeStep: 0 });
    }
  }

  async onFileChangeLocal() {
    this.setState({ uploadStatus: '' });
    const { file } = this.state;
    const { username, address } = this.context.state;
    const { itemPrice } = this.state;

    const data = new FormData();
    data.append('data', file);

    const url = 'http://127.0.0.1:8080/ipfs/';
    axios({
      method: 'POST',
      url,
      headers: {
        'content-type': 'multipart/form-data',
      },
      data,
      onUploadProgress: progress => {
        const status = Math.floor(progress.loaded / progress.total * 100);
        this.context.showPopup(`Uploading: ${status}% done`);
      },
    })
      .then(response => {
        const ipfsId = response.headers['ipfs-hash'];
        axios({
          method: 'POST',
          url: `${HOST}/seller/upload?account=${address}&name=${file.name}&CID=${ipfsId}&size=${
            file.size
          }&price=${itemPrice}&username=${username}`,
          headers: {
            JWT: localStorage.getItem('id_token'),
          },
        }).then(res => {
          this.context.showPopup('Uploaded successfully');
          this.setState({
            file: {},
            activeStep: this.state.activeStep + 1,
          });
          this.context.getItems();
        });
      })
      .catch(err => {
        console.log(err.request);
        if (err.request.status === 405) {
          console.log('request', err);
          this.context.showPopup('IPFS should be writable');
          return;
        }
        if (!err.request.response) {
          this.context.showPopup(`Please install IPFS`);
          return;
        }
        if (err.request.status === 400) {
          console.log('request', err);
          this.context.showPopup(`File already exists. Try another`);
        }
      });
  }

  getTheFile(event) {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    this.setState({ file, activeStep: this.state.activeStep + 1 });
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
              <div className="sell-stepper">
                <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepperRoot}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                      <StepContent>{this.getStepContent(index, classes)}</StepContent>
                    </Step>
                  ))}
                </Stepper>
                {activeStep === steps.length && (
                  <div>
                    <Button
                      className={classes.button}
                      variant="raised"
                      color="primary"
                      // disabled={loading}
                      onClick={() => this.setState({ activeStep: 0 })}
                    >
                      Upload a new file
                    </Button>
                  </div>
                )}
              </div>
              <div className="recent-items-container">
                <div className="content-title" style={{ marginTop: '30px' }}>
                  Recent Files
                </div>
                <div>
                  <ItemList items={this.context.state.myItems} type="sell" />
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
