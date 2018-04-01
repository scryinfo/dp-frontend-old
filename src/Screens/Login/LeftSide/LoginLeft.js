import React, { Component } from 'react';

import { Route } from 'react-router-dom';

// Styled-Components
import styled from 'styled-components';

// React-router-transition
import { AnimatedSwitch, spring } from 'react-router-transition';

import { MainContext } from '../../../Context';

import './LoginLeft.css';

import LoginForm from './LoginForm/LoginForm';
import AddVault from './AddVault/AddVault';

function glide(val) {
  return spring(val, {
    stiffness: 174,
    damping: 24,
  });
}

const StyledAnimatedSwitch = styled(AnimatedSwitch)`
  position: relative;
  width: 100%;

  & > div {
    position: absolute;
    width: 100%;
    height: 100vh;
    padding-left: 40px;
    padding-right: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
  }
`;

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      pageTransitions: {
        atEnter: {
          offset: 100,
        },
        atLeave: {
          offset: glide(-100),
        },
        atActive: {
          offset: glide(0),
        },
      },
    };
  }

  // getCurrentPage = context => {
  //   switch (context.state.currentPage) {
  //     case 'login':
  //       return <LoginForm />;
  //     case 'register':
  //       return <LoginForm />;
  //     case 'add vault':
  //       return <AddVault />;
  //     default:
  //       return <div />;
  //   }
  // };

  render() {
    return (
      <StyledAnimatedSwitch
        {...this.state.pageTransitions}
        mapStyles={styles => ({
          transform: `translate3d(${styles.offset}%, 0, 0)`,
        })}
      >
        <Route path="/login" render={props => <LoginForm {...props} />} />
        <Route path="/vault" render={props => <AddVault {...props} />} />
        {/* <MainContext.Consumer>{context => this.getCurrentPage(context)}</MainContext.Consumer> */}
      </StyledAnimatedSwitch>
    );
  }
}
