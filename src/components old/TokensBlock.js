import React, { Component } from 'react';
import { Input, Button, Loader, Card, Icon, Statistic, Modal, Dropdown, Form } from 'semantic-ui-react';

import moment from 'moment';

import { createWriteStream } from 'streamsaver';

import { _addTokens, _buyItem, _getItems, _getVerifiers } from './requests';

import Vault from './Vault';

export default class TokensBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.getTokens = this.getTokens.bind(this);
  }

  async componentWillMount() {
    // this.props.updateBalance();
  }

  // Add tokens
  async getTokens(event) {
    event.preventDefault();
    try {
      await _addTokens(this.props.account, this.state.value);
      this.props.updateBalance();
      this.setState({ value: '' });
    } catch (e) {
      console.log(e);
    }
  }

  // Get value from get tokens field
  handleChange(event) {
    this.setState({ value: event.target.value });
    event.preventDefault();
  }


  render() {
    return (
      <div className="seller-balance">
        {!this.props.account ?
          <Vault
            getCurrentUser={this.props.getCurrentUser}
            updateBalance={this.props.updateBalance}
            username={this.props.username}
          />
          :
          <div>
            <Statistic horizontal label="Tokens" value={this.props.balance === -1 ? <Loader active inline size="large" /> : this.props.balance} className="tokens" />
            <Statistic horizontal label="ETH" value={this.props.eth === -1 ? <Loader active inline size="large" /> : this.props.eth} className="tokens" />
            <div className="add-balance">
              <form onSubmit={this.getTokens}>
                <Input type="text" placeholder="Get more tokens" action>
                  <input key="value" type="text" value={this.state.value} onChange={this.handleChange} />
                  <Button type="submit">Add</Button>&nbsp;&nbsp;
                </Input>
              </form>
            </div>
          </div>
        }
      </div>
    );
  }
}
