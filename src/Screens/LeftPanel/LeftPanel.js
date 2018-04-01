import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// Styled-Components
import styled from 'styled-components';

// React-router-transition
import { AnimatedSwitch, spring } from 'react-router-transition';

import { MainContext } from '../../Context';
import './LeftPanel.css';

import Menu from '../../Screens/LeftPanel/Menu/Menu';
import LoginLeftSide from '../../Screens/Login/LeftSide/LoginLeft';

function glide(val) {
  return spring(val, {
    stiffness: 174,
    damping: 24,
  });
}

const StyledAnimatedSwitch = styled(AnimatedSwitch)`
  position: relative;
  width: 350px;
  height: 100vh;
  background-color: #162632;
  box-sizing: border-box;

  & > div {
    position: absolute;
    width: 350px;
  }
`;

export default class LeftPanel extends Component {
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
      <StyledAnimatedSwitch
        {...this.state.pageTransitions}
        mapStyles={styles => ({
          transform: `translate3d(${styles.offset}%, 0, 0)`,
          // opacity: styles,
        })}
      >
        <Route path="/login" render={props => <LoginLeftSide {...props} />} />
        <Route path="/vault" render={props => <LoginLeftSide {...props} />} />
        <Route path="/" render={props => <Menu {...props} />} />
      </StyledAnimatedSwitch>
    );
  }
}
