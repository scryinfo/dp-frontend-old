import React, { Component } from 'react';
// import RaisedButton from 'material-ui/RaisedButton';

import Button from 'material-ui/Button';

import './AddVault.css';

import { newVault } from '../../../../Components/keyRequests';

import { register } from '../../../../Components/requests';

import { MainContext } from '../../../../Context';

export default class AddVault extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async handleNewVault(context) {
    console.log(context);
    if (context) {
      const { username, password } = context.state;
      try {
        const createdVault = await newVault(username, password);
        const { address, mnemonic } = createdVault;
        register(username, password, address)
          .then(response => {
            console.log('response', response, response.data.name, username);
            console.log('inside');
            context.updateState({ currentPage: 'explore' });
          })
          .catch(e => console.log(e));
        // context.updateState({ address, mnemonic, currentPage: 'explore' });
        console.log(address, mnemonic);
      } catch (e) {
        console.log(e);
      }
    }
  }

  render() {
    return (
      <MainContext.Consumer>
        {context => (
          <div>
            {context.state.action === 'login' ? (
              <div className="add-vault-text">Welcome back, {context.state.username}</div>
            ) : (
              context.state.action === 'register' && (
                <div className="add-vault-text">Hello, {context.state.username}</div>
              )
            )}
            <div className="add-vault-text">You don't have a vault yet</div>
            <div className="add-vault-buttons">
              {/* <RaisedButton
                label="CREATE ONE"
                fullWidth
                labelColor="#ffffff"
                backgroundColor="#4AA4E0"
                onClick={() => this.handleNewVault(context)}
              /> */}
              <Button variant="raised" color="primary" fullWidth>
                Create one
              </Button>
              <div className="add-vault-or">or</div>
              {/* <RaisedButton label="IMPORT EXISTING" fullWidth labelColor="#ffffff" backgroundColor="#4AA4E0" /> */}
              <Button variant="raised" color="primary" fullWidth>
                Import existing
              </Button>
            </div>
          </div>
        )}
      </MainContext.Consumer>
    );
  }
}
