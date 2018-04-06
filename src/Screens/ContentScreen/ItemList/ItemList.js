import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import TextField from 'material-ui/TextField';

import IconButton from 'material-ui/IconButton';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';

import Visibility from 'material-ui-icons/Visibility';
import Search from 'material-ui-icons/Search';
import VisibilityOff from 'material-ui-icons/VisibilityOff';
import Typography from 'material-ui/Typography';

import Card, { CardActions, CardContent } from 'material-ui/Card';

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
  constructor() {
    super();
    this.state = {
      search: '',
      items: [{}, {}, {}, {}, {}, {}],
    };
  }

  renderItem = () => {
    const { classes } = this.props;
    return (
      <div className="card-container">
        <Card className={classes.card}>
          <CardContent>
            {/* <Typography className={classes.title} color="textSecondary">
              Text
            </Typography> */}
            <Typography variant="headline" component="h2">
              Title here
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              seller
            </Typography>
            <Typography component="p">price</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">See more</Button>
          </CardActions>
        </Card>
      </div>
    );
  };

  render() {
    const { search } = this.state;
    const { classes } = this.props;
    return (
      <MainContext.Consumer>
        {context => <div className="item-list-container">{this.state.items.map(item => this.renderItem(item))}</div>}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ItemList);
