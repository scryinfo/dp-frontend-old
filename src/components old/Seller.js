import React, { Component } from 'react';

import { Button, Icon, Loader, Progress, Card, Input, Modal } from 'semantic-ui-react';

import axios from 'axios';
import moment from 'moment';
import { _closeTransaction, _addTokens, _getItems } from './requests';
import { HOST } from './Remote';

import TokensBlock from './TokensBlock';

export default class Seller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: this.props.balance,
      eth: this.props.eth,
      event: this.props.event,
      fileName: '',
      fileSize: '',
      file: 0,
      done: true,
      uploadProgress: 0,
      itemPrice: 0,
      status: '',
      items: [],
      sold: [],
      viaScry: false,
      uploadText: 'Upload',
    };
    this.closeTransaction = this.closeTransaction.bind(this);
    this.setItemPrice = this.setItemPrice.bind(this);
    this.getTheFile = this.getTheFile.bind(this);
    this.getItems = this.getItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getTokens = this.getTokens.bind(this);

    this.onFileChange = this.onFileChange.bind(this);
  }

  async componentWillMount() {
    this.getItems();
    this.getSold();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.balance !== this.state.balance) {
      this.setState({ balance: nextProps.balance });
    }
    if (nextProps.eth !== this.state.eth) {
      this.setState({ eth: nextProps.eth });
    }
    if (nextProps.event !== this.state.event) {
      this.setState({ event: nextProps.event });
    }
  }


  // Get sold items
  async getSold() {
    try {
      const response = await _getItems(this.props.account, 'seller');
      const items = response.data;
      if (items) {
        console.log(items);
        const sortedItems = items.sort((a, b) =>
          moment(b.created_date).unix() - moment(a.created_date).unix());
        this.setState({ sold: sortedItems });
      }
    } catch (e) {
      console.log(e);
    }
  }


  async onFileChange(event, server) {
    event.stopPropagation();
    event.preventDefault();
    this.setState({ uploadStatus: '', uploadProgress: '', status: '' });
    const { file } = this.state;
    const fileSize = file.size;
    const fileName = file.name;
    this.setState({ fileName, fileSize });

    // eslint-disable-next-line
    const data = new FormData();
    data.append('data', file);

    let whereToUpload = 'locally';
    let url = 'http://127.0.0.1:8080/ipfs/';
    if (server === 'scry') {
      url = 'https://dev.scry.info/scry/seller/upload';
      whereToUpload = 'to Scry.info';
    }
    axios({
      method: 'POST',
      url,
      headers: {
        'content-type': 'multipart/form-data',
      },
      data,
      onUploadProgress: (progress) => {
        const status = Math.floor((progress.loaded / progress.total) * 100);
        this.setState({ uploadProgress: status, status: `Uploading ${whereToUpload}: ${status}% done` });
      },
    })
      .then((response) => {
        console.log(response);
        const ipfsId = response.headers['ipfs-hash'];
        console.log(ipfsId);
        axios.post(`${HOST}/seller/upload?account=${this.props.account}&name=${this.state.fileName}&CID=${ipfsId}&size=${this.state.fileSize}&price=${this.state.itemPrice}&username=${this.props.username}`)
          .then((res) => {
            console.log('uploaded', res);
            this.setState({
              done: true, status: 'Uploaded successfully', uploadProgress: 0, file: 0,
            });
            this.getItems();
            setTimeout(() => this.setState({ status: '' }), 3000);
          });
      }).catch((err) => {
        console.log(err.request);
        if (err.request.status === 405) {
          console.log('request', err);
          this.setState({ status: 'IPFS should be writable', done: true });
          return;
        }
        if (!err.request.response) {
          console.log('Please install IPFS');
          this.setState({
            status: 'Seems like you don\'t have IPFS installed, would you like to upload through Scry.info instead?',
            done: true,
            viaScry: true,
            uploadText: 'Install IPFS',
          });
          return;
        }
        if (err.request.status === 400) {
          console.log('request', err);
          this.setState({ status: 'File already exists. Try another', done: true });
        }
      });
  }


  getTheFile(event) {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    console.log('file here', file);
    this.setState({ file, status: '' });
  }

  // Get the list of purchased items
  async getItems() {
    try {
      const response = await _getItems(this.props.account);
      const items = response.data;
      const sortedItems = items.sort((a, b) =>
        moment(b.created_at).unix() - moment(a.created_at).unix());
      this.setState({ items: sortedItems });
    } catch (e) {
      console.log(e);
    }
  }

  // Close the pending transaction
  async closeTransaction(item) {
    this.setState({ closeLoader: true });
    console.log(item);
    try {
      await _closeTransaction(item.id, this.props.username);
      this.getSold();
      this.setState({ closeLoader: false });
    } catch (e) {
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

  setItemPrice(event) {
    this.setState({ itemPrice: event.target.value });
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    event.preventDefault();
  }


  _round = number => Math.round(number * 100) / 100;

  // eslint-disable-next-line
  makeItem(item, index) {
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
            <p><span style={{ fontWeight: 'bold' }}>Date uploaded: </span>{item.created_at}</p>
          </Modal.Content>
        </Modal>
      </div>
    );
  }


  // eslint-disable-next-line
  sold(item, index) {
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
              </Card.Content>
              <Card.Content extra>
                <span className="left">
                  Items sold: {item.sold}
                </span>
                <span className="right">
                  <Icon name="money" />
                  {item.price} Tokens
                </span>
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
            <p><span style={{ fontWeight: 'bold' }}>Date uploaded: </span>{item.created_at}</p>
          </Modal.Content>
        </Modal>
      </div>
    );
  }


  inProgress(pending, index) {
    const item = pending.listing;
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
                <Card.Meta>Status: {pending.needs_verification ? 'Waiting for verification' : pending.needs_closure ? 'Verified. Waiting for your confirmation' : 'pending'}</Card.Meta>
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
            <p><span style={{ fontWeight: 'bold' }}>Date uploaded: </span>{item.created_at}</p>
          </Modal.Content>
          <Modal.Actions>
            {pending.needs_verification ?
              <Button color="green" disabled>
                <Icon name="checkmark" />
                Not verificated
              </Button>
            :
            pending.needs_closure ?
              <Button color="green" inverted onClick={() => this.closeTransaction(pending)}>
                <Icon name="checkmark" />
                Confirm &nbsp;{this.state.closeLoader ? <Loader active inline size="tiny" /> : null}
              </Button>
              :
              <Button disabled>
                <Icon name="checkmark" />
                Sold
              </Button>
            }
          </Modal.Actions>
        </Modal>
      </div>
    );
  }


  render() {
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
        <div className="seller-upload">
          <div className="upload-container">
            <h1 className="upload-header">Sell something</h1>
            <div className="upload-header">
              Upload a file&nbsp;&nbsp;&nbsp;
              <label htmlFor="file-input">
                <div className="ui button"><Icon name="cloud upload" />Choose a file</div>{this.state.file ? <span><Icon name="check" /></span> : null}
              </label><span>{this.state.uploadStatus}</span>
              <input id="file-input" type="file" name="file" onChange={this.getTheFile} />
            </div>
            <div className="upload-header" style={{ color: '#575757' }}>{this.state.file.name}</div>
            <div className="upload-header">
              Set a price&nbsp;&nbsp;&nbsp;
              <Input type="text" placeholder="Enter amount here">
                <input key="value" type="number" min="1" required value={this.state.itemPrice} onChange={this.setItemPrice} />
              </Input>
            </div>
            <div className="upload-header">
              <div className="ui">
                <Button.Group>
                  <Button primary onClick={e => this.onFileChange(e)}>{this.state.uploadText} {!this.state.done ? <Loader active inline size="small" /> : null}</Button>
                  {this.state.viaScry ?
                    <Button secondary onClick={e => this.onFileChange(e, 'scry')}>Upload to Scry.info{!this.state.done ? <Loader active inline size="small" /> : null}</Button>
                    :
                    null
                  }

                </Button.Group>
                {/* <Button basic color="green" >Upload locally</Button>
                <Button basic color="green" onClick={e => this.onFileChange(e)}>Upload to Scry.info</Button> {!this.state.done ? <Loader active inline size="small" /> : null} */}
              </div>
            </div>
            <div className="upload-header">
              <div className="ui">
                {this.state.status}
              </div>
            </div>
            <div className="upload-progress">
              <Progress percent={this.state.uploadProgress} indicating />
            </div>
          </div>
        </div>
        {this.state.sold.length > 0 ? <div className="items-list-header">In progress</div> : null}
        {this.state.sold ?
          <div className="seller-items">
            {this.state.sold.map((item, index) => this.inProgress(item, index))}
          </div>
          : null
        }
        {this.state.items.filter(item => item.sold).length > 0 ? <div className="items-list-header">Sold</div> : null}
        <div className="seller-items">
          {this.state.items.filter(item => item.sold).map((item, index) => this.sold(item, index))}
        </div>
        {this.state.items.filter(item => !item.sold).length > 0 ? <div className="items-list-header">My items</div> : null}
        <div className="seller-items">
          {this.state.items.filter(item => !item.sold).map((item, index) => this.makeItem(item, index))}
        </div>
      </div>
    );
  }
}
