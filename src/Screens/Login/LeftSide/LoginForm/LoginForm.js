import React from 'react';
import { withStyles } from 'material-ui/styles';
import SwipeableViews from 'react-swipeable-views';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { CircularProgress } from 'material-ui/Progress';
import AuthService from '../../../../Auth/AuthService';

import { login } from '../../../../Components/requests';
import { MainContext } from '../../../../Context';

import './LoginForm.css';

const TabContainer = ({ children, dir }) => (
  <Typography component="div" dir={dir}>
    {children}
  </Typography>
);

const styles = () => ({
  root: {
    width: '100%',
    height: '600px',
    marginTop: '300px',
  },
  tabsRoot: {
    color: '#ffffff',
  },
  tabRoot: {
    minWidth: '0px',
  },
  label: {
    color: '#4AA4E0',
  },
  labelContainer: {
    padding: 0,
  },
  labelContainerMiddle: {
    padding: '10px',
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 300,
  },
  inputShrink: {
    color: '#4AA4E0',
  },
  inputUnderline: {
    '&:before': {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  inputText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  buttonProgress: {
    position: 'absolute',
    top: 'calc(50% + 15px)',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
  },
});

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      username: '',
      password: '',
      confirmPassword: '',
      usernameError: '',
      passwordError: '',
      confirmPasswordError: '',
      type: 'login',
    };
    this.handleInput = this.handleInput.bind(this);
    this.resetState = this.resetState.bind(this);
    this.Auth = new AuthService();
  }

  componentWillMount() {
    if (this.Auth.loggedIn()) {
      this.props.history.replace('/');
    }
  }

  resetState() {
    this.setState({
      username: '',
      password: '',
      confirmPassword: '',
      usernameError: '',
      passwordError: '',
      confirmPasswordError: '',
    });
  }

  handleChange = (event, value) => {
    if (value === 0) {
      this.setState({ type: 'login' });
    }
    if (value === 2) {
      this.setState({ type: 'register' });
    }
    this.setState({ value });
    this.resetState();
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  handleInput = ({ target: { name, value } }) =>
    this.setState({
      [name]: value,
    });

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

  async checkForErrors() {
    const { type } = this.state;
    await this.loaderSpin();
    const { username, password, confirmPassword } = this.state;
    if (!username) {
      this.setState({ usernameError: 'This field is required' });
      this.context.showPopup('Please enter username');
      return;
    }
    if (!password) {
      this.setState({ passwordError: 'This field is required' });
      this.context.showPopup('Please enter password');
      return;
    }
    if (type === 'register') {
      if (!confirmPassword) {
        this.setState({ confirmPasswordError: 'This field is required' });
        this.context.showPopup('Please confirm password');
        return;
      }
      if (password !== confirmPassword) {
        this.setState({ confirmPasswordError: 'Passwords do not match', passwordError: 'Passwords do not match' });
        this.context.showPopup('Passwords do not match');
        return;
      }
    }
    type === 'login' ? this.handleLogin() : this.handleRegister();
  }

  async handleLogin() {
    const { username, password } = this.state;
    try {
      const response = await login(username, password);
      const { account, token } = response.data;
      this.Auth.setToken(token);
      this.context.setCurrentUser(username, password, account);
    } catch (e) {
      if (e.response && e.response.data) {
        const { message } = e.response.data;
        console.log(message);
        this.context.showPopup(message);
      }
      console.log(e);
    }
  }

  async handleRegister() {
    const { username, password } = this.state;
    try {
      const response = await login(username, password);
      const { account, token } = response.data;
      this.Auth.setToken(token);
      this.context.setCurrentUser(username, password, account);
    } catch (e) {
      if (e.response && e.response.data) {
        const { message } = e.response.data;
        if (message === 'user does not exist') {
          this.context.updateState({ username, password, currentPage: 'add vault', action: 'register' });
          this.props.history.push('/vault');
          return;
        }
        if (message === 'bad password') {
          this.context.showPopup('user already exists');
          return;
        }
        this.context.showPopup(message);
        console.log(message);
      }
      console.log(e);
    }
  }

  renderForm = () => {
    const {
      username,
      password,
      usernameError,
      passwordError,
      confirmPassword,
      confirmPasswordError,
      loading,
      type,
    } = this.state;
    const { classes } = this.props;
    if (this.context) {
      return (
        <div style={styles.formStyle} className="login-form-container">
          <TextField
            name="username"
            label="Username"
            type="text"
            fullWidth
            required={!!usernameError}
            error={!!usernameError}
            className={classes.textField}
            value={username}
            onChange={this.handleInput}
            margin="normal"
            InputLabelProps={{
              classes: {
                root: classes.inputLabel,
                shrink: classes.inputShrink,
              },
            }}
            InputProps={{
              classes: {
                input: classes.inputText,
                underline: classes.inputUnderline,
              },
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                this.checkForErrors();
              }
            }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            required={!!passwordError}
            error={!!passwordError}
            className={classes.textField}
            value={password}
            onChange={this.handleInput}
            margin="normal"
            InputLabelProps={{
              classes: {
                root: classes.inputLabel,
                shrink: classes.inputShrink,
              },
            }}
            InputProps={{
              classes: {
                input: classes.inputText,
                underline: classes.inputUnderline,
              },
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                this.checkForErrors();
              }
            }}
          />
          {type === 'register' ? (
            <TextField
              name="confirmPassword"
              type="password"
              label="Confirm password"
              fullWidth
              className={classes.textField}
              value={confirmPassword}
              required={!!confirmPasswordError}
              error={!!confirmPasswordError}
              onChange={this.handleInput}
              margin="normal"
              InputLabelProps={{
                classes: {
                  root: classes.inputLabel,
                  shrink: classes.inputShrink,
                },
              }}
              InputProps={{
                classes: {
                  input: classes.inputText,
                  underline: classes.inputUnderline,
                },
              }}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  this.checkForErrors();
                }
              }}
            />
          ) : null}
          <br />
          <div style={{ position: 'relative' }}>
            <Button
              variant="raised"
              color="primary"
              fullWidth
              style={{ marginTop: '30px' }}
              onClick={() => this.checkForErrors()}
              disabled={loading}
              classes={{
                disabled: classes.buttonDisabled,
              }}
            >
              {type === 'register' ? 'Register' : 'Login'}
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </div>
      );
    }
  };

  render() {
    const { classes, theme } = this.props;
    const { value } = this.state;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div className={classes.root}>
              <Tabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="transparent"
                textColor="inherit"
                classes={{ root: classes.tabsRoot }}
              >
                <Tab
                  label="Login"
                  disableRipple
                  classes={{
                    root: classes.tabRoot,
                    label: value === 0 ? classes.label : null,
                    labelContainer: classes.labelContainer,
                  }}
                />
                <Tab
                  label="/"
                  disableRipple
                  disabled
                  classes={{
                    root: classes.tabRoot,
                    labelContainer: classes.labelContainerMiddle,
                  }}
                />
                <Tab
                  label="Register"
                  disableRipple
                  classes={{
                    root: classes.tabRoot,
                    label: value === 2 ? classes.label : null,
                    labelContainer: classes.labelContainer,
                  }}
                />
              </Tabs>
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={this.handleChangeIndex}
              >
                <TabContainer dir={theme.direction}>{this.renderForm('login')}</TabContainer>
                <TabContainer />
                <TabContainer dir={theme.direction}>{this.renderForm('register')}</TabContainer>
              </SwipeableViews>
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LoginForm);
