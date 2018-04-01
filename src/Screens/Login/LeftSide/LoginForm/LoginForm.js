import React from 'react';
import { withStyles } from 'material-ui/styles';
import SwipeableViews from 'react-swipeable-views';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { CircularProgress } from 'material-ui/Progress';

import { MainContext } from '../../../../Context';

import { login } from '../../../../Components/requests';

import './LoginForm.css';

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir}>
      {children}
    </Typography>
  );
}

const styles = theme => ({
  root: {
    // backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
  tabsRoot: {
    color: '#ffffff',
  },
  tabRoot: {
    // width: 'auto',
    minWidth: '0px',
  },
  label: {
    color: '#4AA4E0',
    fontSize: '14px',
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
    // color: green[500],
    position: 'absolute',
    top: 'calc(50% + 15px)',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
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
    };
    this.handleInput = this.handleInput.bind(this);
    this.resetState = this.resetState.bind(this);
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
    this.setState({ value });
    this.resetState();
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  handleInput(event) {
    console.log(event.target.name);
    this.setState({ usernameError: '', passwordError: '' });
    switch (event.target.name) {
      case 'username':
        this.setState({ username: event.target.value });
        break;
      case 'password':
        this.setState({ password: event.target.value });
        break;
      case 'confirmPassword':
        this.setState({ confirmPassword: event.target.value });
        break;
      default:
    }
  }

  loaderSpin() {
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
          }, 2000);
        }
      );
    }
  }

  handleLogin(context, type) {
    this.loaderSpin();
    const { username, password, confirmPassword } = this.state;
    if (!username) {
      this.setState({ usernameError: 'This field is required' });
    }
    if (!password) {
      this.setState({ passwordError: 'This field is required' });
    }
    if (!confirmPassword) {
      this.setState({ confirmPasswordError: 'This field is required' });
      return;
    }
    console.log(type);
    console.log(type === 'login');
    if (type === 'login') {
      login(username, password)
        .then(response => {
          context.setCurrentUser(username, password);
        })
        .catch(e => console.log(e));
      return;
    }
    // context.setCurrentUser(username, password);
    context.updateState({ username, password, currentPage: 'add vault', action: 'register' });
  }

  renderForm = (context, type) => {
    const {
      username,
      password,
      usernameError,
      passwordError,
      confirmPassword,
      confirmPasswordError,
      loading,
    } = this.state;
    const { classes } = this.props;
    if (context) {
      return (
        <form style={styles.formStyle}>
          <TextField
            id="username"
            name="username"
            label="Username"
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
          />
          <br />
          <TextField
            id="password"
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
          />
          {type === 'register' ? (
            <TextField
              id="confirm password"
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
            />
          ) : null}
          <br />
          <div style={{ position: 'relative' }}>
            <Button
              variant="raised"
              color="primary"
              fullWidth
              style={{ marginTop: '30px' }}
              onClick={() => this.handleLogin(context, type)}
              disabled={loading}
            >
              {type === 'register' ? 'Register' : 'Login'}
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </form>
      );
    }
  };

  render() {
    const { classes, theme } = this.props;
    const { value } = this.state;
    console.log(value);
    return (
      <MainContext.Consumer>
        {context => (
          <div className={classes.root}>
            <Tabs
              value={this.state.value}
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
                  // label: value === 0 ? classes.label : null,
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
              index={this.state.value}
              onChangeIndex={this.handleChangeIndex}
            >
              <TabContainer dir={theme.direction}>{this.renderForm(context, 'login')}</TabContainer>
              <TabContainer />
              <TabContainer dir={theme.direction}>{this.renderForm(context, 'register')}</TabContainer>
            </SwipeableViews>
          </div>
        )}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LoginForm);
