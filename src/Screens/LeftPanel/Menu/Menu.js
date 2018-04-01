import React, { Component, Fragment } from 'react';
import TextField from 'material-ui/TextField';
import { List, ListItem } from 'material-ui/List';
// import FlatButton from 'material-ui/FlatButton';
import Button from 'material-ui/Button';

import { MainContext } from '../../../Context';

import { logout } from '../../../Components/requests';

import './Menu.css';
import Logo from '../../../assets/images/logo.png';

export default class AddVault extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getActiveStyle = (type, context) => {
    if (type && context.state) {
      if (type === context.state.currentPage) {
        return {
          padding: '15px 40px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        };
      }
    }
    return {
      padding: '15px 40px',
    };
  };

  handleLogout = async context => {
    try {
      await logout();
      context.updateState({ username: '', password: '', mnemonics: '', address: '' });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <MainContext.Consumer>
        {context => (
          <Fragment>
            <div className="menu-container">
              <div className="menu-logo-container">
                <span>SCRY.INFO</span>
                <img src={Logo} alt="" className="menu-logo" />
              </div>
              <div className="menu-balance-container">
                <div className="menu-balance">
                  <div className="menu-balance-tokens">
                    <div className="menu-balance-numbers">{context.state.balance.tokens}</div>
                    <div className="menu-balance-text">TOKENS</div>
                  </div>
                  <div className="menu-balance-eth">
                    <div className="menu-balance-numbers">{context.state.balance.eth}</div>
                    <div className="menu-balance-text">ETH</div>
                  </div>
                </div>
                <div className="menu-balance-add">
                  <TextField
                    hintText="Get more tokens"
                    hintStyle={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      padding: 0,
                      lineHeight: '10px',
                      fontSize: '14px',
                      paddingLeft: '20px',
                    }}
                    fullWidth
                    type="number"
                    style={{
                      height: '34px',
                      border: '1px solid #4AA4E0',
                      borderRightColor: 'transparent',
                      borderRadius: '3px 0 0 3px',
                    }}
                    inputStyle={{ color: 'white', paddingLeft: '20px', fontSize: '14px' }}
                    underlineShow={false}
                  />
                  {/* <FlatButton
                    label="Add"
                    backgroundColor="#4AA4E0"
                    labelStyle={{ color: 'white' }}
                    style={{ borderRadius: '0 3px 3px 0' }}
                  /> */}
                  <Button variant="raised" color="primary">
                    Add
                  </Button>
                </div>
              </div>
              <Fragment>
                <List>
                  <ListItem
                    primaryText="Explore"
                    hoverColor="rgba(255, 255, 255, 0.04)"
                    style={{ color: 'white' }}
                    onClick={() => context.updateState({ currentPage: 'explore' })}
                    innerDivStyle={this.getActiveStyle('explore', context)}
                  />
                  <ListItem
                    primaryText="My Items"
                    initiallyOpen
                    style={{ color: 'white' }}
                    primaryTogglesNestedList
                    hoverColor="rgba(255, 255, 255, 0.04)"
                    innerDivStyle={this.getActiveStyle('', context)}
                    nestedListStyle={styles.nestedListStyle}
                    rightToggle={<div />}
                    nestedItems={[
                      <ListItem
                        primaryText="In Progress"
                        key="inProgress"
                        hoverColor="rgba(255, 255, 255, 0.04)"
                        style={{ color: 'white' }}
                        onClick={() => context.updateState({ currentPage: 'in progress' })}
                        innerDivStyle={this.getActiveStyle('in progress', context)}
                      />,
                      <ListItem
                        primaryText="Purchased"
                        key="purchased"
                        hoverColor="rgba(255, 255, 255, 0.04)"
                        style={{ color: 'white' }}
                        onClick={() => context.updateState({ currentPage: 'purchased' })}
                        innerDivStyle={this.getActiveStyle('purchased', context)}
                      />,
                      <ListItem
                        primaryText="Sold"
                        key="sold"
                        hoverColor="rgba(255, 255, 255, 0.04)"
                        style={{ color: 'white' }}
                        onClick={() => context.updateState({ currentPage: 'sold' })}
                        innerDivStyle={this.getActiveStyle('sold', context)}
                      />,
                      <ListItem
                        primaryText="Verified"
                        key="verified"
                        hoverColor="rgba(255, 255, 255, 0.04)"
                        style={{ color: 'white' }}
                        onClick={() => context.updateState({ currentPage: 'verified' })}
                        innerDivStyle={this.getActiveStyle('verified', context)}
                      />,
                    ]}
                  />
                  <ListItem
                    primaryText="Sell"
                    hoverColor="rgba(255, 255, 255, 0.04)"
                    style={{ color: 'white' }}
                    onClick={() => context.updateState({ currentPage: 'sell' })}
                    innerDivStyle={this.getActiveStyle('sell', context)}
                  />
                  <ListItem
                    primaryText="Verify"
                    hoverColor="rgba(255, 255, 255, 0.04)"
                    style={{ color: 'white' }}
                    onClick={() => context.updateState({ currentPage: 'verify' })}
                    innerDivStyle={this.getActiveStyle('verify', context)}
                  />
                </List>
              </Fragment>
              <div className="menu-buttons">
                {/* <FlatButton
                  label="Settings"
                  backgroundColor="rgba(255, 255, 255, 0.1)"
                  labelStyle={styles.menuButtonLeft}
                  style={{ borderRadius: 0 }}
                /> */}
                <Button variant="raised" color="primary">
                  Settings
                </Button>
                <li style={styles.menuUsername}>{context.state.username}</li>
                {/* <FlatButton
                  label="Logout"
                  backgroundColor="rgba(255, 255, 255, 0.1)"
                  labelStyle={styles.menuButtonRight}
                  style={{ borderRadius: 0 }}
                  onClick={this.handleLogout}
                /> */}
                <Button variant="raised" color="primary">
                  Logout
                </Button>
              </div>
            </div>
          </Fragment>
        )}
      </MainContext.Consumer>
    );
  }
}

const styles = {
  menuButtonLeft: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  menuButtonRight: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    // paddingLeft: '18px',
  },
  menuUsername: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: 500,
    listStyle: 'none',
  },
  nestedListStyle: {
    padding: 0,
  },
};
