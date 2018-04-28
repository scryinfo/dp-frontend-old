import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';

import './AddVault.css';

import { newVault, importVault } from '../../../../Components/keyRequests';

import { register } from '../../../../Components/requests';

import { MainContext } from '../../../../Context';

import AuthService from '../../../../Auth/AuthService';

import PasswordModal from '../../../PasswordModal';
import MnemonicModal from '../../../MnemonicModal';

const Auth = new AuthService();

const styles = () => ({
  buttonProgress: {
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
      loading: false,
    };
    this.Auth = new AuthService();
  }

  async handleNewVault() {
    this.setState({ loading: true });
    if (this.context) {
      const { username } = this.context.state;
      try {
        const password = await this.passwordModal.open();
        if (password !== this.context.state.password) {
          throw new Error('wrong password');
        }
        const createdVault = await newVault(username, password);
        const { address } = createdVault;
        const response = await register(username, password, address);
        const { account, token } = response.data;
        this.Auth.setToken(token);
        this.context.setCurrentUser(username, password, account);
      } catch (e) {
        this.setState({ loading: false });
        console.log(e);
        if (e.response) {
          const { message } = e.response.data;
          console.log(message);
          this.context.showPopup(JSON.stringify(message));
          return;
        }
        if (e.message) {
          this.context.showPopup(JSON.stringify(e.message));
          return;
        }
        this.context.showPopup(JSON.stringify(e));
      }
    }
  }

  async handleImportVault() {
    this.setState({ loading: true });
    if (this.context) {
      const { username } = this.context.state;
      try {
        const password = await this.passwordModal.open();
        if (password !== this.context.state.password) {
          throw new Error('wrong password');
        }
        const mnemonic = await this.mnemonicModal.open();
        const importedVault = await importVault(username, password, mnemonic);
        const { address } = importedVault;
        this.context.updateState({ address });
        this.props.history.push('/explore');
      } catch (e) {
        this.setState({ loading: false });
        this.passwordModal.close();
        this.mnemonicModal.close();
        console.log(e);
        if (e.message) {
          this.context.showPopup(JSON.stringify(e.message));
          return;
        }
        this.context.showPopup(JSON.stringify(e));
      }
    }
  }

  handleLogout = async context => {
    try {
      await Auth.logout();
      context.updateState({ username: '', password: '', mnemonics: '', address: '' });
      this.props.history.push('/login');
    } catch (e) {
      console.log(e);
    }
  };

  loaderSpin() {
    return new Promise(resolve => {
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
                    onClick={() => this.handleImportVault()}
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
              <PasswordModal
                onRef={ref => {
                  this.passwordModal = ref;
                }}
              />
              <MnemonicModal
                onRef={ref => {
                  this.mnemonicModal = ref;
                }}
              />
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AddVault);
