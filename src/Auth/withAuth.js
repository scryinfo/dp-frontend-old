import React, { Component } from 'react';
import AuthService from './AuthService';

const withAuth = AuthComponent => {
  const Auth = new AuthService();

  return class AuthWrapped extends Component {
    constructor() {
      super();
      this.state = {
        user: null,
      };
    }

    componentWillMount() {
      if (!Auth.loggedIn()) {
        this.props.history.replace('/login');
      } else {
        try {
          const profile = Auth.getProfile();
          this.setState({
            user: profile,
          });
        } catch (err) {
          Auth.logout();
          this.props.history.replace('/login');
        }
      }
    }

    render() {
      return <AuthComponent history={this.props.history} user={this.state.user} />;
    }
  };
};

export default withAuth;
