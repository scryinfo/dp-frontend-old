import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
// import { List, ListItem } from 'material-ui/List';
import List, { ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
// import FlatButton from 'material-ui/FlatButton';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import MenuPopup, { MenuItem } from 'material-ui/Menu';
import Slide from 'material-ui/transitions/Slide';
import Popover from 'material-ui/Popover';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { getAccount } from '../../../Components/keyRequests';

import { getMnemonic } from '../../../Components/keys';

import { MainContext } from '../../../Context';

import { logout, _addTokens } from '../../../Components/requests';

import ErrorPopup from '../../ErrorPopup';

import './Menu.css';
import Logo from '../../../assets/images/logo.png';

import { initSigner } from '../../../Components/signer';

import AuthService from '../../../Auth/AuthService';

const Auth = new AuthService();

const styles = theme => ({
  root: {
    width: '100%',
    // paddingLeft: '15px',
    // maxWidth: 360,
    // backgroundColor: theme.palette.background.paper,
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
    borderRadius: '0 3px 3px 0',
  },
  inputText: {
    color: 'white',
    paddingLeft: '10px',
    paddingTop: '10px',
    fontSize: '14px',
  },
  buttonProgress: {
    // color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  // popoverRoot: {
  //   bottom: '100px',
  // },
});

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      anchorEl: null,
      isPasswordWindowOpen: false,
      isMnemonicWindowOpen: false,
      tokensToAdd: '',
      password: '',
    };
    this.handleInput = this.handleInput.bind(this);
    this.getTokens = this.getTokens.bind(this);
    this.handleOpenSettings = this.handleOpenSettings.bind(this);
    this.handleCloseSettings = this.handleCloseSettings.bind(this);
  }

  componentWillMount() {
    initSigner();
  }

  handleOpenSettings = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseSettings = () => {
    this.setState({ anchorEl: null });
  };

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

  async getTokens(event) {
    // event.preventDefault();
    try {
      await _addTokens(this.context.state.address, this.state.tokensToAdd);
      this.context.updateBalance();
      this.setState({ tokensToAdd: '' });
    } catch (e) {
      console.log(e);
    }
  }

  loaderSpin() {
    return new Promise((resolve, reject) => {
      if (!this.state.loading) {
        this.setState(
          {
            loading: true,
          },
          () => {
            this.timer = setTimeout(() => {
              this.setState({
                loading: false,
              });
              resolve('next');
            }, 2000);
          }
        );
      }
    });
  }

  async getMnemonic() {
    this.setState({ isPasswordWindowOpen: false });
    try {
      const vault = await localStorage.getItem(this.context.state.username);
      const mnemonic = await getMnemonic(vault, this.state.password);
      this.setState({ mnemonic, isMnemonicWindowOpen: true });
    } catch (e) {
      console.log(e);
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
          name="password"
          label="Password"
          type="password"
          fullWidth
          value={this.state.password}
          onChange={event => this.setState({ password: event.target.value })}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => this.setState({ isPasswordWindowOpen: false })} color="primary">
          Cancel
        </Button>
        <Button onClick={() => this.getMnemonic()} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  Transition(props) {
    return <Slide direction="up" {...props} />;
  }

  renderMnemonicWindow() {
    return (
      <Dialog
        open={this.state.isMnemonicWindowOpen}
        transition={this.Transition}
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
    const { loading, tokensToAdd, anchorEl } = this.state;
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
              <ErrorPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
              <div className="menu-container">
                <div className="menu-logo-container">
                  <span>SCRY.INFO</span>
                  <img src={Logo} alt="" className="menu-logo" />
                </div>
                {/* Balance section */}
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
                      id="username"
                      name="username"
                      type="number"
                      fullWidth
                      placeholder="Get more tokens"
                      // required={!!usernameError}
                      // error={!!usernameError}
                      className={classes.textField}
                      value={tokensToAdd}
                      onChange={this.handleInput}
                      style={{
                        height: '34px',
                        border: '1px solid #4AA4E0',
                        borderRightColor: 'transparent',
                        borderRadius: '3px 0 0 3px',
                      }}
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
                        onClick={() => this.getTokens()}
                        disabled={loading}
                      >
                        Add
                      </Button>
                      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>
                  </div>
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
                      {/* <ListItemSecondaryAction>
                        <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>1</div>
                      </ListItemSecondaryAction> */}
                    </ListItem>
                    <ListItem
                      button
                      classes={{ root: this.getActiveStyle('verify', context, classes) }}
                      onClick={() => this.changeRoute({ currentPage: 'verify' })}
                    >
                      <ListItemText primary="Verify" classes={{ primary: classes.listText }} />
                      {/* <ListItemSecondaryAction>
                        <div style={{ paddingLeft: '10px', paddingRight: '30px', color: '#ffffff' }}>
                          {this.context.state.verified.length}
                        </div>
                      </ListItemSecondaryAction> */}
                    </ListItem>
                  </List>
                </div>

                {/* Bottom buttons */}
                <div className="menu-buttons">
                  <Button
                    classes={{ root: classes.buttonRoot }}
                    onClick={this.handleOpenSettings}
                    aria-owns={anchorEl ? 'settings' : null}
                  >
                    Settings
                  </Button>
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    // anchorReference={anchorReference}
                    // anchorPosition={{ top: positionTop }}
                    onClose={this.handleCloseSettings}
                    anchorOrigin={{
                      vertical: 'top',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        this.handleCloseSettings();
                        this.setState({ isPasswordWindowOpen: true });
                      }}
                    >
                      Export vault
                    </MenuItem>
                  </Popover>
                  {/* <MenuPopup
                    id="settings"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleCloseSettings}
                    // style={{ marginBottom: '40px' }}
                    // PopoverClasses={classes.popoverRoot}
                  >
                    <MenuItem onClick={this.handleCloseSettings}>Export vault</MenuItem>
                    {/* <MenuItem onClick={this.handleCloseSettings}>My account</MenuItem>
                    <MenuItem onClick={this.handleCloseSettings}>Logout</MenuItem> */}
                  {/* </MenuPopup> */}
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
              {this.renderPasswordWindow()}
              {this.renderMnemonicWindow()}
            </Fragment>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Menu);
