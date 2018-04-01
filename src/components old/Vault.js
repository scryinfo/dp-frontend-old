import React, { Component } from 'react';
import { Input, Button, Loader, Card, Icon, Statistic, Modal, Dropdown, Form } from 'semantic-ui-react';

import { newVault, importVault } from './keyRequests';

import { getPassword } from './requests';
import { create } from 'domain';

export default class Vault extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  async componentWillMount() {
    // this.props.updateBalance();
  }

  // Get value from get tokens field
  handleChange(event) {
    this.setState({ value: event.target.value });
    event.preventDefault();
  }

  createVault = async () => {
    // const this.props.username = await window.localStorage.getItem('this.props.username');
    // console.log(this.props.username);
    const password = await getPassword(this.props.username);

    try {
      const createdVault = await newVault(this.props.username, password);
      alert(`Your new mnemonics is ${createdVault.mnemonic}`);
      this.props.getCurrentUser('buyer', createdVault.address, this.props.username);
      this.props.updateBalance();
      // this.props.getCurrentUser('buyer', createdVault.address, this.props.username);
    } catch (e) {
      console.log(e);
    }
  };

  importVault = async () => {
    // const this.props.username = await window.localStorage.getItem('this.props.username');
    const password = await getPassword(this.props.username);
    const mnemonic = await prompt('Please enter your mnemonics');

    try {
      const importedVault = await importVault(this.props.username, password, mnemonic);
      // this.setState({ imported: `Imported successfully` });
      this.props.getCurrentUser('buyer', importedVault.address, this.props.username);
      this.props.updateBalance();
      // this.props.getCurrentUser('buyer', importedVault.address, this.props.username);
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      // <div className="seller-balance">
      <div>
        {!this.state.mnemonic ? (
          this.state.imported ? (
            <div>
              <div>Imported successfully</div>
              <div>Please refresh the page</div>
            </div>
          ) : (
            <div>
              <div>You don't have a vault yet</div>
              <Button.Group>
                <Button positive onClick={this.createVault}>
                  Create One
                </Button>
                <Button.Or />
                <Button onClick={this.importVault}>Import Existing</Button>
              </Button.Group>
            </div>
          )
        ) : (
          <div>
            <div>
              Your new mnemonic is: <span style={{ fontWeight: 'bold' }}>{this.state.mnemonic}</span>
            </div>
            <div>Please refresh the page</div>
          </div>
        )}
      </div>
      // </div>
    );
  }
}
