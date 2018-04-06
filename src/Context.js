/* eslint-disable */
import React, { Component } from 'react';

import AuthService from './Auth/AuthService';

import { getAccount } from './Components/keyRequests';

import { _getBalance, _getItems } from './Components/requests';

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
      currentPage: 'explore',
      allItems: {}
    };
    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateBalance = this.updateBalance.bind(this)
    this.getItems = this.getItems.bind(this)
  }

  componentWillMount() {
    console.log('mounted');
    if (!Auth.loggedIn()) {
      console.log('not logged in');
      this.setState({ currentPage: 'login' });
      this.props.history.replace('/login');
    } else {
      try {
        const profile = Auth.getProfile();
        if (!localStorage.getItem(profile.name)) {
          console.log('nope');
          // throw new Error();
          this.setState({ currentPage: 'add vault' });
          this.props.history.push('/vault');
          // return;
        }
        this.setState({
          username: profile.name,
          address: profile.account,
        });
        
      } catch (err) {
        Auth.logout();
        this.setState({ currentPage: 'login' });
        this.props.history.replace('/login');
      }
    }
  }

  async getItems() {
    const { address } = this.state;
    try {
      const allItems = await _getItems();
      const myItems = await _getItems(address);
      const historyBuyer = await _getItems(address, 'buyer');
      const historySeller = await _getItems(address, 'seller');
      const historyVerifier = await _getItems(address, 'verifier');
      console.log(allItems, myItems, historyBuyer, historySeller, historyVerifier);
      this.setState({ 
        allItems, myItems, historyBuyer, historySeller, historyVerifier
       })
    } catch (e) {
      console.log(e);
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
      const response = await _getBalance(this.state.address);
      this.setState({
        balance: {
          tokens: response.data.balance,
          eth: response.data.eth,
        }
      })
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
          getItems: this.getItems,
        }}
      >
        {this.props.children}
      </MainContext.Provider>
    );
  }
}
