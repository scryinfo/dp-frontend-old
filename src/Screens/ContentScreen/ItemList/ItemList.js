import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';

import { createWriteStream } from 'streamsaver';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import classNames from 'classnames';

import Button from 'material-ui/Button';

import Modal from 'material-ui/Modal';

import Typography from 'material-ui/Typography';

import { InputLabel, InputAdornment } from 'material-ui/Input';
import TextField from 'material-ui/TextField';

import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import InfoPopup from '../../InfoPopup';

import { _buyItem, _closeTransaction, _verifyItem } from '../../../Components/requests';

import PasswordModal from '../../PasswordModal';

import './ItemList.css';
import { MainContext } from '../../../Context';

import { HOST } from '../../../Components/Remote';

const styles = theme => ({
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
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  select: {
    maxHeight: '200px',
    minWidth: '50px',
  },
});

class ItemList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      verifier: '',
      reward: '',
    };
  }

  renderItem = item => {
    const { classes } = this.props;
    const selectedItem = item.listing || item;

    return (
      <div className="card-container" key={Math.random()} style={{ width: '300px' }}>
        <Card className={classes.card}>
          <CardContent>
            <Typography
              variant="headline"
              component="h2"
              style={{
                fontSize: '18px',
                fontWeight: '500',
                width: 250,
                height: '26px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'no-wrap',
              }}
            >
              {selectedItem.name || 'Name'}
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              {(selectedItem.owner && selectedItem.owner.name) || 'seller'}
            </Typography>
            <Typography component="p">{`${selectedItem.price} tokens`}</Typography>
          </CardContent>
          <CardActions>{this.renderButton(item)}</CardActions>
        </Card>
      </div>
    );
  };

  renderButton = item => {
    const { currentPage } = this.context.state;

    if (this.props.type === 'sell') {
      return (
        <Button size="small" disabled>
          Uploaded
        </Button>
      );
    }
    if (item.needs_closure) {
      if (this.props.type !== 'sold' && this.props.type !== 'bought' && item.needs_verification) {
        return (
          <Button
            size="small"
            onClick={() => {
              this.verify(item);
            }}
          >
            Verify
          </Button>
        );
      }
      if (this.props.type === 'sold') {
        if (item.needs_verification) {
          return (
            <Button
              size="small"
              disabled
              onClick={() => {
                this.closeTransaction(item);
              }}
            >
              Waiting for verification
            </Button>
          );
        }
        return (
          <Button
            size="small"
            onClick={() => {
              this.closeTransaction(item);
            }}
          >
            Close transaction
          </Button>
        );
      }
      return (
        <Button disabled size="small" onClick={() => this.setState({ item })}>
          Waiting for confirmation
        </Button>
      );
    }

    if (currentPage === 'explore') {
      return (
        <Button
          size="small"
          onClick={() => {
            this.setState({ item });
          }}
        >
          See more
        </Button>
      );
    }
    return (
      <div>
        <Button
          size="small"
          color="primary"
          style={{ fontSize: '0.875rem' }}
          onClick={() => {
            if (item.listing) {
              this.downloadFile(`${HOST}/download?cid=${item.listing.cid}`, item.listing.name);
              return;
            }
            this.downloadFile(`${HOST}/download?cid=${item.cid}`, item.name);
          }}
        >
          Download
        </Button>
        <CopyToClipboard
          text={item.listing ? item.listing.cid : item.cid}
          onCopy={() => {
            this.context.showPopup('Copied to clipboard');
            // setTimeout(() => this.setState({ status: '' }), 3000);
          }}
        >
          <Button>Copy ipfs hash</Button>
        </CopyToClipboard>
      </div>
    );
  };

  async verify(item) {
    const { username } = this.context.state;
    // const { item } = this.state;
    try {
      const password = await this.passwordModal.open();
      await _verifyItem(item, username, password);
      this.context.showPopup('verified successfully');
      this.context.updateState({ currentPage: 'verified' });
      this.context.getItems();
      this.context.updateBalance();
      this.setState({ item: null });
      this.props.history.push('/verified');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          console.log('aaaaaaahhhhhh 40000001111');
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      this.context.showPopup(JSON.stringify(e));
    }
  }

  async downloadFile(url, name) {
    try {
      const response = await fetch(url);
      const fileStream = createWriteStream(name);
      const writer = fileStream.getWriter();
      const reader = response.body.getReader();
      const pump = () =>
        reader.read().then(({ value, done }) => (done ? writer.close() : writer.write(value).then(pump)));
      await pump();
    } catch (e) {
      console.log(e);
    }
  }

  async buyItem(item) {
    const { username, address } = this.context.state;
    const { verifier, reward } = this.state;
    // const { item } = this.state;
    try {
      await this.checkForErrors(item);
      const password = await this.passwordModal.open();
      await _buyItem(item, username, password, address, verifier, reward);
      this.context.showPopup('purchased successfully');
      this.context.updateState({ currentPage: 'in progress' });
      this.context.getItems();
      this.context.updateBalance();
      this.setState({ item: null });
      this.props.history.push('/inprogress');
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
    }
  }

  checkForErrors = item =>
    new Promise((resolve, reject) => {
      const { verifier, reward } = this.state;
      if (verifier && verifier !== 'none') {
        // check if reward correct
        if (reward < 1 || reward > 99) {
          reject('reward should be more than 1% and less than 99%');
        }
      }
      if (this.context.state.balance.tokens < item.price) {
        reject("you don't have enough tokens");
      }
      resolve();
    });

  async closeTransaction(item) {
    const { username } = this.context.state;
    try {
      const password = await this.passwordModal.open();
      await _closeTransaction(item.id, username, password);
      this.context.showPopup('transaction closed');
      this.context.updateState({ currentPage: 'sold' });
      this.props.history.push('/sold');
      this.context.getItems();
      this.context.updateBalance();
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          console.log('aaaaaaahhhhhh 40000001111');
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
    }
  }

  renderModal = () => {
    const { classes } = this.props;
    const { item, verifier, reward } = this.state;
    if (!item) {
      return <div />;
    }
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!item}
        onClose={() => this.setState({ item: null, verifier: '', reward: '' })}
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
            <span style={{ fontWeight: '600' }}>Price:</span> {item.price}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Size:</span> {item.size}
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
                {this.context.state.verifiers.map(ver => (
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
    const { items } = this.props;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div className="item-list-container">
              <InfoPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
              {items.map(item => this.renderItem(item))}
              {this.renderModal()}
              <PasswordModal
                onRef={ref => {
                  this.passwordModal = ref;
                }}
              />
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ItemList);
