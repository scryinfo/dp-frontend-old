import React, { Component } from 'react';
import { Input, Button, Loader, Card, Icon, Statistic, Modal, Dropdown, Form } from 'semantic-ui-react';

import moment from 'moment';

import { createWriteStream } from 'streamsaver';

import { _addTokens, _buyItem, _getItems, _getVerifiers } from './requests';

export default class Buyer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: this.props.balance,
      eth: this.props.eth,
      value: '',
      account: this.props.account,
      items: [],
      purchased: [],
      verifiers: [],
      cid: '',
      buyingLoader: false,
      downloadLocally: 'Download locally',
      viaIPFS: false,
      chosenVerifier: '',
      reward: '',
      errorMessage: '',
      requestPassword: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.getTokens = this.getTokens.bind(this);
    this.getItems = this.getItems.bind(this);
    this.chooseVerifier = this.chooseVerifier.bind(this);
    this.setReward = this.setReward.bind(this);
  }

  async componentWillMount() {
    // this.setState({ account: acc });
    this.getItems();
    console.log(this.state.account);
    console.log(createWriteStream);
    this.getPurchased();
    this.getVerifiers();
    // this.props.updateBalance();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.balance !== this.state.balance) {
      this.setState({ balance: nextProps.balance });
    }
    if (nextProps.eth !== this.state.eth) {
      this.setState({ eth: nextProps.eth });
    }
  }

  // Get the list of items
  async getItems() {
    try {
      const response = await _getItems();
      console.log(response.data);
      const items = response.data.sort((a, b) =>
        moment(b.created_at).unix() - moment(a.created_at).unix());
      this.setState({ items });
    } catch (e) {
      console.log(e);
    }
  }

  // Get the list of verifiers
  async getVerifiers() {
    try {
      const response = await _getVerifiers();
      const verifiers = response.data.map(verifier => ({
        key: verifier.id,
        text: verifier.name,
        value: verifier.account,
      }));
      this.setState({ verifiers });
    } catch (e) {
      console.log(e);
    }
  }

  // Get the list of purchased items
  async getPurchased() {
    try {
      const response = await _getItems(this.state.account, 'buyer');
      const purchasedItems = response.data;
      console.log(purchasedItems);
      const allItems = this.state.items.filter(item =>
        purchasedItems.filter(purchasedItem =>
          item.id === purchasedItem.listing.id).length === 0);
      if (purchasedItems) {
        const sortedItems = purchasedItems.sort((a, b) =>
          moment(b.created_date).unix() - moment(a.created_date).unix());
        this.setState({ purchased: sortedItems, items: allItems });
      }
    } catch (e) {
      console.log(e);
    }
  }

  // Add tokens
  async getTokens(event) {
    event.preventDefault();
    try {
      await _addTokens(this.state.account, this.state.value);
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

  confirmPassword = () => new Promise((resolve, reject) => {
    // symmetric vault key from password, only valid within callback
    vault.keyFromPassword(password, (err, key) => {
      if (err) {
        reject(err);
      }
      if (!vault.isDerivedKeyCorrect(key)) {
        reject(new Error('bad password'));
      }
      resolve(vault);
    });
  });

  // Buy an item
  async buy(item) {
    console.log(item);
    // Check
    if (this.state.chosenVerifier && !this.state.reward) {
      this.setState({ errorMessage: 'Please set a reward' });
      setTimeout(() => this.setState({ errorMessage: '' }), 3000);
      return;
    }
    if (this.state.chosenVerifier && (this.state.reward < 1 || this.state.reward > 100)) {
      this.setState({ errorMessage: 'Set reward from 1% to 99%' });
      setTimeout(() => this.setState({ errorMessage: '' }), 3000);
      return;
    }
    // Make request
    this.setState({ buyingLoader: true });
    try {
      const result = await _buyItem(item, this.state.username, this.state.account, this.state.chosenVerifier, this.state.reward);
      this.setState({ buyingLoader: false });
      this.getPurchased();
      console.log('result here', result);
    } catch (e) {
      console.log(e);
      // if (e.response.status === 400) {
      //   const errorMessage = e.response.data.error;
      //   this.setState({ errorMessage, buyingLoader: false });
      //   setTimeout(() => this.setState({ errorMessage: '' }), 3000);
      // }
      // if (e.response.status === 500) {
      //   this.setState({ errorMessage: 'Please buy some tokens', buyingLoader: false });
      //   setTimeout(() => this.setState({ errorMessage: '' }), 3000);
      // }
    }
  }

  // Set a verifier
  chooseVerifier(event, data) {
    console.log(data.value);
    this.setState({ chosenVerifier: data.value });
  }

  // Set a reward for verifier
  setReward(event, data) {
    console.log(data.value);
    this.setState({ reward: data.value });
  }


  _round = number => Math.round(number * 100) / 100;

  passwordModal = () => (
    <Modal
      dimmer={false}
      open={this.state.requestPassword}
      onOpen={this.open}
      onClose={this.close}
      size="tiny"
    >
      <Modal.Header>Please enter your password</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <input type="password" placeholder="Password" value={this.state.password} onChange={this.getPassword} />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button icon="cancel" content="Cancel" onClick={this.close} />
        <Button icon="check" primary content="Confirm" onClick={this.close} />
      </Modal.Actions>
    </Modal>
  )

  makeItem(item, index) {
    return (
      <div className="item" key={index}>
        <Modal
          basic
          dimmer="blurring"
          size="small"
          style={{ textAlign: 'center' }}
          onClose={() => this.setState({ chosenVerifier: '', reward: '' })}
          trigger={
            <Card>
              <Card.Content>
                <Card.Header>{item.name.length > 25 ? `${item.name.slice(0, 25)}...` : item.name}</Card.Header>
                <Card.Meta>Seller: {item.owner.name}</Card.Meta>
              </Card.Content>
              <Card.Content extra>
                <span className="left">
                  <Icon name="money" />
                  {item.price} Tokens {this.state.cid === item.cid ? <Icon name="cloud download" /> : null}
                </span>
                <span className="right">{item.size < 1024 * 1024 ? `${this._round(item.size / 1024)} kb` : item.size >= 1024 * 1024 && item.size < 1024 * 1024 * 1024 ? `${this._round(item.size / (1024 * 1024))} mb` : `${this._round(item.size / (1024 * 1024 * 1024))} gb`}</span>
                <this.passwordModal />
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
            <p><span style={{ fontWeight: 'bold' }}>Seller: </span> {item.owner.name}</p>
            <p><span style={{ fontWeight: 'bold' }}>Date uploaded: </span> {item.created_at}</p>
          </Modal.Content>
          {this.state.balance < item.price ?
            <Button disabled>
              <Icon name="info" />
              Not enough tokens
            </Button>
            :
            <div className="buy-form">
              <Form onSubmit={() => this.buy(item)}>
                <Form.Group>
                  <Dropdown placeholder="Select verifier" required search selection options={this.state.verifiers} onChange={this.chooseVerifier} className="verifier-dropdown" />
                  {this.state.chosenVerifier ?
                    <Form.Input placeholder="Set verifier's reward (%)" type="number" onChange={this.setReward} className="reward-width" />
                    : null
                  }
                  <Form.Button content={<span>&nbsp;&nbsp;Buy&nbsp;&nbsp;{this.state.buyingLoader ? <Loader active inline size="tiny" /> : null}</span>} />
                </Form.Group>
              </Form>
            </div>
          }
          <div className="error-message">{this.state.errorMessage}</div>
        </Modal>
      </div>
    );
  }


  purchasedItems(purchased, index) {
    const item = purchased.listing;
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
                <Card.Header>{item.name.length > 25 ? `${item.name.slice(0, 25)}...` : item.name}</Card.Header>
                <Card.Meta>Status: {purchased.needs_verification ? 'waiting for verification' : purchased.needs_closure ? 'verified. Waiting for seller to accept' : 'purchased'}</Card.Meta>
              </Card.Content>
              <Card.Content extra>
                <span className="left">
                  {moment(purchased.created_date).format('YYYY-MM-DD, HH:mm a')}
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
            <p><span style={{ fontWeight: 'bold' }}>Seller: </span>{item.owner.name}</p>
            <p><span style={{ fontWeight: 'bold' }}>Date purchased: </span>{purchased.created_at}</p>
            <p><span style={{ fontWeight: 'bold' }}>Status: </span>{purchased.needs_verification ? 'waiting for verification' : purchased.needs_closure ? 'verified. Waiting for seller to accept' : 'purchased'}</p>
          </Modal.Content>
          <Modal.Actions>
            {!purchased.needs_verification && !purchased.needs_closure ?
              <span>
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
              </span> : null}
          </Modal.Actions>
        </Modal>
      </div>
    );
  }


  render() {
    return (
      <div className="buyer-container">
        <div className="buyer-balance">
          <Statistic horizontal label="Tokens" value={this.state.balance === -1 ? <Loader active inline size="large" /> : this.state.balance} className="tokens" />
          <Statistic horizontal label="ETH" value={this.state.eth === -1 ? <Loader active inline size="large" /> : this.state.eth} className="tokens" />
          <div className="add-balance">
            <form onSubmit={this.getTokens}>
              <Input type="text" placeholder="Get more tokens" action>
                <input key="value" type="text" value={this.state.value} onChange={this.handleChange} />
                <Button type="submit">Add</Button>&nbsp;&nbsp;
              </Input>
            </form>
          </div>
        </div>
        {this.state.purchased.length > 0 ?
          <div className="items-list-header">Purchased items</div>
          :
          null
        }
        <div className="buyer-items">
          {this.state.purchased.map((item, index) => this.purchasedItems(item, index))}
        </div>
        {this.state.items.length > 0 ? <div className="items-list-header">More items</div> : null}
        <div className="buyer-items">
          {this.state.items.map((item, index) => this.makeItem(item, index))}
        </div>
      </div>
    );
  }
}
