/* eslint-disable */
import React, { Component } from 'react';

import AuthService from './Auth/AuthService';

import { getAccount } from './Components/keyRequests';

import { _getBalance } from './Components/requests';

export const MainContext = React.createContext();

const Auth = new AuthService();

export class MainProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: null,
      address: null,
      balance: {
        tokens: 1424,
        eth: 12,
      },
      currentPage: 'login',
    };
    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  componentWillMount() {
    if (!Auth.loggedIn()) {
      console.log('not logged in');
      this.props.history.replace('/login');
    } else {
      try {
        const profile = Auth.getProfile();
        console.log(profile);
        this.setState({
          username: profile.name,
        });
      } catch (err) {
        Auth.logout();
        this.props.history.replace('/login');
      }
    }
  }

  async setCurrentUser(username, password, address) {
    console.log(`setting account ${username}`);
      const getAddress = await getAccount(username, password);
      if (!getAddress) {
        this.setState({ username, vault: true, address, currentPage: 'add vault', password, action: 'login' });
        this.props.history.push('/vault');
        return;
      }
      this.setState({
        address: getAddress, username, currentPage: 'explore', password, vault: true,
      });
      this.props.history.push('/explore');
      setTimeout(async () => {
        const balance = await _getBalance(getAddress);
        console.log(balance);
      }, 3000)
  }

  updateState(newState) {
    this.setState(newState);
  }

  render() {
    return (
      <MainContext.Provider
        value={{
          state: this.state,
          setCurrentUser: this.setCurrentUser,
          updateState: this.updateState,
        }}
      >
        {this.props.children}
      </MainContext.Provider>
    );
  }
}
