import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';

import { createWriteStream } from 'streamsaver';

import classNames from 'classnames';

import Button from 'material-ui/Button';

import Modal from 'material-ui/Modal';

import Typography from 'material-ui/Typography';

import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import TextField from 'material-ui/TextField';

import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import InfoPopup from '../../InfoPopup';

import { _buyItem, _closeTransaction } from '../../../Components/requests';

import PasswordModal from '../../PasswordModal';

import './ItemList.css';
import { MainContext } from '../../../Context';

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
    const { currentPage } = this.context.state;
    const selectedItem = item.listing || item;

    return (
      <div className="card-container" key={Math.random()} style={{ width: '300px' }}>
        <Card className={classes.card}>
          <CardContent>
            {/* <Typography className={classes.title} color="textSecondary">
              Text
            </Typography> */}
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
    if (item.needs_closure) {
      if (this.props.type === 'sold') {
        return (
          <Button
            size="small"
            onClick={() => {
              this.setState({ item }, () => this.closeTransaction());
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

    if (this.context.state.currentPage === 'explore') {
      return (
        <Button
          size="small"
          onClick={() => {
            this.setState({ item });
            // this.buyItem(item);
          }}
        >
          See more
        </Button>
        // <Button size="small" onClick={() => this.setState({ item })}>
        //   Purchase
        // </Button>
      );
    }
    return (
      <Button
        size="small"
        onClick={() => this.downloadFile(`http://localhost:8080/ipfs/${item.listing.cid}`, item.listing.name)}
      >
        Download
      </Button>
    );
  };

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
      await this.checkForErrors();
      const password = await this.passwordModal.open();
      console.log(password);
      const status = await _buyItem(item, username, password, address, verifier, reward);
      this.context.showPopup('purchased successfully');
      this.context.updateState({ currentPage: 'in progress' });
      this.context.getItems();
      this.setState({ item: null });
      this.props.history.push('/inprogress');
    } catch (e) {
      console.log(e);
      this.context.showPopup(JSON.stringify(e));
      // this.setState({ message: JSON.stringify(e) });
      // const { message } = e && e.response && e.response.data;
      // console.log(message);
      // this.setState({ status: message, password: '' });
    }
  }

  checkForErrors = () =>
    new Promise((resolve, reject) => {
      const { verifier, reward } = this.state;
      if (verifier && verifier !== 'none') {
        // check if reward correct
        if (reward < 1 || reward > 99) {
          reject('reward should be more than 1% and less than 99%');
        }
      }
      resolve();
    });

  async closeTransaction() {
    const { username } = this.context.state;
    const { item } = this.state;
    try {
      const password = await this.passwordModal.open();
      const status = await _closeTransaction(item.id, username, password);
      this.context.showPopup('transaction closed');
      this.context.getItems();
    } catch (e) {
      if (e && e.response && e.response.data) {
        const { message } = e.response.data;
        this.context.showPopup(message);
        return;
      }
      this.context.showPopup(e);
    }
  }

  renderModal = () => {
    const { classes } = this.props;
    const { item } = this.state;
    if (!item) {
      return <div />;
    }
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!item}
        onClose={() => this.setState({ item: null })}
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
          <div
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
                // open={this.state.open}
                // onClose={this.handleClose}
                // onOpen={this.handleOpen}
                value={this.state.verifier}
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
                {this.context.state.verifiers.map(verifier => (
                  <MenuItem key={verifier.id} value={verifier.account}>
                    {verifier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!this.state.verifier ? null : this.state.verifier === 'none' ? (
              <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
                Buy
              </Button>
            ) : (
              <Fragment>
                <TextField
                  label="Verifier's reward"
                  id="simple-start-adornment"
                  type="number"
                  value={this.state.reward}
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
          </div>
        </div>
      </Modal>
    );
  };

  render() {
    console.log(this.props);
    const { classes, items } = this.props;
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
