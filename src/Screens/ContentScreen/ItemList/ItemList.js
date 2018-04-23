import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';

import Modal from 'material-ui/Modal';

import Typography from 'material-ui/Typography';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import ErrorPopup from '../../ErrorPopup';

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
});

class ItemList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      item: null,
      isPasswordWindowOpen: false,
      isModalOpen: true,
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
          <Button size="small" onClick={() => this.setState({ item, isPasswordWindowOpen: true })}>
            Close transaction
          </Button>
        );
      }
      return (
        <Button disabled size="small" onClick={() => this.setState({ item, isPasswordWindowOpen: true })}>
          Waiting for confirmation
        </Button>
      );
    }

    if (this.context.state.currentPage === 'explore') {
      return (
        <Button
          size="small"
          onClick={() => {
            // this.setState({ item });
            this.buyItem(item);
          }}
        >
          Purchase
        </Button>
        // <Button size="small" onClick={() => this.setState({ item })}>
        //   Purchase
        // </Button>
      );
    }
    return (
      <Button disabled size="small" onClick={() => this.setState({ item, isPasswordWindowOpen: true })}>
        Done
      </Button>
    );
  };

  async buyItem(item) {
    const { username, address } = this.context.state;
    // const { item } = this.state;
    console.log('iteeeeem', item);
    try {
      const password = await this.password.open();
      console.log(password);
      const status = await _buyItem(item, username, password, address);
      this.setState({ status: 'purchased succesfully', password: '' });
      this.context.getItems();
    } catch (e) {
      console.log(e);
      // const { message } = e && e.response && e.response.data;
      // console.log(message);
      // this.setState({ status: message, password: '' });
    }
  }

  async closeTransaction() {
    this.setState({ isPasswordWindowOpen: false });
    const { username } = this.context.state;
    const { item, password } = this.state;
    try {
      const status = await _closeTransaction(item.id, username, password);
      this.setState({ status: 'transaction closed', password: '' });
      this.context.getItems();
    } catch (e) {
      const { message } = e.response.data;
      console.log(message);
      this.setState({ status: message, password: '' });
    }
  }

  getAction() {
    const { currentPage } = this.context.state;
    switch (currentPage) {
      case 'explore':
        return this.buyItem();
      case 'purchased':
        return this.closeTransaction();
      case 'in progress':
        return this.closeTransaction();
      case 'sold':
        return this.closeTransaction();
      case 'verified':
        return this.buyItem();
      default:
    }
  }

  renderModal = () => {
    console.log(this.password);
    const { classes } = this.props;
    const { item } = this.state;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!item}
        onClose={this.handleClose}
      >
        <div
          style={{
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
          }}
          className={classes.paper}
        >
          <Typography variant="title" id="modal-title">
            Text in a modal
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
          {/* <SimpleModalWrapped /> */}
        </div>
      </Modal>
    );
  };

  render() {
    const { classes, items } = this.props;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div className="item-list-container">
              <ErrorPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
              {items.map(item => this.renderItem(item))}
              {this.renderModal()}
              <PasswordModal
                onRef={ref => {
                  this.password = ref;
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
