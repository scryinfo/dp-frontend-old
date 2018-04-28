import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';

import './InProgress.css';
import ItemList from '../ItemList/ItemList';

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

class InProgress extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { inProgressBought, inProgressSold, inProgressVerified } = this.props;
    return (
      <div className="in-progress-container" style={{ marginTop: '100px', marginBottom: '30px' }}>
        {inProgressBought.length > 0 && (
          <Fragment>
            <div className="content-title" style={{ marginTop: '30px' }}>
              Purchasing
            </div>
            <ItemList items={inProgressBought} type="bought" history={this.props.history} />
          </Fragment>
        )}
        {inProgressSold.length > 0 && (
          <Fragment>
            <div className="content-title" style={{ marginTop: '30px' }}>
              Selling
            </div>
            <ItemList items={inProgressSold} type="sold" history={this.props.history} />
          </Fragment>
        )}
        {inProgressVerified.length > 0 && (
          <Fragment>
            <div className="content-title" style={{ marginTop: '30px' }}>
              Verifying
            </div>
            <ItemList items={inProgressVerified} history={this.props.history} />
          </Fragment>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(InProgress);
