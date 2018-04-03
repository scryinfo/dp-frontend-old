import React, { Component, Fragment } from 'react';
// import RaisedButton from 'material-ui/RaisedButton';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import TextField from 'material-ui/TextField';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';

import './AddVault.css';

import { newVault, importVault } from '../../../../Components/keyRequests';

import { register } from '../../../../Components/requests';

import { MainContext } from '../../../../Context';

import AuthService from '../../../../Auth/AuthService';

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
});

class AddVault extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMnemonicWindowOpen: false,
      passwordWindowOpen: false,
    };
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.Auth = new AuthService();
  }

  async handleNewVault(context) {
    this.setState({ loading: true });
    console.log(context);
    if (context) {
      const { username, password } = context.state;
      try {
        const createdVault = await newVault(username, password);
        const { address, mnemonic } = createdVault;
        this.Auth.register(username, password, address)
          .then(response => {
            // console.log('response', response, response.data.name, username);
            console.log('inside');
            context.updateState({ currentPage: 'explore' });
            this.props.history.push('/');
          })
          .catch(e => console.log(e));
        // context.updateState({ address, mnemonic, currentPage: 'explore' });
        console.log(address, mnemonic);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async handleImportVault(context) {
    console.log('importing');
    this.setState({ loading: true, isMnemonicWindowOpen: false });
    if (context) {
      console.log('context');
      const { username, password } = context.state;
      const { mnemonic } = this.state;
      console.log(username, password, mnemonic);
      try {
        const importedVault = await importVault(username, password, mnemonic);
        console.log(importedVault);
        const { address } = importedVault;
        context.updateState({ address });
        this.props.history.push('/explore');
        console.log(address, mnemonic);
      } catch (e) {
        console.log(e);
      }
    }
  }

  handleClickOpen = () => {
    this.setState({ isMnemonicWindowOpen: true });
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

  renderMnemonicWindow = context => (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={this.state.isMnemonicWindowOpen}
      onClose={() => this.setState({ isMnemonicWindowOpen: false })}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Import existing vault</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To import your existing vault please enter your mnemonic in the field below
        </DialogContentText>
        <TextField
          id="mnemonic"
          name="mnemonic"
          label="Enter here"
          // placeholder="Placeholder"
          autoFocus
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
        <Button onClick={() => this.handleImportVault(context)} color="primary">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );

  render() {
    const { classes } = this.props;
    const { loading } = this.state;
    return (
      <MainContext.Consumer>
        {context => (
          <div>
            {context.state.action === 'login' ? (
              <div className="add-vault-text">Welcome back, {context.state.username}</div>
            ) : (
              context.state.action === 'register' && (
                <div className="add-vault-text">Hello, {context.state.username}</div>
              )
            )}
            <div className="add-vault-text">You don't have a vault yet</div>
            <div className="add-vault-buttons">
              {!context.state.address ? (
                <Fragment>
                  {console.log(context)}
                  <div style={{ position: 'relative' }}>
                    <Button
                      variant="raised"
                      color="primary"
                      fullWidth
                      onClick={() => this.handleNewVault(context)}
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
                  onClick={() => this.handleClickOpen()}
                >
                  Import existing
                </Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
              </div>
            </div>
            {this.renderMnemonicWindow(context)}
          </div>
        )}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AddVault);
