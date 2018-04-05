import React, { Component, Fragment } from 'react';
// import RaisedButton from 'material-ui/RaisedButton';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import TextField from 'material-ui/TextField';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Slide from 'material-ui/transitions/Slide';

import './AddVault.css';

import { newVault, importVault } from '../../../../Components/keyRequests';

import { register } from '../../../../Components/requests';

import { MainContext } from '../../../../Context';

import AuthService from '../../../../Auth/AuthService';

const Auth = new AuthService();

const styles = theme => ({
  buttonProgress: {
    // color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
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
});

class AddVault extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMnemonicWindowOpen: false,
      isPasswordWindowOpen: false,
    };
    this.handleMnemonicOpen = this.handleMnemonicOpen.bind(this);
    this.handlePasswordOpen = this.handlePasswordOpen.bind(this);
    this.Auth = new AuthService();
  }

  async handleNewVault() {
    this.setState({ loading: true });
    console.log(this.context);
    if (this.context) {
      const { username, password } = this.context.state;
      try {
        const createdVault = await newVault(username, password);
        const { address, mnemonic } = createdVault;
        const response = await register(username, password, address);
        const { account, token } = response.data;
        this.Auth.setToken(token);
        this.context.setCurrentUser(username, password, account);
        console.log(response);
      } catch (e) {
        if (e.response) {
          const { message } = e.response.data;
          console.log(message);
          this.setState({ errorMessage: message });
        }
        console.log(e);
      }
    }
  }

  async handleImportVault() {
    console.log('importing');
    this.setState({ loading: true, isMnemonicWindowOpen: false });
    if (this.context) {
      console.log('context');
      const { username } = this.context.state;
      const { mnemonic, password } = this.state;
      console.log(username, password, mnemonic);
      try {
        const importedVault = await importVault(username, password, mnemonic);
        console.log(importedVault);
        const { address } = importedVault;
        this.context.updateState({ address });
        this.props.history.push('/explore');
        console.log(address, mnemonic);
      } catch (e) {
        console.log(e);
      }
    }
  }

  handleMnemonicOpen = () => {
    this.setState({ isMnemonicWindowOpen: true, isPasswordWindowOpen: false });
  };

  handlePasswordOpen = () => {
    this.setState({ isPasswordWindowOpen: true });
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

  Transition(props) {
    return <Slide direction="up" {...props} />;
  }

  renderMnemonicWindow = () => (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      transition={this.Transition}
      keepMounted
      open={this.state.isMnemonicWindowOpen}
      onClose={() => this.setState({ isMnemonicWindowOpen: false })}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Enter your mnemonics</DialogTitle>
      <DialogContent>
        <DialogContentText style={{ width: '600px' }}>
          To import your existing vault please enter your mnemonic in the field below
        </DialogContentText>
        <TextField
          id="mnemonic"
          name="mnemonic"
          label="Enter here"
          // placeholder="Placeholder"
          // autoFocus
          multiline
          fullWidth
          value={this.state.mnemonic}
          onChange={event => this.setState({ mnemonic: event.target.value })}
          // className={classes.textField}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => this.setState({ isMnemonicWindowOpen: false })} color="primary">
          Cancel
        </Button>
        <Button onClick={() => this.handleImportVault()} color="primary">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );

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
        {/* <DialogContentText style={{ width: '600px' }}>
          To import your existing vault please confirm your password
        </DialogContentText> */}
        <TextField
          id="password"
          name="password"
          label="Enter here"
          // placeholder="Placeholder"
          autoFocus
          multiline
          type="password"
          fullWidth
          value={this.state.password}
          onChange={event => this.setState({ password: event.target.value })}
          // className={classes.textField}
          margin="normal"
          style={{ width: '600px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => this.setState({ isPasswordWindowOpen: false })} color="primary">
          Cancel
        </Button>
        <Button onClick={() => this.handleMnemonicOpen()} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div>
              {context.state.address && <div className="add-vault-text">Welcome back, {context.state.username}</div>}
              <div className="add-vault-text">You don't have a vault yet</div>
              <div className="add-vault-buttons">
                {!context.state.address ? (
                  <Fragment>
                    <div style={{ position: 'relative' }}>
                      <Button
                        variant="raised"
                        color="primary"
                        fullWidth
                        onClick={() => this.handleNewVault()}
                        disabled={loading}
                        classes={{
                          disabled: classes.buttonDisabled,
                        }}
                      >
                        Create one
                      </Button>
                      {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>
                    <div className="add-vault-or">or</div>
                  </Fragment>
                ) : null}

                {/* <RaisedButton label="IMPORT EXISTING" fullWidth labelColor="#ffffff" backgroundColor="#4AA4E0" /> */}
                <div style={{ position: 'relative' }}>
                  <Button
                    variant="raised"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    classes={{
                      disabled: classes.buttonDisabled,
                    }}
                    onClick={() => this.handlePasswordOpen()}
                  >
                    Import existing
                  </Button>
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
              </div>
              {context.state.address && (
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
              )}
              {this.renderMnemonicWindow()}
              {this.renderPasswordWindow()}
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AddVault);
