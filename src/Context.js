/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import 'event-source-polyfill/src/eventsource.min.js';

import moment from 'moment';

import AuthService from './Auth/AuthService';

import { initSigner } from './Components/signer';

import { HOST } from './Components/Remote';

import { getAccount } from './Components/keyRequests';

import { _getBalance, _getItems, _getVerifiers } from './Components/requests';

import InfoPopup from './Screens/InfoPopup';

export const MainContext = React.createContext();

const Auth = new AuthService();

export class MainProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: '',
      username: null,
      address: null,
      balance: {
        tokens: 0,
        eth: 0,
      },
      searchValue: '',
      currentPage: 'explore',
      allItems: [],
      myItems: [],
      historyBuyer: [],
      historySeller: [],
      historyVerifier: [],
      itemsBought: [],
      itemsSold: [],
      itemsVerified: [],
      inProgressBought: [],
      inProgressSold: [],
      inProgressVerified: [],
      verifiers: [],
      foundItems: [],
      notifications: {},
    };
    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.getItems = this.getItems.bind(this);
    this.getVerifiers = this.getVerifiers.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.logout = this.logout.bind(this);
    this.pageLoaded = this.pageLoaded.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.addNotification = this.addNotification.bind(this);
    this.removeNotifications = this.removeNotifications.bind(this);
  }

  componentWillMount() {
    if (!Auth.loggedIn()) {
      this.setState({ currentPage: 'login' });
      this.props.history.replace('/login');
    } else {
      try {
        const profile = Auth.getProfile();
        if (!localStorage.getItem(profile.name)) {
          // throw new Error();
          this.setState({ currentPage: 'add vault' });
          this.props.history.push('/vault');
          this.setState({
            username: profile.name,
            address: profile.account,
          });
          return;
        }
        this.setState({
          username: profile.name,
          address: profile.account,
        });
        this.props.history.push('/explore');
      } catch (err) {
        this.logout();
      }
    }
  }

  logout() {
    Auth.logout();
    this.setState({ currentPage: 'login' });
    this.props.history.replace('/login');
  }

  async pageLoaded() {
    await initSigner();
    this.updateBalance();
    this.getItems();
    this.getVerifiers();
    this._listenToEvents();
  }

  _listenToEvents() {
    const { address: account } = this.state;
    console.log('subscribing');
    const evtSrc = new window.EventSourcePolyfill(`${HOST}/subscribe?user=${this.state.address}`, {
      headers: { JWT: localStorage.getItem('id_token'), withCredentials: true },
    });
    evtSrc.addEventListener('message', async e => {
      console.log(e);
      const event = JSON.parse(e.data);
      const { event: type } = event;
      console.log(event);

      // TRANSFER
      if (type === 'Transfer') {
        const { to, from } = event.args;
        if (to.toLowerCase() === account.toLowerCase()) {
          console.log('you got the money');
        }
        if (from.toLowerCase() === account.toLowerCase()) {
          console.log('you sent the money');
        }
      }

      // CHANNEL CREATED
      if (type === 'ChannelCreated') {
        const { receiver, sender, verifier } = event.args;
        if (receiver.toLowerCase() === account.toLowerCase()) {
          this.showPopup('You have a purchase in progress');
          this.addNotification('sold');
          this.updateBalance();
          this.getItems();
        }
        if (sender.toLowerCase() === account.toLowerCase()) {
          console.log('you buying something');
          await this.updateBalance();
          await this.getItems();
          this.addNotification('purchased');
        }
        // if (verifier.toLowerCase() === account.toLowerCase()) {
        //   console.log('you verifying something');
        // }
      }

      // CHANNEL CLOSED
      if (type === 'ChannelSettled') {
        const { receiver, sender, verifier } = event.args;
        if (receiver.toLowerCase() === account.toLowerCase()) {
          // this.showPopup('Sold');
          this.addNotification('sold');
        }
        if (sender.toLowerCase() === account.toLowerCase()) {
          console.log('you buying something');
          await this.updateBalance();
          await this.getItems();
          this.showPopup('Item purchase complete');
          this.addNotification('purchased');
        }
        if (verifier.toLowerCase() === account.toLowerCase()) {
          console.log('you verifying something');
          this.showPopup('Item you verified is complete');
          this.addNotification('verified');
          this.updateBalance();
          this.getItems();
        }
      }
      // this.getVerifiers();
    });
  }

  addNotification(type) {
    this.setState({ notifications: { [type]: true } });
    setTimeout(() => this.setState({ notifications: {} }), 15000);
  }

  removeNotifications() {
    this.setState({ notifications: {} });
  }

  async getVerifiers() {
    try {
      // get list of verifiers
      let { data: verifiers } = await _getVerifiers();
      // sort newest to oldest
      verifiers = verifiers.sort((a, b) => moment(b.created_at).unix() - moment(a.created_at).unix());
      this.setState({ verifiers });
    } catch (e) {
      console.log(e);
    }
  }

  onSearch({ target: { value } }) {
    this.setState({ searchValue: value });
    const { currentPage, allItems } = this.state;
    if (currentPage === 'explore' && allItems.length > 0) {
      const foundItems = allItems.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
      this.setState({ foundItems });
      console.log(foundItems);
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

      console.log({ allItems, myItems, historyBuyer, historySeller, historyVerifier });

      // filter out items that are already purchased
      // allItems = allItems.filter(
      //   item =>
      //     myItems.filter(myItem => item.id === myItem.id).length === 0 &&
      //     historyBuyer.filter(buyerItem => item.id === buyerItem.listing.id).length === 0 &&
      //     historySeller.filter(sellerItem => item.id === sellerItem.listing.id).length === 0
      //   // && historyVerifier.filter(verifierItem => item.id === verifierItem.listing.id).length === 0
      // );

      // sort all items
      allItems = allItems.sort((a, b) => b.id - a.id);

      // sort my items
      myItems = myItems.sort((a, b) => b.id - a.id);

      // Transaction closed
      const itemsBought = this.getClosed(historyBuyer);
      const itemsSold = this.getClosed(historySeller);
      const itemsVerified = this.getClosed(historyVerifier);

      // Transaction in progress
      const inProgressBought = this.getInProgress(historyBuyer);
      const inProgressSold = this.getInProgress(historySeller);
      const inProgressVerified = this.getInProgress(historyVerifier);

      console.log({ historyVerifier });

      this.setState({
        allItems,
        myItems,
        historyBuyer,
        historySeller,
        historyVerifier,
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

  showPopup(status, progress) {
    if (progress) {
      this.setState({ status });
      return;
    }
    this.setState({ status });
    setTimeout(() => {
      if (this.state.status === status) {
        this.setState({ status: '' });
      }
    }, 3000);
  }

  render() {
    return (
      <MainContext.Provider
        value={{
          state: this.state,
          setCurrentUser: this.setCurrentUser,
          updateState: this.updateState,
          showPopup: this.showPopup,
          updateBalance: this.updateBalance,
          getItems: this.getItems,
          logout: this.logout,
          pageLoaded: this.pageLoaded,
          onSearch: this.onSearch,
          removeNotifications: this.removeNotifications,
        }}
      >
        {this.props.children}
        <InfoPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
      </MainContext.Provider>
    );
  }
}
