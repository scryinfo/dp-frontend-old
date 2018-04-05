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
        tokens: 0,
        eth: 0,
      },
      currentPage: 'login',
    };
    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateBalance = this.updateBalance.bind(this)
  }

  componentWillMount() {
    console.log('mounted');
    if (!Auth.loggedIn()) {
      console.log('not logged in');
      this.props.history.replace('/login');
    } else {
      try {
        const profile = Auth.getProfile();
        if (!localStorage.getItem(profile.name)) {
          console.log('nope');
          // throw new Error();
          this.props.history.push('/vault');
          // return;
        }
        this.setState({
          username: profile.name,
          address: profile.account,
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
  }

  async updateBalance() {
    // setTimeout(async () => {
      const response = await _getBalance(this.state.address);
      this.setState({
        balance: {
          tokens: response.data.balance,
          eth: response.data.eth,
        }
      })

    // }, 3000)
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
          updateBalance: this.updateBalance,
        }}
      >
        {this.props.children}
      </MainContext.Provider>
    );
  }
}
