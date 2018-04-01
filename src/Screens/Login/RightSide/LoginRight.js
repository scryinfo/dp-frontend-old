import React, { Component } from 'react';
import './LoginRight.css';

import Logo from '../../../assets/images/logo.png';

export default class ContentScreen extends Component {
  render() {
    return (
      <div className="login-right-container">
        <div className="login-right-logo-main-container">
          <div className="login-right-logo-container">
            <img src={Logo} alt="" className="login-right-logo" />
          </div>
          <div className="login-right-logo-title">SCRY.INFO</div>
          <div className="login-right-logo-subtitle">TOWARDS A BLOCKCHAIN SCIENCE OF HUMAN BEINGS</div>
        </div>
      </div>
    );
  }
}
