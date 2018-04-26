/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';

import AuthService from './Auth/AuthService';

import { getAccount } from './Components/keyRequests';

import { _getBalance, _getItems, _getVerifiers } from './Components/requests';

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
      allItems: [],
      myItems: [],
      itemsBought: [],
      itemsSold: [],
      itemsVerified: [],
      inProgressBought: [],
      inProgressSold: [],
      inProgressVerified: [],
      verifiers: [],
    };
    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.getItems = this.getItems.bind(this);
    this.getVerifiers = this.getVerifiers.bind(this);
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
        this.getVerifiers();
        this.props.history.push('/explore');
      } catch (err) {
        Auth.logout();
        this.setState({ currentPage: 'login' });
        this.props.history.replace('/login');
      }
    }
  }

  async getVerifiers() {
    try {
      const { data: verifiers } = await _getVerifiers();
      console.log(verifiers);
      this.setState({ verifiers });
    } catch (e) {
      console.log(e);
    }
  }

  async getItems() {
    const { address } = this.state;
    try {
      let { data: allItems } = await _getItems();
      let { data: myItems } = await _getItems(address);
      const { data: historyBuyer } = await _getItems(address, 'buyer');
      const { data: historySeller } = await _getItems(address, 'seller');
      const { data: historyVerifier } = await _getItems(address, 'verifier');

      // All items
      allItems = allItems.sort((a, b) => b.id - a.id);

      // My items
      myItems = myItems.sort((a, b) => b.id - a.id);

      // Transaction closed
      const itemsBought = this.getClosed(historyBuyer);
      const itemsSold = this.getClosed(historySeller);
      const itemsVerified = this.getClosed(historyVerifier);

      // Transaction in progress
      const inProgressBought = this.getInProgress(historyBuyer);
      const inProgressSold = this.getInProgress(historySeller);
      const inProgressVerified = this.getInProgress(historyVerifier);

      this.setState({
        allItems,
        myItems,
        itemsBought,
        itemsSold,
        itemsVerified,
        inProgressBought,
        inProgressSold,
        inProgressVerified,
      });
    } catch (e) {
      console.log(e);
    }
  }

  getInProgress = list => list.filter(data => data.needs_closure).sort((a, b) => b.created_at - a.created_at);

  getClosed = list => list.filter(data => !data.needs_closure).sort((a, b) => b.created_at - a.created_at);

  async setCurrentUser(username, password, address) {
    const getAddress = await getAccount(username, password);
    if (!getAddress) {
      this.setState({ username, vault: true, address, currentPage: 'add vault', password, action: 'login' });
      this.props.history.push('/vault');
      return;
    }
    this.setState({
      address: getAddress,
      username,
      currentPage: 'explore',
      password,
      vault: true,
    });
    this.props.history.push('/explore');
  }

  async updateBalance() {
    const response = await _getBalance(this.state.address);
    this.setState({
      balance: {
        tokens: response.data.balance,
        eth: response.data.eth,
      },
    });
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
