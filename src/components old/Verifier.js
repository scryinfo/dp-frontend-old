import React, { Component } from 'react';

import moment from 'moment';

import { createWriteStream } from 'streamsaver';

import { Button, Loader, Card, Icon, Statistic, Modal, Input } from 'semantic-ui-react';

import { _verifyItem, _getItems, _addTokens } from './requests';

import TokensBlock from './TokensBlock';

export default class Verifier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: this.props.balance,
      value: '',
      eth: this.props.eth,
      cid: this.props.cid,
      account: this.props.account,
      items: [],
      verifyingLoader: false,
      downloadLocally: 'Download locally',
    };
    this.getTokens = this.getTokens.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentWillMount() {
    // this.props.updateBalance();
    this.getItems();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.balance !== this.state.balance) {
      this.setState({ balance: nextProps.balance });
    }
    if (nextProps.eth !== this.state.eth) {
      this.setState({ eth: nextProps.eth });
    }
    if (nextProps.cid !== this.state.cid) {
      this.setState({ cid: nextProps.cid });
    }
  }

  // Verify an item
  async verifyItem(item) {
    this.setState({ verifyingLoader: true });
    try {
      await _verifyItem(item, this.props.username);
      this.getItems();
      this.setState({ verifyingLoader: false });
    } catch (e) {
      console.log(e);
    }
  }

  // Get list of items to verify
  async getItems() {
    try {
      const response = await _getItems(this.props.account, 'verifier');
      const items = response.data;
      const sortedItems = items.sort((a, b) =>
        moment(b.created_date).unix() - moment(a.created_date).unix());
      this.setState({ items: sortedItems });
    } catch (e) {
      console.log(e);
    }
  }

  // Download a file as a stream
  downloadFile = async (url, name) => {
    try {
      const response = await fetch(url);
      const fileStream = createWriteStream(name);
      const writer = fileStream.getWriter();
      const reader = response.body.getReader();
      const pump = () => reader.read()
        .then(({ value, done }) => done
          ? writer.close()
          : writer.write(value).then(pump));
      await pump();
    } catch (e) {
      this.setState({ downloadLocally: 'Please install IPFS', viaIPFS: true });
      console.log(e);
    }
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

  // eslint-disable-next-line
  _round = number => Math.round(number * 100) / 100;

  itemsToVerify(toVerify, index) {
    const item = toVerify.listing;
    return (
      <div className="item" key={index}>
        <Modal
          basic
          size="small"
          style={{ textAlign: 'center' }}
          dimmer="blurring"
          trigger={
            <Card>
              <Card.Content>
                <Card.Header>{item.name}</Card.Header>
                <Card.Meta>Status: {toVerify.needs_verification ? 'Waiting for your verification' : toVerify.needs_closure ? 'Verified. Waiting for seller to accept' : 'Verified'}</Card.Meta>
              </Card.Content>
              <Card.Content extra>
                <span className="left">
                  <Icon name="money" />
                  {item.price} Tokens
                </span>
                <span className="right">{item.size < 1024 * 1024 ? `${this._round(item.size / 1024)} kb` : item.size >= 1024 * 1024 && item.size < 1024 * 1024 * 1024 ? `${this._round(item.size / (1024 * 1024))} mb` : `${this._round(item.size / (1024 * 1024 * 1024))} gb`}</span>
              </Card.Content>
            </Card>
          }
        >
          <div className="modal">
            <h1><Icon name="file" /> {item.name}</h1>
          </div>
          <Modal.Content>
            <p><span style={{ fontWeight: 'bold' }}>Price: </span> {item.price} Tokens</p>
            <p><span style={{ fontWeight: 'bold' }}>File size: </span> {item.size < 1024 * 1024 ? `${this._round(item.size / 1024)} kb` : item.size >= 1024 * 1024 && item.size < 1024 * 1024 * 1024 ? `${this._round(item.size / (1024 * 1024))} mb` : `${this._round(item.size / (1024 * 1024 * 1024))} gb`}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button primary onClick={() => this.downloadFile(`http://localhost:8080/ipfs/${item.cid}`, item.name)}>
              <Icon name="cloud download" />
              <span>{this.state.downloadLocally}</span>
            </Button>
            {this.state.viaIPFS ?
              <Button onClick={() => this.downloadFile(`https://gateway.ipfs.io/ipfs/${item.cid}`, item.name)}>
                <Icon name="cloud download" />
                <span>Download via IPFS.io</span>
              </Button>
              : null
            }
            {toVerify.needs_verification ?
              <Button color="green" inverted onClick={() => this.verifyItem(toVerify)}>
                <Icon name="checkmark" />
                  Verify &nbsp;{this.state.verifyingLoader ? <Loader active inline size="tiny" /> : null}
              </Button>
              :
              <Button disabled>
                <Icon name="checkmark" />
                Verified
              </Button>
            }
          </Modal.Actions>
        </Modal>
      </div>
    );
  }


  render() {
    console.log('iteeeeeeemss', this.state.items);
    return (
      <div className="seller-container">
        <TokensBlock
          account={this.props.account}
          username={this.props.username}
          updateBalance={this.props.updateBalance}
          balance={this.state.balance}
          eth={this.state.eth}
          getCurrentUser={this.props.getCurrentUser}
        />
        <div className="buyer-items">
          {this.state.items.map((item, index) => this.itemsToVerify(item, index))}
        </div>
      </div>
    );
  }
}

