import React, { Component } from 'react';

import 'semantic-ui-css/semantic.min.css';

import { _getBalance } from './requests';

import Seller from './Seller';
import Buyer from './Buyer';
import Verifier from './Verifier';
import { HOST } from './Remote';
import { initSigner } from './signer';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: -1,
      eth: -1,
      block: 0,
      sig: '',
      cid: 0,
      verSig: '',
      events: [],
      sellerEvent: [],
      type: this.props.type,
    };
    this._listenToEvents = this._listenToEvents.bind(this);

    this.updateBalance = this.updateBalance.bind(this);
  }

  async componentWillMount() {
    this._listenToEvents();
    this.updateBalance();
    initSigner();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.type !== this.props.type) {
  //     this.setState({ type: nextProps.type });
  //   }
  //   if (nextProps.account !== this.props.account) {
  //     this.setState({ account: nextProps.account });
  //   }
  // }

  // Function to update balance
  async updateBalance() {
    this.setState({ balance: -1, eth: -1 });
    try {
      console.log('updating balance', this.props.account);
      const response = await _getBalance(this.props.account);
      const { data } = response;
      this.setState({ balance: data.balance, eth: data.eth });
    } catch (e) {
      console.log(e);
    }
  }

  _listenToEvents() {
    console.log('subscribing');
    const evtSrc = new EventSource(`${HOST}/subscribe?user=${this.props.account}`);
    evtSrc.onmessage = e => {
      console.log(e);
      // console.log('getting message', e);
      // const event = JSON.parse(e.data);
      // if (event.args.)
      const { events } = this.state;
      events.push(e.data);
      this.setState({ events });
      const event = JSON.parse(e.data);

      console.log('event', event);
    };
  }

  render() {
    return (
      <div className="container">
        {this.props.type === 'buyer' ? (
          <Buyer
            balance={this.state.balance}
            eth={this.state.eth}
            updateBalance={this.updateBalance}
            sig={this.state.sig}
            getSig={this.getSig}
            block={this.state.block}
            getBlock={this.getBlock}
            account={this.props.account}
            username={this.props.username}
            getCurrentUser={this.props.getCurrentUser}
          />
        ) : null}
        {this.props.type === 'seller' ? (
          <Seller
            balance={this.state.balance}
            eth={this.state.eth}
            updateBalance={this.updateBalance}
            event={this.state.sellerEvent}
            block={this.state.block}
            sig={this.state.sig}
            sendToVerifier={this.sendToVerifier}
            cid={this.state.cid}
            verSig={this.state.verSig}
            account={this.props.account}
            username={this.props.username}
            getCurrentUser={this.props.getCurrentUser}
          />
        ) : null}
        {this.props.type === 'verifier' ? (
          <Verifier
            balance={this.state.balance}
            eth={this.state.eth}
            updateBalance={this.updateBalance}
            getVerSig={this.getVerSig}
            cid={this.state.cid}
            account={this.props.account}
            username={this.props.username}
            getCurrentUser={this.props.getCurrentUser}
          />
        ) : null}
      </div>
    );
  }
}

export default Main;
