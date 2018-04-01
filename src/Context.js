/* eslint-disable */
import React, { Component } from 'react';

import { getAccount } from './Components/keyRequests';

export const MainContext = React.createContext();

export class MainProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: 'alex miller',
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

  async setCurrentUser(username, password) {
    console.log(`setting account ${username}`);
      const address = await getAccount(username, password);
      if (!address) {
        this.setState({ username, currentPage: 'add vault', password, action: 'login' });
        return;
      }
      this.setState({
        account: address, username, currentPage: 'explore', password,
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
        }}
      >
        {this.props.children}
      </MainContext.Provider>
    );
  }
}
