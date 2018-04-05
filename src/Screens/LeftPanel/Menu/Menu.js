import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
// import { List, ListItem } from 'material-ui/List';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
// import FlatButton from 'material-ui/FlatButton';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import MenuPopup, { MenuItem } from 'material-ui/Menu';
import Slide from 'material-ui/transitions/Slide';
import Popover from 'material-ui/Popover';

import { getAccount } from '../../../Components/keyRequests';

import { getMnemonic } from '../../../Components/keys';

import { MainContext } from '../../../Context';

import { logout, _addTokens } from '../../../Components/requests';

import './Menu.css';
import Logo from '../../../assets/images/logo.png';

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
    paddingLeft: '20px',
    paddingTop: '8px',
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
    };
    this.handleInput = this.handleInput.bind(this);
    this.getTokens = this.getTokens.bind(this);
    this.handleOpenSettings = this.handleOpenSettings.bind(this);
    this.handleCloseSettings = this.handleCloseSettings.bind(this);
  }

  handleOpenSettings = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCloseSettings = () => {
    console.log('close called');
    this.setState({ anchorEl: null });
    console.log(this.state.anchorEl);
  };

  componentDidMount() {
    console.log(this.context);
    if (this.context) {
      this.context.updateBalance();
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
    console.log(this.props);
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
    console.log(event.target.value);
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
        <DialogContentText style={{ width: '600px' }}>
          {/* To import your existing vault please confirm your password */}
        </DialogContentText>
        {/* <TextField
          id="password"
          name="password"
          type="password"
          label="Enter your password here"
          // placeholder="Placeholder"
          // autoFocus
          multiline
          fullWidth
          value={this.state.password}
          onChange={event => this.setState({ password: event.target.value })}
          // className={classes.textField}
          margin="normal"
          // style={{ width: '600px' }}
        /> */}
        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          // required={!!passwordError}
          // error={!!passwordError}
          // className={classes.textField}
          value={this.state.password}
          // onChange={this.handleInput}
          onChange={event => this.setState({ password: event.target.value })}
          margin="normal"
          // InputLabelProps={{
          //   classes: {
          //     root: classes.inputLabel,
          //     shrink: classes.inputShrink,
          //   },
          // }}
          // InputProps={{
          //   classes: {
          //     input: classes.inputText,
          //     underline: classes.inputUnderline,
          //   },
          // }}
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
          <Button onClick={this.handleClose} color="primary">
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  render() {
    const { classes } = this.props;
    const { loading, tokensToAdd, anchorEl } = this.state;
    console.log(anchorEl);
    return (
      <MainContext.Consumer>
        {context => {
          console.log(context);
          this.context = context;
          return (
            <Fragment>
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
                    <ListItem
                      button
                      classes={{ root: this.getActiveStyle('explore', context, classes) }}
                      onClick={() => context.updateState({ currentPage: 'explore' })}
                    >
                      <ListItemText primary="Explore" classes={{ primary: classes.listText }} />
                    </ListItem>
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
                          onClick={() => context.updateState({ currentPage: 'in progress' })}
                        >
                          <ListItemText primary="In Progress" classes={{ primary: classes.listText }} />
                        </ListItem>
                      </List>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('purchased', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => context.updateState({ currentPage: 'purchased' })}
                        >
                          <ListItemText primary="Purchased" classes={{ primary: classes.listText }} />
                        </ListItem>
                      </List>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('sold', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => context.updateState({ currentPage: 'sold' })}
                        >
                          <ListItemText primary="Sold" classes={{ primary: classes.listText }} />
                        </ListItem>
                      </List>
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          classes={{ root: this.getActiveStyle('verified', context, classes, 'nested') }}
                          className={classes.nested}
                          onClick={() => context.updateState({ currentPage: 'verified' })}
                        >
                          <ListItemText primary="Verified" classes={{ primary: classes.listText }} />
                        </ListItem>
                      </List>
                    </Collapse>
                    <ListItem
                      button
                      classes={{ root: this.getActiveStyle('sell', context, classes) }}
                      onClick={() => context.updateState({ currentPage: 'sell' })}
                    >
                      <ListItemText primary="Sell" classes={{ primary: classes.listText }} />
                    </ListItem>
                    <ListItem
                      button
                      classes={{ root: this.getActiveStyle('verify', context, classes) }}
                      onClick={() => context.updateState({ currentPage: 'verify' })}
                    >
                      <ListItemText primary="Verify" classes={{ primary: classes.listText }} />
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
