import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';

import './InProgress.css';
import { MainContext } from '../../../Context';
import ItemList from '../ItemList/ItemList';

const styles = {
  textField: {
    width: '260px',
  },
  inputText: {
    color: 'rgba(0,0,0,1)',
    paddingLeft: '5px',
    // paddingTop: '8px',
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

class InProgress extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { search } = this.state;
    const { inProgressBought, inProgressSold, inProgressVerified } = this.props;
    return (
      <MainContext.Consumer>
        {context => (
          <div className="in-progress-container" style={{ marginTop: '100px' }}>
            {inProgressBought.length > 0 && (
              <Fragment>
                <div className="content-title" style={{ marginTop: '30px' }}>
                  Purchased
                </div>
                <ItemList items={inProgressBought} history={this.props.history} />
              </Fragment>
            )}
            {inProgressSold.length > 0 && (
              <Fragment>
                <div className="content-title" style={{ marginTop: '30px' }}>
                  Sold
                </div>
                <ItemList items={inProgressSold} type="sold" history={this.props.history} />
              </Fragment>
            )}
            {inProgressVerified.length > 0 && (
              <Fragment>
                <div className="content-title" style={{ marginTop: '30px' }}>
                  Verified
                </div>
                <ItemList items={inProgressVerified} history={this.props.history} />
              </Fragment>
            )}
          </div>
        )}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(InProgress);
