import React, { Component } from 'react';
import './ContentScreen.css';

import { MainContext } from '../../Context';

import LoginRightSide from '../../Screens/Login/RightSide/LoginRight';

export default class ContentScreen extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getCurrentPage = context => {
    switch (context.state.currentPage) {
      case 'login':
        return <LoginRightSide />;
      case 'register':
        return <LoginRightSide />;
      case 'add vault':
        return <LoginRightSide />;
      default:
        return <div />;
    }
  };

  render() {
    return (
      <MainContext.Consumer>
        {context => <div className="content-screen-container">{this.getCurrentPage(context)}</div>}
      </MainContext.Consumer>
    );
  }
}
