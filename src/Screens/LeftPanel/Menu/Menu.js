import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import List, { ListItem, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import Fade from 'material-ui/transitions/Fade';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Slide from 'material-ui/transitions/Slide';

import { Motion, spring } from 'react-motion';

import { Manager, Target, Popper } from 'react-popper';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';
import Paper from 'material-ui/Paper';

import classNames from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { getMnemonic } from '../../../Components/keys';

import { MainContext } from '../../../Context';

import { _addTokens } from '../../../Components/requests';

import InfoPopup from '../../InfoPopup';

import './Menu.css';
import Logo from '../../../assets/images/logo.png';

import { initSigner } from '../../../Components/signer';

import AuthService from '../../../Auth/AuthService';

import PasswordModal from '../../PasswordModal';

const Auth = new AuthService();

const styles = () => ({
  root: {
    width: '100%',
  },
  nested: {
    paddingLeft: 55,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
  },
  activeNested: {
    paddingLeft: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  listContainer: {
    paddingLeft: 40,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
  },
  activeListContainer: {
    paddingLeft: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  listText: {
    color: '#ffffff',
  },
  buttonRoot: {
    borderRadius: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: 0,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: 500,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  balanceButtonRoot: {
    borderRadius: '0 2px 2px 0',
    boxShadow: 'none',
  },
  inputText: {
    color: 'white',
    paddingLeft: '10px',
    paddingTop: '10px',
    fontSize: '14px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  popperClose: {
    pointerEvents: 'none',
  },
});

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      anchorEl: null,
      isMnemonicWindowOpen: false,
      tokensToAdd: '',
      isSettingsOpen: false,
    };
    this.handleInput = this.handleInput.bind(this);
    this.getTokens = this.getTokens.bind(this);
  }

  componentWillMount() {
    initSigner();
  }

  componentDidMount() {
    if (this.context) {
      this.context.updateBalance();
      this.context.getItems();
    }
  }

  getActiveStyle = (type, context, classes, nested) => {
    if (type && context.state) {
      if (type === context.state.currentPage) {
        return nested ? classes.activeNested : classes.activeListContainer;
      }
    }
    return nested ? classes.nested : classes.listContainer;
  };

  handleLogout = async context => {
    try {
      await Auth.logout();
      context.updateState({ username: '', password: '', mnemonics: '', address: '' });
      this.props.history.push('/login');
    } catch (e) {
      console.log(e);
    }
  };

  handleClick = () => {
    this.setState({ open: !this.state.open });
  };

  handleInput(event) {
    this.setState({ tokensToAdd: event.target.value });
    event.preventDefault();
  }

  timeout = async time =>
    new Promise(resolve => {
      setTimeout(() => resolve(), time);
    });

  async getTokens(event) {
    event.preventDefault();
    if (this.state.tokensToAdd <= 0) {
      this.context.showPopup('Add 1 or more tokens');
      return;
    }
    this.setState({ loading: true });
    try {
      await this.timeout(2000);
      await _addTokens(this.context.state.address, this.state.tokensToAdd);
      this.context.updateBalance();
      this.context.showPopup(`Received ${this.state.tokensToAdd} tokens`);
      this.setState({ tokensToAdd: '', loading: false });
    } catch (e) {
      console.log(e);
      this.setState({ loading: false });
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      this.context.showPopup('Something went wrong');
    }
  }

  async getMnemonic() {
    try {
      const password = await this.passwordModal.open();
      const vault = await localStorage.getItem(this.context.state.username);
      const mnemonic = await getMnemonic(vault, password);
      this.setState({ mnemonic, isMnemonicWindowOpen: true });
    } catch (e) {
      console.log(e);
      this.context.showPopup(JSON.stringify(e));
    }
  }

  transition(props) {
    return <Slide direction="up" {...props} />;
  }

  renderMnemonicWindow() {
    return (
      <Dialog
        open={this.state.isMnemonicWindowOpen}
        transition={this.transition}
        keepMounted
        onClose={() => this.setState({ isMnemonicWindowOpen: false })}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Your mnemonic</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">{this.state.mnemonic}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ isMnemonicWindowOpen: false })} color="primary">
            Close
          </Button>
          <CopyToClipboard
            text={this.state.mnemonic}
            onCopy={() => {
              this.setState({ isMnemonicWindowOpen: false, status: 'Copied successfully' });
              setTimeout(() => this.setState({ status: '' }), 3000);
            }}
          >
            <Button color="primary">Copy</Button>
          </CopyToClipboard>
        </DialogActions>
      </Dialog>
    );
  }

  changeRoute(to) {
    this.context.updateState({ currentPage: to.currentPage });
    this.props.history.push(`/${to.currentPage.replace(' ', '')}`);
  }

  render() {
    const { classes } = this.props;
    const { loading, tokensToAdd, anchorEl, isSettingsOpen } = this.state;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          const {
            allItems,
            myItems,
            itemsBought,
            itemsSold,
            itemsVerified,
            inProgressBought,
            inProgressSold,
            inProgressVerified,
          } = context.state;
          return (
            <Fragment>
              <InfoPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
              <div className="menu-container">
                <div className="menu-logo-container">
                  <span>SCRY.INFO</span>
                  <img src={Logo} alt="" className="menu-logo" />
                </div>
                {/* Balance section */}
                <div className="menu-balance-container">
                  <Motion
                    defaultStyle={{ tokens: 0, eth: 0 }}
                    style={{
                      tokens: spring(context.state.balance.tokens),
                      eth: spring(context.state.balance.eth),
                    }}
                  >
                    {value => (
                      <div className="menu-balance">
                        <div className="menu-balance-tokens">
                          <div className="menu-balance-numbers">{Math.round(value.tokens)}</div>
                          <div className="menu-balance-text">TOKENS</div>
                        </div>
                        <div className="menu-balance-eth">
                          <div className="menu-balance-numbers">{value.eth.toFixed(1)}</div>
                          <div className="menu-balance-text">ETH</div>
                        </div>
                      </div>
                    )}
                  </Motion>
                  <form className="menu-balance-add" onSubmit={this.getTokens}>
                    <TextField
                      id="tokens"
                      name="tokens"
                      type="number"
                      fullWidth
                      placeholder="Get more tokens"
                      className={classes.textField}
                      value={tokensToAdd}
                      onChange={this.handleInput}
                      // style={{
                      //   height: '34px',
                      //   border: '1px solid #4AA4E0',
                      //   borderRightColor: 'transparent',
                      //   borderRadius: '3px 0 0 3px',
                      // }}
                      InputLabelProps={{
                        classes: {
                          root: classes.inputLabel,
                          shrink: classes.inputShrink,
                        },
                      }}
                      InputProps={{
                        disableUnderline: true,
                        classes: {
                          input: classes.inputText,
                        },
                      }}
                    />
                    <div style={{ position: 'relative' }}>
                      <Button
                        variant="raised"
                        color="primary"
                        classes={{ root: classes.balanceButtonRoot }}
                        onClick={this.getTokens}
                        disabled={loading}
                      >
                        Add
                      </Button>
                      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>
                  </form>
                </div>

                {/* List items */}
                <div className={classes.root}>
                  <List component="nav">
                    {/* EXPLORE */}
                    <ListItem
                      button
                      classes={{ root: this.getActiveStyle('explore', context, classes) }}
                      onClick={() => this.changeRoute({ currentPage: 'explore' })}
                    >
                      <ListItemText primary="Explore" classes={{ primary: classes.listText }} />
                      <ListItemSecondaryAction>
                        <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                          {allItems.length}
                        </div>
                      </ListItemSecondaryAction>
                    </ListItem>

                    {/* MY ITEMS */}
                    <ListItem button onClick={this.handleClick} classes={{ root: classes.listContainer }}>
                      <ListItemText primary="My Items" classes={{ primary: classes.listText }} />
                      {/* {this.state.open ? <ExpandLess /> : <ExpandMore />} */}
                    </ListItem>
                    <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('in progress', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => this.changeRoute({ currentPage: 'in progress' })}
                        >
                          <ListItemText primary="In Progress" classes={{ primary: classes.listText }} />
                          <ListItemSecondaryAction>
                            <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                              {inProgressBought.length + inProgressSold.length + inProgressVerified.length}
                            </div>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('purchased', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => this.changeRoute({ currentPage: 'purchased' })}
                        >
                          <ListItemText primary="Purchased" classes={{ primary: classes.listText }} />
                          <ListItemSecondaryAction>
                            <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                              {itemsBought.length}
                            </div>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('sold', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => this.changeRoute({ currentPage: 'sold' })}
                        >
                          <ListItemText primary="Sold" classes={{ primary: classes.listText }} />
                          <ListItemSecondaryAction>
                            <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                              {itemsSold.length}
                            </div>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('verified', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => this.changeRoute({ currentPage: 'verified' })}
                        >
                          <ListItemText primary="Verified" classes={{ primary: classes.listText }} />
                          <ListItemSecondaryAction>
                            <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                              {itemsVerified.length}
                            </div>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Collapse>
                    <ListItem
                      button
                      classes={{ root: this.getActiveStyle('sell', context, classes) }}
                      onClick={() => this.changeRoute({ currentPage: 'sell' })}
                    >
                      <ListItemText primary="Sell" classes={{ primary: classes.listText }} />
                      <ListItemSecondaryAction>
                        <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                          {myItems.length}
                        </div>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </div>

                {/* Bottom buttons */}
                <div className="menu-buttons">
                  <Manager>
                    <Target>
                      <div
                        ref={node => {
                          this.settingsButton = node;
                        }}
                      >
                        <Button
                          classes={{ root: classes.buttonRoot }}
                          onClick={() => {
                            this.setState({ isSettingsOpen: !this.state.isSettingsOpen });
                          }}
                          aria-owns={anchorEl ? 'settings' : null}
                        >
                          Settings
                        </Button>
                      </div>
                    </Target>
                    <Popper
                      placement="bottom"
                      eventsEnabled={isSettingsOpen}
                      className={classNames({ [classes.popperClose]: !isSettingsOpen })}
                    >
                      <ClickAwayListener
                        onClickAway={event => {
                          if (this.settingsButton.contains(event.target)) {
                            return;
                          }

                          this.setState({ isSettingsOpen: false });
                        }}
                      >
                        <Fade in={isSettingsOpen} id="menu-list-collapse" style={{ transformOrigin: '0 0 0' }}>
                          <Paper style={{ margin: 5, marginLeft: 16 }}>
                            <MenuList role="menu">
                              <MenuItem disabled onClick={this.handleClose}>
                                More
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  this.setState({ isSettingsOpen: false });
                                  this.getMnemonic();
                                }}
                              >
                                Export vault
                              </MenuItem>
                            </MenuList>
                          </Paper>
                        </Fade>
                      </ClickAwayListener>
                    </Popper>
                  </Manager>
                  <li
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: 16,
                      fontWeight: 500,
                      listStyle: 'none',
                    }}
                  >
                    {context.state.username}
                  </li>
                  <Button classes={{ root: classes.buttonRoot }} onClick={() => this.handleLogout(context)}>
                    Logout
                  </Button>
                </div>
              </div>
              <PasswordModal
                onRef={ref => {
                  this.passwordModal = ref;
                }}
              />
              {this.renderMnemonicWindow()}
            </Fragment>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Menu);
