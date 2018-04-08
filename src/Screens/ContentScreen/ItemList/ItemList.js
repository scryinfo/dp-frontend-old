import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';

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
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      items: [{}, {}, {}, {}, {}, {}],
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
            <Typography variant="headline" component="h2" style={{ fontSize: '18px', fontWeight: '500', width: 250, height: '26px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'no-wrap' }}>
              {item.name || 'Name'}
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              {(item.owner && item.owner.name) || 'seller'}
            </Typography>
            <Typography component="p">{`${item.price} tokens` || 'price'}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small">See more</Button>
          </CardActions>
        </Card>
      </div>
    );
  };

  render() {
    const { classes, items } = this.props;
    console.log(items);
    return (
      // <MainContext.Consumer>
      //   {context => (
      <div className="item-list-container">
        {items.map(item => this.renderItem(item))}
        {/* fjdkljskldjkldfjkldjkldjflksjfkldsjfkldsjfkldsfkldjflkjlksjflksdjfldksjfklsjfdlksjdklsfjdklsjfdlskjfdskllsdkjkdlsjfkldsjfklsklsdjfskdl */}
      </div>
      // )}
      // </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ItemList);
