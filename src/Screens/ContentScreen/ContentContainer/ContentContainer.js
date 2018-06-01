import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';

import './ContentContainer.css';
import { MainContext } from '../../../Context';
import Search from '../Search';
import ItemList from '../ItemList/ItemList';
import Sell from '../Sell/Sell';
import CreateCategory from '../CreateCategory';
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
    this.state = {};
  }

  render() {
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          const {
            inProgressBought,
            inProgressSold,
            inProgressVerified,
            allItems,
            foundItems,
            itemsBought,
            itemsSold,
            itemsVerified,
            currentPage,
            searchValue,
            historyBuyer,
            historySeller,
            historyVerifier,
          } = context.state;
          return (
            <div className="content-container">
              <div className="content-header">
                <div className="content-title">{currentPage}</div>
                {currentPage === 'explore' && (
                  <div className="content-search">
                    <Search value={searchValue} onChange={context.onSearch} />
                  </div>
                )}
              </div>
              <div className="list-items">
                <Route
                  path="/explore"
                  render={props => <ItemList {...props} items={foundItems.length > 0 ? foundItems : allItems} />}
                />
                <Route
                  path="/purchased"
                  render={props => <ItemList {...props} items={historyBuyer} type="purchased" />}
                />
                <Route path="/sold" render={props => <ItemList {...props} items={historySeller} type="sold" />} />
                <Route
                  path="/verified"
                  render={props => <ItemList {...props} items={historyVerifier} type="verified" />}
                />
                <Route path="/upload" render={props => <Sell {...props} items={allItems} type="uploaded" />} />
                <Route path="/createcategory" render={props => <CreateCategory type="createcategory" />} />
              </div>
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ContentContainer);
