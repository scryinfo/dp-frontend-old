import React, { Component } from 'react';

import AuthService from './Auth/AuthService';
import withAuth from './Auth/withAuth';

import { MainProvider } from './Context';

import './App.css';

import LeftPanel from './Screens/LeftPanel/LeftPanel';
import ContentScreen from './Screens/ContentScreen/ContentScreen';

const Auth = new AuthService();

export default class App extends Component {
  render() {
    return (
      <div className="main-container">
        <MainProvider history={this.props.history}>
          <LeftPanel history={this.props.history} />
          <ContentScreen />
        </MainProvider>
      </div>
    );
  }
}
