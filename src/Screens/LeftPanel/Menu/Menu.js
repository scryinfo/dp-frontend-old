import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
// import { List, ListItem } from 'material-ui/List';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
// import FlatButton from 'material-ui/FlatButton';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';

import { MainContext } from '../../../Context';

import { logout } from '../../../Components/requests';

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
});

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
  }

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

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
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
                      value={this.state.tokensToAdd}
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
                        onClick={() => this.loaderSpin()}
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
                  <Button classes={{ root: classes.buttonRoot }}>Settings</Button>
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
            </Fragment>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Menu);

// const styles = {
//   menuButtonLeft: {
//     color: 'rgba(255, 255, 255, 0.5)',
//     fontSize: 12,
//   },
//   menuButtonRight: {
//     color: 'rgba(255, 255, 255, 0.5)',
//     fontSize: 12,
//     // paddingLeft: '18px',
//   },
//   menuUsername: {
//     color: 'rgba(255, 255, 255, 0.5)',
//     fontSize: 16,
//     fontWeight: 500,
//     listStyle: 'none',
//   },
//   nestedListStyle: {
//     padding: 0,
//   },
// };

//   <Fragment>
//     <List>
//       <ListItem
//         primaryText="Explore"
//         hoverColor="rgba(255, 255, 255, 0.04)"
//         style={{ color: 'white' }}
//         onClick={() => context.updateState({ currentPage: 'explore' })}
//         innerDivStyle={this.getActiveStyle('explore', context)}
//       />
//       <ListItem
//         primaryText="My Items"
//         initiallyOpen
//         style={{ color: 'white' }}
//         primaryTogglesNestedList
//         hoverColor="rgba(255, 255, 255, 0.04)"
//         innerDivStyle={this.getActiveStyle('', context)}
//         nestedListStyle={styles.nestedListStyle}
//         rightToggle={<div />}
//         nestedItems={[
//           <ListItem
//             primaryText="In Progress"
//             key="inProgress"
//             hoverColor="rgba(255, 255, 255, 0.04)"
//             style={{ color: 'white' }}
//             onClick={() => context.updateState({ currentPage: 'in progress' })}
//             innerDivStyle={this.getActiveStyle('in progress', context)}
//           />,
//           <ListItem
//             primaryText="Purchased"
//             key="purchased"
//             hoverColor="rgba(255, 255, 255, 0.04)"
//             style={{ color: 'white' }}
//             onClick={() => context.updateState({ currentPage: 'purchased' })}
//             innerDivStyle={this.getActiveStyle('purchased', context)}
//           />,
//           <ListItem
//             primaryText="Sold"
//             key="sold"
//             hoverColor="rgba(255, 255, 255, 0.04)"
//             style={{ color: 'white' }}
//             onClick={() => context.updateState({ currentPage: 'sold' })}
//             innerDivStyle={this.getActiveStyle('sold', context)}
//           />,
//           <ListItem
//             primaryText="Verified"
//             key="verified"
//             hoverColor="rgba(255, 255, 255, 0.04)"
//             style={{ color: 'white' }}
//             onClick={() => context.updateState({ currentPage: 'verified' })}
//             innerDivStyle={this.getActiveStyle('verified', context)}
//           />,
//         ]}
//       />
//       <ListItem
//         primaryText="Sell"
//         hoverColor="rgba(255, 255, 255, 0.04)"
//         style={{ color: 'white' }}
//         onClick={() => context.updateState({ currentPage: 'sell' })}
//         innerDivStyle={this.getActiveStyle('sell', context)}
//       />
//       <ListItem
//         primaryText="Verify"
//         hoverColor="rgba(255, 255, 255, 0.04)"
//         style={{ color: 'white' }}
//         onClick={() => context.updateState({ currentPage: 'verify' })}
//         innerDivStyle={this.getActiveStyle('verify', context)}
//       />
//     </List>
//   </Fragment>
