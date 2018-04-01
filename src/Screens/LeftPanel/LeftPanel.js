import React, { Component } from 'react';
import './LeftPanel.css';

import { MainContext } from '../../Context';

import Menu from '../../Screens/LeftPanel/Menu/Menu';
import LoginLeftSide from '../../Screens/Login/LeftSide/LoginLeft';

export default class LeftPanel extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getCurrentPage = context => {
    switch (context.state.currentPage) {
      case 'login':
        return <LoginLeftSide />;
      case 'register':
        return <LoginLeftSide />;
      case 'add vault':
        return <LoginLeftSide />;
      default:
        return <Menu />;
    }
  };
  render() {
    return (
      <div className="left-panel-container">
        <MainContext.Consumer>{context => this.getCurrentPage(context)}</MainContext.Consumer>
      </div>
    );
  }
}
