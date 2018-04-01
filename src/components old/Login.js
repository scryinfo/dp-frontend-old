import React, { Component } from 'react';

import { Button, Form, Menu, Image } from 'semantic-ui-react';

import Logo from '../images/scry-logo.png';

import { getAccount } from './keyRequests';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      type: 'buyer',
      wrong: '',
      value: 'buyer',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    switch (event.target.name) {
      case 'loginUsername':
        this.setState({ username: event.target.value, wrong: '' });
        break;
      case 'loginPassword':
        this.setState({ password: event.target.value, wrong: '' });
        break;
      case 'signupUsername':
        this.setState({ username: event.target.value });
        break;
      case 'signupPassword':
        this.setState({ password: event.target.value });
        break;
      default:
    }
  }

  handleTypeChange(e, { value }) {
    this.setState({ value });
  }

  async handleSubmit(event) {
    if (this.state.username && this.state.password) {
      // getAccount(this.state.username, this.state.password)
      //   .then((response) => {
      //     this.props.getCurrentUser(
      //       this.state.value,
      //       response,
      //       this.state.username,
      //     );
      //   })
      //   .catch((err) => {
      //     this.setState({ wrong: 'wrong password' });
      //     console.log(err);
      //   });
      // this.props.getCurrentUser(this.state.username, this.state.password, this.state.value);

      // const existingUser = window.localStorage.getItem('username');
      // const existingPass = window.localStorage.getItem('password');

      // if (existingUser) {
      //   // IF EXIST
      //   if (existingUser === this.state.username && existingPass === this.state.password) {
      //     getAccount(this.state.username, this.state.password)
      //       .then((response) => {
      //         this.props.getCurrentUser('buyer', response, this.state.username);
      //       })
      //       .catch((err) => {
      //         this.props.getCurrentUser('buyer', null, this.state.username);
      //       });
      //     // this.props.getCurrentUser('buyer', null, this.state.username);
      //     return;
      //   }
      //   if (existingUser === this.state.username && existingPass !== this.state.password) {
      //     this.setState({ wrong: 'wrong password' });
      //     return;
      //   }
      // }
      // window.localStorage.setItem('username', this.state.username);
      // window.localStorage.setItem('password', this.state.password);
      this.props.getCurrentUser('buyer', null, this.state.username, this.state.password);

      return;
    }
    event.preventDefault();
  }

  render() {
    const { value } = this.state;
    return (
      // <div className="grid-container">
      //   <Menu pointing secondary size="large" fluid widths={8} className="header">
      //     <Menu.Item name="login" active>Login</Menu.Item>
      //     <Menu.Menu position="right">
      //       <Image src={Logo} />
      //     </Menu.Menu>
      //   </Menu>
      <div className="login-container">
        <h2>Login/Register</h2>
        <Form size="large" onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Username</label>
            <input
              placeholder="Username"
              value={this.state.username}
              name="loginUsername"
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>
              Password&nbsp;&nbsp;&nbsp;
              <span className="red">{this.state.wrong}</span>
            </label>
            <input
              type="password"
              placeholder="Password"
              value={this.state.password}
              name="loginPassword"
              onChange={this.handleChange}
            />
          </Form.Field>
          {/* <Form.Group inline>
              <label>I am</label>
              <Form.Radio label="Buyer" value="buyer" checked={value === 'buyer'} onChange={this.handleTypeChange} />
              <Form.Radio label="Seller" value="seller" checked={value === 'seller'} onChange={this.handleTypeChange} />
              <Form.Radio label="Verifier" value="verifier" checked={value === 'verifier'} onChange={this.handleTypeChange} />
            </Form.Group> */}
          <Button type="submit">Login</Button>
        </Form>
      </div>
      // </div>
    );
  }
}
