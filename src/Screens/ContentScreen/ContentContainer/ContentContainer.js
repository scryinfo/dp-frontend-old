import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import './ContentContainer.css';
import { MainContext } from '../../../Context';
import Search from '../Search';
import ItemList from '../ItemList/ItemList';
import Sell from '../Sell/Sell';
import CreateCategory from '../CreateCategory';
import Categories from '../Categories';
import Listing from '../../Listing';
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
            allItems,
            foundItems,
            currentPage,
            searchValue,
            historyBuyer,
            historySeller,
            historyVerifier,
          } = context.state;
          return (
            <div className="content-container">
              {currentPage === 'files' && (
                <div className="content-header">
                  <div className="content-title">BUY FILES</div>
                  <div className="content-search">
                    <Search value={searchValue} onChange={context.onSearch} />
                  </div>
                </div>
              )}
              {currentPage === 'purchased' && (
                <div className="content-header">
                  <div className="content-title">{currentPage}</div>
                </div>
              )}
              {currentPage === 'sold' && (
                <div className="content-header">
                  <div className="content-title">{currentPage}</div>
                </div>
              )}
              {currentPage === 'verified' && (
                <div className="content-header">
                  <div className="content-title">{currentPage}</div>
                </div>
              )}
              <div className="list-items">
                <Route
                  path="/files"
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
                <Route path="/myfiles" render={props => <Sell {...props} items={allItems} type="uploaded" />} />
                <Route
                  path="/createcategory"
                  render={props => <CreateCategory type="createcategory" context={context} />}
                />
                <Route path="/categories" render={props => <Categories type="categories" context={context} />} />
                <Route path="/listing/:id" render={props => <Listing type="listing" context={context} />} />
              </div>
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ContentContainer);
