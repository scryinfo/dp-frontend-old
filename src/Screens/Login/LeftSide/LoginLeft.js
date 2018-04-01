import React, { Component } from 'react';

import { MainContext } from '../../../Context';

import './LoginLeft.css';

import LoginForm from './LoginForm/LoginForm';
import AddVault from './AddVault/AddVault';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getCurrentPage = context => {
    switch (context.state.currentPage) {
      case 'login':
        return <LoginForm />;
      case 'register':
        return <LoginForm />;
      case 'add vault':
        return <AddVault />;
      default:
        return <div />;
    }
  };

  render() {
    return (
      <div className="login-container">
        <MainContext.Consumer>{context => this.getCurrentPage(context)}</MainContext.Consumer>
      </div>
    );
  }
}
