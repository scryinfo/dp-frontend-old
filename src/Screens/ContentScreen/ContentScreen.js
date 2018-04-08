import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './ContentScreen.css';

import { MainContext } from '../../Context';

import LoginRightSide from '../../Screens/Login/RightSide/LoginRight';

import ContentContainer from './ContentContainer/ContentContainer';

export default class ContentScreen extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <MainContext.Consumer>
        {context => (
          <div className="content-screen-container">
            <Switch>
              <Route path="/login" render={props => <LoginRightSide {...props} history={this.props.history} />} />
              <Route path="/vault" render={props => <LoginRightSide {...props} history={this.props.history} />} />
              <Route path="/" render={props => <ContentContainer {...props} history={this.props.history} />} />
            </Switch>
          </div>
        )}
      </MainContext.Consumer>
    );
  }
}
