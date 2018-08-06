import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import { Button, Typography, Modal, TextField, Select } from 'material-ui';
import { InputLabel, InputAdornment } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { CircularProgress } from 'material-ui/Progress';

import axios from 'axios';

import { saveAs } from 'file-saver/FileSaver';

// import { createWriteStream } from 'streamsaver';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import classNames from 'classnames';

import { _buyItem, _closeTransaction, _verifyItem, _downloadFile } from '../../../Components/requests';
import { API } from '../../../Components/Remote';
import PasswordModal from '../../PasswordModal';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  roo: {
    width: '5%',
  },
  table: {
    minWidth: 700,
  },
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 70,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  select: {
    maxHeight: '200px',
    minWidth: '50px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

class ItemModal extends Component {
  state = {
    verifier: '',
    reward: 0,
    loader: {},
  };

  // DOWNLOAD THE FILE
  downloadFile = async ({ cid, name, context }) => {
    this.spinLoader('download');
    try {
      const { data: blob } = await _downloadFile(cid);
      console.log({ blob });
      context.showPopup('Download has started');
      saveAs(blob, name);
    } catch (e) {
      console.log(e);
      context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('download');
    }
  };

  // PURCHASE ITEM
  buyItem = async ({ item, context }) => {
    const { username, address } = context.state;
    const { verifier, reward } = this.state;
    this.spinLoader('buy');
    try {
      await this.checkForErrors({ item, context });
      const password = await this.passwordModal.open();
      await _buyItem({ listing: item, username, password, buyer: address, verifier, rewardPercent: Number(reward) });
      context.showPopup('purchased successfully');
      context.updateState({ item: null, action: '' });
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          context.showPopup('You was logged out');
          context.logout();
          return;
        }
      }
      if (e && e.message) {
        context.showPopup(e.message);
        return;
      }
      context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('buy');
    }
  };

  // Loader
  spinLoader = action => {
    this.setState({
      loader: {
        [action]: true,
      },
    });
  };
  stopLoader = action => {
    this.setState({
      loader: {
        [action]: false,
      },
    });
  };

  formatFileSize = (bytes, decimalPoint) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const dm = decimalPoint || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  renderStatus = item => {
    if (item.needs_verification) return 'Waiting for verification';
    if (item.need_closure) return "Waiting for seller's authorization";
    return 'Purchased';
  };

  checkForErrors = ({ item, context }) =>
    new Promise((resolve, reject) => {
      const { verifier, reward } = this.state;
      if (verifier && verifier !== 'none') {
        // check if reward correct
        if (reward < 1 || reward > 99) {
          reject('reward should be more than 1% and less than 99%');
          return;
        }
      }
      if (context.state.balance.tokens < item.price) {
        reject("you don't have enough tokens");
        return;
      }
      resolve();
    });

  // Verify an item
  verify = async ({ itemHistory: item, context }) => {
    const { username } = context.state;
    if (context.state.balance.tokens === 0) {
      context.showPopup('please get some tokens');
      return;
    }

    this.spinLoader('verify');
    try {
      const password = await this.passwordModal.open();
      await _verifyItem(item, username, password);
      context.updateState({ item: null });
      // this.props.history.push('/verified');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          context.showPopup('You was logged out');
          context.logout();
          return;
        }
      }
      context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('verify');
    }
  };

  // Close transaction
  closeTransaction = async ({ item, context }) => {
    const { username } = context.state;
    if (context.state.balance.tokens === 0) {
      context.showPopup('please get some tokens');
      return;
    }

    this.spinLoader('closeTransaction');
    try {
      const password = await this.passwordModal.open();
      await _closeTransaction(item.id, username, password);
      context.showPopup('transaction closed');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          context.showPopup('You was logged out');
          context.logout();
          return;
        }
      }
      if (e && e.response && e.response.data) {
        const { message } = e.response.data;
        context.showPopup(message);
        return;
      }
      context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('closeTransaction');
    }
  };

  verifyModal = ({ context, item: itemHistory, classes }) => {
    const item = itemHistory.listing;
    const { loader } = this.state;
    return (
      <Modal open={!!item} onClose={() => context.updateState({ item: null })}>
        <div
          style={{
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
          }}
          className={classes.paper}
        >
          {/* ITEM NAME */}
          <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
            {item.name}
          </Typography>

          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Buyer:</span> {itemHistory.buyer.name}
          </Typography>

          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
          </Typography>

          {/* ITEM PRICE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Price:</span> {item.price} tokens
          </Typography>

          {/* VERIFIER REWARD */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Verifier reward:</span> {itemHistory.rewards} tokens
          </Typography>

          {/* ITEM SIZE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>File size:</span> {this.formatFileSize(item.size)}
          </Typography>

          {/* FILE UPLOADED DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>

          {/* PURCHASE DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Purchase date:</span> {itemHistory.created_at}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Button
                disabled={loader.download}
                onClick={() => this.downloadFile({ cid: item.cid, name: item.name, context })}
              >
                DOWNLOAD
              </Button>
              {loader.download && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
            <CopyToClipboard
              text={item.cid}
              onCopy={() => {
                context.showPopup('Copied to clipboard');
              }}
            >
              <Button>Copy ipfs hash</Button>
            </CopyToClipboard>
            {itemHistory.needs_verification ? (
              <div style={{ position: 'relative' }}>
                <Button disabled={loader.verify} onClick={() => this.verify({ itemHistory, context })}>
                  VERIFY
                </Button>
                {loader.verify && <CircularProgress size={24} className={classes.buttonProgress} />}
              </div>
            ) : itemHistory.needs_closure ? (
              <Button disabled>Waiting for seller's authorization</Button>
            ) : (
              <Button disabled>Completed</Button>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  closeTransactionModal = ({ context, item: itemHistory, classes }) => {
    const { loader } = this.state;
    const item = itemHistory.listing;
    return (
      <Modal open={!!item} onClose={() => context.updateState({ item: null, type: '' })}>
        <div
          style={{
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
          }}
          className={classes.paper}
        >
          {/* ITEM NAME */}
          <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
            {item.name}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Buyer:</span> {itemHistory.buyer.name}
          </Typography>
          {/* ITEM PRICE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Item price:</span> {item.price} tokens
          </Typography>
          {itemHistory.verifier && (
            <Fragment>
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier:</span> {itemHistory.verifier.name}
              </Typography>
              {/* VERIFIER REWARD */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier reward:</span> {itemHistory.rewards} tokens
              </Typography>
            </Fragment>
          )}
          {/* ITEM SIZE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Item size:</span> {item.size}
          </Typography>
          {/* PURCHASE DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Purchase date:</span> {itemHistory.created_at}
          </Typography>
          {/* FILE UPLOADED DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>
          {/* ACTION BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div style={{ position: 'relative' }}>
              {itemHistory.needs_verification ? (
                <Button disabled>WAITING FOR VERIFICATION</Button>
              ) : (
                <Button
                  disabled={loader.closeTransaction}
                  onClick={() => this.closeTransaction({ item: itemHistory, context })}
                >
                  AUTHORIZE THE TRANSACTION
                </Button>
              )}
              {loader.closeTransaction && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  buyerItemDetailModal = ({ context, item: itemHistory, classes }) => {
    const item = itemHistory.listing;
    const { loader } = this.state;
    return (
      <Modal open={!!item} onClose={() => context.updateState({ item: null })}>
        <div
          style={{
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
          }}
          className={classes.paper}
        >
          {/* ITEM NAME */}
          <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
            {item.name}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
          </Typography>
          {/* ITEM PRICE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Item price:</span> {item.price} tokens
          </Typography>
          {itemHistory.verifier && (
            <Fragment>
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier:</span> {itemHistory.verifier.name}
              </Typography>
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier reward:</span> {itemHistory.rewards} tokens
              </Typography>
            </Fragment>
          )}
          {/* ITEM SIZE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Item size:</span> {item.size}
          </Typography>
          {/* PURCHASE DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Purchase date:</span> {itemHistory.created_at}
          </Typography>
          {/* FILE UPLOADED DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>
          {/* TOTAL PRICE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Total price:</span>{' '}
            {itemHistory.rewards ? itemHistory.rewards + item.price : item.price} tokens
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'row' }}>
              {itemHistory.needs_verification ? (
                <Button disabled>WAITING FOR VERIFICATION</Button>
              ) : itemHistory.needs_closure ? (
                <Button disabled>WAITING FOR SELLER'S AUTHORIZATION</Button>
              ) : (
                <Fragment>
                  <div style={{ position: 'relative' }}>
                    <Button
                      disabled={loader.download}
                      onClick={() => this.downloadFile({ cid: item.cid, name: item.name, context })}
                    >
                      DOWNLOAD
                    </Button>
                    {loader.download && <CircularProgress size={24} className={classes.buttonProgress} />}
                  </div>
                  <CopyToClipboard
                    text={item.cid}
                    onCopy={() => {
                      context.showPopup('Copied to clipboard');
                    }}
                  >
                    <Button>Copy ipfs hash</Button>
                  </CopyToClipboard>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  uploadedFileModal = ({ context, item, classes }) => (
    <Modal open={!!item} onClose={() => context.updateState({ item: null })}>
      <div
        style={{
          top: `50%`,
          left: `50%`,
          transform: `translate(-50%, -50%)`,
        }}
        className={classes.paper}
      >
        {/* ITEM NAME */}
        <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
          {item.name}
        </Typography>
        {/* FIXME: SELLER NAME */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
        </Typography>
        {/* ITEM PRICE */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Item price:</span> {item.created_at}
        </Typography>
        {/* FIXME: VERIFIER NAME */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Verifier:</span> {item.owner.name}
        </Typography>
        {/* VERIFIER REWARD */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Verifier reward:</span> {item.created_at}
        </Typography>
        {/* ITEM SIZE */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Item size:</span> {item.created_at}
        </Typography>
        {/* PURCHASE DATE */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Purchase date:</span> {item.created_at}
        </Typography>
        {/* FILE UPLOADED DATE */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
        </Typography>
        {/* TOTAL PRICE */}
        <Typography variant="subheading" id="simple-modal-description">
          <span style={{ fontWeight: '600' }}>Total price:</span> {item.created_at}
        </Typography>
        {/* 
                    FIXME: create a status stepper.
                    The idea is to have 3 steps.
                    1. Purchase
                    2. Verify
                    3. Authorize
                  */}

        {/* ACTION BUTTONS */}
        <div>
          <Button>DOWNLOAD THE FILE</Button>
          <Button>COPY IPFS HASH</Button>
        </div>
      </div>
    </Modal>
  );

  purchaseFileModal = ({ context, item, classes }) => {
    const { address } = context.state;
    const { verifier, reward, loader } = this.state;
    return (
      <Modal
        open={!!item}
        onClose={() => {
          context.updateState({ item: null, action: '' });
          this.setState({ verifier: '', reward: 0 });
        }}
      >
        <div
          style={{
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
          }}
          className={classes.paper}
        >
          <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
            {item.name}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Price:</span> {item.price} tokens
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>File size:</span> {this.formatFileSize(item.size)}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!verifier) return;
              this.buyItem({ item, context });
            }}
            style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="controlled-open-select">Verifier</InputLabel>
              <Select
                value={verifier}
                classes={{ select: classes.select }}
                onChange={e => this.setState({ verifier: e.target.value })}
                inputProps={{
                  name: 'verifier',
                  id: 'controlled-open-select',
                }}
              >
                <MenuItem value="none">
                  <em>None</em>
                </MenuItem>

                {context.state.verifiers
                  .filter(ver => ver.account !== item.owner.account && ver.account !== address)
                  .map(ver => (
                    <MenuItem key={ver.id} value={ver.account}>
                      {ver.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {!verifier ? null : verifier === 'none' ? (
              <div style={{ position: 'relative' }}>
                <Button
                  disabled={loader.buy}
                  color="primary"
                  className={classes.button}
                  onClick={() => this.buyItem({ item, context })}
                >
                  Buy
                </Button>
                {loader.buy && <CircularProgress size={24} className={classes.buttonProgress} />}
              </div>
            ) : (
              <Fragment>
                <TextField
                  label="Verifier's reward"
                  type="number"
                  value={reward}
                  onChange={e => this.setState({ reward: e.target.value })}
                  className={classNames(classes.margin, classes.textField)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">%</InputAdornment>,
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <Button
                    disabled={loader.buy}
                    color="primary"
                    className={classes.button}
                    onClick={() => this.buyItem({ item, context })}
                  >
                    Buy
                  </Button>
                  {loader.buy && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
              </Fragment>
            )}
          </form>
        </div>
      </Modal>
    );
  };

  renderModal = ({ page, context, item, classes }) => {
    switch (page) {
      case 'purchased':
        return this.buyerItemDetailModal({ context, item, classes });
      case 'sold':
        return this.closeTransactionModal({ context, item, classes });
      case 'verified':
        return this.verifyModal({ context, item, classes });
      case 'upload':
        return this.uploadedFileModal({ context, item, classes });
      case 'categories':
        return this.purchaseFileModal({ context, item, classes });
      default:
        return this.purchaseFileModal({ context, item, classes });
    }
  };

  render() {
    const { classes, context } = this.props;
    const { item, currentPage } = context.state;

    return (
      <div>
        {!!item && this.renderModal({ page: currentPage, context, item, classes })}
        <PasswordModal
          onRef={ref => {
            this.passwordModal = ref;
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(ItemModal);
