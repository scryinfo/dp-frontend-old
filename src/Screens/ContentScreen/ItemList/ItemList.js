import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';

import TextField from 'material-ui/TextField';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';

import Typography from 'material-ui/Typography';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import ErrorPopup from '../../ErrorPopup';

import { _buyItem } from '../../../Components/requests';

import './ItemList.css';
import { MainContext } from '../../../Context';

const styles = {
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
};

class ItemList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      item: {},
      isPasswordWindowOpen: false,
    };
  }

  renderItem = item => {
    const { classes } = this.props;
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
              {item.name || 'Name'}
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              {(item.owner && item.owner.name) || 'seller'}
            </Typography>
            <Typography component="p">{`${item.price} tokens` || 'price'}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => this.setState({ item, isPasswordWindowOpen: true })}>
              Buy now
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  };

  async buyItem() {
    this.setState({ isPasswordWindowOpen: false });
    const { username, address } = this.context.state;
    const { item, password } = this.state;
    try {
      console.log(item, username, password, address);
      const status = await _buyItem(item, username, password, address);
      this.setState({ status: 'purchased succesfully', password: '' });
      console.log(status);
    } catch (e) {
      const { message } = e.response.data;
      console.log(message);
      this.setState({ status: message, password: '' });
    }
  }

  renderPasswordWindow = () => (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={this.state.isPasswordWindowOpen}
      onClose={() => this.setState({ isPasswordWindowOpen: false })}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Enter your password</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ width: '600px' }} />
        <TextField
          id="password"
          name="password"
          label="Enter here"
          // placeholder="Placeholder"
          autoFocus
          multiline
          type="password"
          fullWidth
          value={this.state.password}
          onChange={event => this.setState({ password: event.target.value })}
          // className={classes.textField}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => this.setState({ isPasswordWindowOpen: false })} color="primary">
          Cancel
        </Button>
        <Button onClick={() => this.buyItem()} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  render() {
    const { classes, items } = this.props;
    console.log(items);
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div className="item-list-container">
              <ErrorPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
              {this.renderPasswordWindow()}
              {items.map(item => this.renderItem(item))}
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ItemList);
