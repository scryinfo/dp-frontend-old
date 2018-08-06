import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import AttachFile from 'material-ui-icons/AttachFile';
import Check from 'material-ui-icons/Check';
import CloudUpload from 'material-ui-icons/CloudUpload';
import { TextField, Input, Chip, Modal } from 'material-ui';
import { LinearProgress } from 'material-ui/Progress';

import { Button as ButtonSem, Checkbox, Form, Progress } from 'semantic-ui-react';

import Dropzone from 'react-dropzone';

import 'semantic-ui-css/semantic.min.css';

import { MainContext } from '../Context';
import { API } from '../Components/Remote';
import { uploadFile, uploadFileToPublisher } from '../Components/requests';

import UploadIcon from '../assets/images/cloud_upload.png';

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
    files: [],
    itemPrice: '',
    keywords: [],
    tempKeyword: '',
    progress: '',
    uploadStatus: '',
  };

  resetState = () => {
    this.setState({
      files: [],
      itemPrice: '',
      keywords: [],
      tempKeyword: '',
      progress: '',
      uploadStatus: '',
    });
  };

  // ============== START KEYWORDS =================
  addKeyword = keyword => event => {
    if (event) {
      event.preventDefault();
    }
    this.setState(state => {
      const keywords = [...state.keywords];
      const keywordToAdd = keywords.indexOf(keyword);
      if (keywordToAdd !== -1) {
        return {};
      }
      keywords.push(keyword);
      return { keywords, tempKeyword: '' };
    });
  };

  handleKeywordEnter = event => {
    this.setState({ tempKeyword: event.target.value });
  };

  deleteKeyword = keyword => () => {
    this.setState(state => {
      const keywords = [...state.keywords];
      const keywordToDelete = keywords.indexOf(keyword);
      keywords.splice(keywordToDelete, 1);
      return { keywords };
    });
  };
  // ============== END KEYWORDS =================

  _round = number => Math.round(number * 100) / 100;

  onDrop = files => this.setState({ files });

  uploadFile = async () => {
    const { files, itemPrice, isStructured } = this.state;
    // IF NO FILE ADDED
    if (!files[0]) {
      this.context.showPopup('No file selected');
      return;
    }
    // IF NO PRICE SET
    if (!itemPrice) {
      this.context.showPopup('Price not set');
      return;
    }
    // ALL GOOD! UPLOAD THE FILE
    try {
      isStructured ? await this.uploadStructured() : await this.uploadBinary();
      this.closeModal();
      this.context.getItems();
      this.context.showPopup('Uploaded successfully');
    } catch (e) {
      if (e && e.response && e.response.data && e.response.data.message) {
        this.context.showPopup(e.response.data.message);
        return;
      }
      if (e && e.message) {
        this.context.showPopup(e.message);
        return;
      }
      this.context.showPopup('Something went wrong:(');
    }
  };

  uploadBinary = async () => {
    const { itemPrice, files } = this.state;
    const data = new FormData();
    data.append('data', files[0]);
    await uploadFile({
      price: itemPrice,
      data,
      getProgress: this.getProgress,
    });
  };

  uploadStructured = async () => {
    const { keywords, itemPrice, category, files } = this.state;

    const listingInfo = {
      category_name: JSON.parse(category),
      price: itemPrice,
      filename: files[0].name,
      keywords: keywords[0] ? keywords.join(', ') : '',
    };
    const listingInfoFile = new Blob([JSON.stringify(listingInfo)], { type: 'application/json' });
    const data = new FormData();
    data.append('data', files[0]);
    data.append('listing_info', listingInfoFile);
    await uploadFileToPublisher({
      data,
      getProgress: this.getProgress,
    });
  };

  closeModal = () => {
    this.resetState();
    this.props.onClose();
  };

  getProgress = progress => {
    this.setState({ progress, uploadStatus: `${progress}%` });
  };

  render() {
    const { classes } = this.props;
    const { keywords, tempKeyword, files, itemPrice } = this.state;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <Modal open={this.props.open} onClose={this.closeModal}>
              <div
                style={{
                  position: 'absolute',
                  top: `50%`,
                  left: `50%`,
                  transform: `translate(-50%, -50%)`,
                  // minWidth: 750,
                  // minHeight: 100,
                  // maxHeight: '80%',
                  // overflow: 'scroll',
                  backgroundColor: 'white',
                }}
              >
                <div
                  style={{
                    width: 850,
                    minHeight: 450,
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <div
                    style={{
                      height: 50,
                      borderBottom: '2px solid rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingLeft: 20,
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'rgba(0,0,0,0.7)',
                    }}
                  >
                    Upload a file
                  </div>
                  <div style={{ width: 850, minHeight: 400 }}>
                    <div style={{ margin: 40, display: 'flex', flexDirection: 'row' }}>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Dropzone
                          onDrop={this.onDrop}
                          acceptStyle={{
                            border: '2px dashed #4AA4E0',
                          }}
                          multiple={false}
                          style={{
                            width: 333,
                            height: 333,
                            border: `2px dashed ${!files[0] ? 'rgb(102, 102, 102)' : '#4AA4E0'}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                          }}
                        >
                          {files[0] ? (
                            <Check nativeColor="#4AA4E0" style={{ width: 35, height: 35 }} />
                          ) : (
                            <CloudUpload nativeColor="rgba(0,0,0,0.5)" style={{ width: 35, height: 35 }} />
                          )}
                          {/* <img src={UploadIcon} style={{ width: 30, height: 30 }} alt="" /> */}
                          <p
                            style={{
                              width: '70%',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: 'rgba(0,0,0,0.6)',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {files[0] ? files[0].name : 'Drop a file to upload or click to browse'}
                          </p>
                        </Dropzone>
                      </div>
                      <div style={{ flex: 1, marginLeft: 30, marginRight: 10 }}>
                        <Form>
                          <Form.Field>
                            <label>Price</label>
                            <input
                              value={itemPrice}
                              onChange={e => this.setState({ itemPrice: e.target.value })}
                              type="number"
                              placeholder="E.g:  1042 (tokens)"
                            />
                          </Form.Field>
                          <Form.Field>
                            <Checkbox
                              onChange={(e, result) => this.setState({ isStructured: result.checked })}
                              label="Is structured?"
                            />
                          </Form.Field>
                          <Form.Field>
                            <label>Category</label>
                            <Form.Select
                              disabled={!this.state.isStructured}
                              onChange={(e, result) => this.setState({ category: result.value })}
                              options={context.state.categories}
                              placeholder="none"
                            />
                          </Form.Field>
                          <Form.Field style={{ marginBottom: 0 }}>
                            <label>Keywords</label>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                              <input
                                disabled={!this.state.isStructured}
                                value={tempKeyword}
                                onChange={this.handleKeywordEnter}
                                placeholder="Please enter keywords"
                              />
                              <ButtonSem disabled={!this.state.isStructured} onClick={this.addKeyword(tempKeyword)}>
                                Add
                              </ButtonSem>
                            </div>
                          </Form.Field>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              minHeight: 43,
                              marginTop: 5,
                              marginBottom: 5,
                              alignItems: 'center',
                              maxWidth: '100%',
                              flexWrap: 'wrap',
                            }}
                          >
                            {keywords.map(keyword => (
                              <Chip
                                key={keyword}
                                label={keyword}
                                onDelete={this.deleteKeyword(keyword)}
                                className={classes.chip}
                              />
                            ))}
                          </div>
                          <ButtonSem
                            onClick={this.uploadFile}
                            style={{ width: '100%', height: 36, position: 'relative' }}
                            type="submit"
                          >
                            {this.state.uploadStatus && (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  position: 'absolute',
                                  borderRadius: 5,
                                  top: 0,
                                  left: 0,
                                }}
                              >
                                <Progress id="upload-progress" size="large" percent={this.state.progress} indicating />
                              </div>
                            )}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: 36,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {this.state.uploadStatus ? this.state.uploadStatus : 'Upload'}
                            </div>
                          </ButtonSem>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Sell);
