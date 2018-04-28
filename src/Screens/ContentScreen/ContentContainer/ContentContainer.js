import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';

import './ContentContainer.css';
import { MainContext } from '../../../Context';
import ItemList from '../ItemList/ItemList';
import Sell from '../Sell/Sell';
import InProgress from '../InProgress/InProgress';

const styles = {
  textField: {
    width: '260px',
  },
  inputText: {
    color: 'rgba(0,0,0,1)',
    paddingLeft: '5px',
    fontSize: '12px',
  },
  inputLabel: {
    fontSize: '11px',
    paddingTop: '3px',
    color: 'rgba(0,0,0,1)',
  },
  searchIcon: {
    fontSize: '20px',
    marginRight: '-10px',
    color: 'rgba(0,0,0,0.4)',
  },
};

class ContentContainer extends Component {
  constructor() {
    super();
    this.state = {
      search: '',
    };
  }

  render() {
    const { search } = this.state;
    const { classes } = this.props;
    return (
      <MainContext.Consumer>
        {context => {
          const { inProgressBought, inProgressSold, inProgressVerified } = context.state;
          return (
            <div className="content-container">
              <div className="content-header">
                <div className="content-title">{context.state.currentPage}</div>
              </div>
              <div className="list-items">
                <Route path="/explore" render={props => <ItemList {...props} items={context.state.allItems} />} />
                <Route
                  path="/inprogress"
                  render={props => (
                    <InProgress
                      {...props}
                      inProgressBought={inProgressBought}
                      inProgressSold={inProgressSold}
                      inProgressVerified={inProgressVerified}
                    />
                  )}
                />
                <Route path="/purchased" render={props => <ItemList {...props} items={context.state.itemsBought} />} />
                <Route path="/sold" render={props => <ItemList {...props} items={context.state.itemsSold} />} />
                <Route path="/verified" render={props => <ItemList {...props} items={context.state.itemsVerified} />} />
                <Route path="/sell" render={props => <Sell {...props} items={context.state.allItems} />} />
                <Route path="/verify" render={props => <Sell {...props} items={context.state.allItems} />} />
              </div>
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ContentContainer);
