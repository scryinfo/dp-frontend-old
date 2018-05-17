import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { Paper, Button, Collapse, Typography, Modal, TextField, Select } from 'material-ui';
import { InputLabel, InputAdornment } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';

import classNames from 'classnames';

import moment from 'moment';

import { _buyItem, _closeTransaction, _verifyItem } from '../../../Components/requests';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: '#162632',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

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
  row: {
    '&:nth-of-type(odd)': {
      // backgroundColor: theme.palette.background.default,
    },
  },
});

class ItemModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // PURCHASE ITEM
  buyItem = async item => {
    const { username, address } = this.context.state;
    const { verifier, reward } = this.state;
    this.spinLoader('buy');
    try {
      await this.checkForErrors(item);
      const password = await this.passwordModal.open();
      await _buyItem(item, username, password, address, verifier, reward);
      this.context.showPopup('purchased successfully');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      if (e && e.message) {
        this.context.showPopup(e.message);
        return;
      }
      this.context.showPopup(JSON.stringify(e));
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
    console.log({ item });
    if (item.needs_verification) return 'Waiting for verification';
    if (item.need_closure) return 'Waiting for seller';
    return 'Purchased';
  };

  checkForErrors = item =>
    new Promise((resolve, reject) => {
      const { verifier, reward } = this.state;
      if (verifier && verifier !== 'none') {
        // check if reward correct
        if (reward < 1 || reward > 99) {
          reject('reward should be more than 1% and less than 99%');
          return;
        }
      }
      if (this.context.state.balance.tokens < item.price) {
        reject("you don't have enough tokens");
        return;
      }
      resolve();
    });

  // Verify an item
  verify = async item => {
    const { username } = this.context.state;
    if (this.context.state.balance.tokens === 0) {
      this.context.showPopup('please get some tokens');
      return;
    }

    this.spinLoader('verify');
    try {
      const password = await this.passwordModal.open();
      await _verifyItem(item, username, password);
      this.setState({ item: null });
      this.props.history.push('/verified');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      this.context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('verify');
    }
  };

  // Close transaction
  closeTransaction = async item => {
    const { username } = this.context.state;
    if (this.context.state.balance.tokens === 0) {
      this.context.showPopup('please get some tokens');
      return;
    }

    this.spinLoader('closeTransaction');
    try {
      const password = await this.passwordModal.open();
      await _closeTransaction(item.id, username, password);
      this.context.showPopup('transaction closed');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      if (e && e.response && e.response.data) {
        const { message } = e.response.data;
        this.context.showPopup(message);
        return;
      }
      this.context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('closeTransaction');
    }
  };

  verifyModal = () => {
    const { classes, item } = this.props;
    return (
      <Modal open={!!item} onClose={() => this.setState({ item: null })}>
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

          {/* FIXME: BUYER NAME */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Buyer:</span> {item.owner.name}
          </Typography>

          {/* FIXME: SELLER NAME */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
          </Typography>

          {/* ITEM SIZE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>File size:</span> {this.formatFileSize(item.size)}
          </Typography>

          {/* ITEM PRICE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Price:</span> {item.created_at}
          </Typography>

          {/* VERIFIER REWARD */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Verifier reward:</span> {item.created_at}
          </Typography>

          {/* FILE UPLOADED DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>

          {/* PURCHASE DATE */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Purchase date:</span> {item.created_at}
          </Typography>

          {/* ACTION BUTTONS */}
          <div>
            <Button>DOWNLOAD THE FILE</Button>
            <Button>COPY IPFS HASH</Button>
            <Button onClick={() => this.verify(item)}>VERIFY</Button>
          </div>
        </div>
      </Modal>
    );
  };

  closeTransactionModal = () => {
    const { classes, item } = this.props;
    return (
      <Modal open={!!item} onClose={() => this.setState({ item: null })}>
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
          {/* FIXME: BUYER NAME */}
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Buyer:</span> {item.owner.name}
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
          {/* ACTION BUTTON */}
          <div>
            <Button onClick={() => this.closeTransaction(item)}>AUTHORIZE THE TRANSACTION</Button>
          </div>
        </div>
      </Modal>
    );
  };

  buyerItemDetailModal = () => {
    const { classes, item } = this.props;
    return (
      <Modal open={!!item} onClose={() => this.setState({ item: null })}>
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
  };

  purchaseFileModal = () => {
    const { classes, item } = this.props;
    const { address } = this.context.state;
    const { verifier, reward } = this.state;
    return (
      <Modal open={!!item} onClose={() => this.setState({ item: null, verifier: '', reward: '' })}>
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
            <span style={{ fontWeight: '600' }}>Price:</span> {item.price}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            {console.log(item.size)}
            <span style={{ fontWeight: '600' }}>File size:</span> {this.formatFileSize(item.size)}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!verifier) return;
              this.buyItem(item);
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
                {console.log(address)}
                {this.context.state.verifiers
                  .filter(ver => ver.account !== item.owner.account && ver.account !== address)
                  .map(ver => (
                    <MenuItem key={ver.id} value={ver.account}>
                      {ver.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {!verifier ? null : verifier === 'none' ? (
              <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
                Buy
              </Button>
            ) : (
              <Fragment>
                <TextField
                  label="Verifier's reward"
                  id="simple-start-adornment"
                  type="number"
                  value={reward}
                  onChange={e => this.setState({ reward: e.target.value })}
                  className={classNames(classes.margin, classes.textField)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">%</InputAdornment>,
                  }}
                />
                <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
                  Buy
                </Button>
              </Fragment>
            )}
          </form>
        </div>
      </Modal>
    );
  };

  render() {
    const { classes, type } = this.props;
    if (type === 'history') {
      if ('to close transaction') {
        // CLOSE TRANSACTION
      }
      if ('verify') {
        // VERIFY
      }
      if ('buyer checks his file') {
        // CHECK STATUS
      }
      if ('purchase file') {
        // PURCHASE
      }
    }
    return <div />;
  }
}

export default withStyles(styles)(ItemModal);
