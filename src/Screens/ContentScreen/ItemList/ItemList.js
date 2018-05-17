import React, { Component, Fragment } from 'react';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { Paper, Button, Collapse, Typography, Modal, TextField, Select } from 'material-ui';
import { InputLabel, InputAdornment } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';

import classNames from 'classnames';

import moment from 'moment';

import { _buyItem, _closeTransaction, _verifyItem } from '../../../Components/requests';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: '#162632',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  roo: {
    width: '5%',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      // backgroundColor: theme.palette.background.default,
    },
  },
});

class CustomizedTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  componentDidMount() {}

  formatName = name => (name.length > 22 ? `${name.substring(0, 19)}...` : name);

  // PURCHASE ITEM
  buyItem = async item => {
    const { username, address } = this.context.state;
    const { verifier, reward } = this.state;
    this.spinLoader('buy');
    try {
      await this.checkForErrors(item);
      const password = await this.passwordModal.open();
      await _buyItem(item, username, password, address, verifier, reward);
      this.context.showPopup('purchased successfully');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      if (e && e.message) {
        this.context.showPopup(e.message);
        return;
      }
      this.context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('buy');
    }
  };

  // Loader
  spinLoader = action => {
    this.setState({
      loader: {
        [action]: true,
      },
    });
  };
  stopLoader = action => {
    this.setState({
      loader: {
        [action]: false,
      },
    });
  };

  formatFileSize = (bytes, decimalPoint) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const dm = decimalPoint || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  renderStatus = item => {
    console.log({ item });
    if (item.needs_verification) return 'Waiting for verification';
    if (item.need_closure) return 'Waiting for seller';
    return 'Purchased';
  };

  checkForErrors = item =>
    new Promise((resolve, reject) => {
      const { verifier, reward } = this.state;
      if (verifier && verifier !== 'none') {
        // check if reward correct
        if (reward < 1 || reward > 99) {
          reject('reward should be more than 1% and less than 99%');
          return;
        }
      }
      if (this.context.state.balance.tokens < item.price) {
        reject("you don't have enough tokens");
        return;
      }
      resolve();
    });

  // Verify an item
  verify = async item => {
    const { username } = this.context.state;
    if (this.context.state.balance.tokens === 0) {
      this.context.showPopup('please get some tokens');
      return;
    }

    this.spinLoader('verify');
    try {
      const password = await this.passwordModal.open();
      await _verifyItem(item, username, password);
      this.setState({ item: null });
      this.props.history.push('/verified');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      this.context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('verify');
    }
  };

  // Close transaction
  closeTransaction = async item => {
    const { username } = this.context.state;
    if (this.context.state.balance.tokens === 0) {
      this.context.showPopup('please get some tokens');
      return;
    }

    this.spinLoader('closeTransaction');
    try {
      const password = await this.passwordModal.open();
      await _closeTransaction(item.id, username, password);
      this.context.showPopup('transaction closed');
    } catch (e) {
      console.log(e);
      if (e.response) {
        if (e.response.status === 401) {
          this.context.showPopup('You was logged out');
          this.context.logout();
          return;
        }
      }
      if (e && e.response && e.response.data) {
        const { message } = e.response.data;
        this.context.showPopup(message);
        return;
      }
      this.context.showPopup(JSON.stringify(e));
    } finally {
      this.stopLoader('closeTransaction');
    }
  };

  renderItemDetail = () => {
    const { classes, type } = this.props;
    const { item, verifier, reward } = this.state;
    const { address } = this.context.state;
    if (!item) {
      return <div />;
    }
    if (type === 'history') {
      if ('to verify') {
        return (
          <Modal open={!!item} onClose={() => this.setState({ item: null })}>
            <div
              style={{
                top: `50%`,
                left: `50%`,
                transform: `translate(-50%, -50%)`,
              }}
              className={classes.paper}
            >
              {/* ITEM NAME */}
              <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
                {item.name}
              </Typography>

              {/* FIXME: BUYER NAME */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Buyer:</span> {item.owner.name}
              </Typography>

              {/* FIXME: SELLER NAME */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
              </Typography>

              {/* ITEM SIZE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>File size:</span> {this.formatFileSize(item.size)}
              </Typography>

              {/* ITEM PRICE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Price:</span> {item.created_at}
              </Typography>

              {/* VERIFIER REWARD */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier reward:</span> {item.created_at}
              </Typography>

              {/* FILE UPLOADED DATE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
              </Typography>

              {/* PURCHASE DATE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Purchase date:</span> {item.created_at}
              </Typography>

              {/* ACTION BUTTONS */}
              <div>
                <Button>DOWNLOAD THE FILE</Button>
                <Button>COPY IPFS HASH</Button>
                <Button onClick={() => this.verify(item)}>VERIFY</Button>
              </div>
            </div>
          </Modal>
        );
      if ('to close transaction') {
        return (
          <Modal open={!!item} onClose={() => this.setState({ item: null })}>
            <div
              style={{
                top: `50%`,
                left: `50%`,
                transform: `translate(-50%, -50%)`,
              }}
              className={classes.paper}
            >
              {/* ITEM NAME */}
              <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
                {item.name}
              </Typography>
              {/* FIXME: BUYER NAME */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Buyer:</span> {item.owner.name}
              </Typography>
              {/* ITEM PRICE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Item price:</span> {item.created_at}
              </Typography>
              {/* FIXME: VERIFIER NAME */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier:</span> {item.owner.name}
              </Typography>
              {/* VERIFIER REWARD */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier reward:</span> {item.created_at}
              </Typography>
              {/* ITEM SIZE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Item size:</span> {item.created_at}
              </Typography>
              {/* PURCHASE DATE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Purchase date:</span> {item.created_at}
              </Typography>
              {/* FILE UPLOADED DATE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
              </Typography>
              {/* ACTION BUTTON */}
              <div>
                <Button onClick={() => this.closeTransaction(item)}>AUTHORIZE THE TRANSACTION</Button>
              </div>
            </div>
          </Modal>
        );
      if ('buyer checks his file') {
        return (
          <Modal open={!!item} onClose={() => this.setState({ item: null })}>
            <div
              style={{
                top: `50%`,
                left: `50%`,
                transform: `translate(-50%, -50%)`,
              }}
              className={classes.paper}
            >
              {/* ITEM NAME */}
              <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
                {item.name}
              </Typography>
              {/* FIXME: SELLER NAME */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
              </Typography>
              {/* ITEM PRICE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Item price:</span> {item.created_at}
              </Typography>
              {/* FIXME: VERIFIER NAME */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier:</span> {item.owner.name}
              </Typography>
              {/* VERIFIER REWARD */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Verifier reward:</span> {item.created_at}
              </Typography>
              {/* ITEM SIZE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Item size:</span> {item.created_at}
              </Typography>
              {/* PURCHASE DATE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Purchase date:</span> {item.created_at}
              </Typography>
              {/* FILE UPLOADED DATE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
              </Typography>
              {/* TOTAL PRICE */}
              <Typography variant="subheading" id="simple-modal-description">
                <span style={{ fontWeight: '600' }}>Total price:</span> {item.created_at}
              </Typography>
              {/* 
                FIXME: create a status stepper.
                The idea is to have 3 steps.
                1. Purchase
                2. Verify
                3. Authorize
              */}

              {/* ACTION BUTTONS */}
              <div>
                <Button>DOWNLOAD THE FILE</Button>
                <Button>COPY IPFS HASH</Button>
              </div>
            </div>
          </Modal>
        );
      }
    }
    return (
      <Modal open={!!item} onClose={() => this.setState({ item: null, verifier: '', reward: '' })}>
        <div
          style={{
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
          }}
          className={classes.paper}
        >
          <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
            {item.name}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Price:</span> {item.price}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            {console.log(item.size)}
            <span style={{ fontWeight: '600' }}>File size:</span> {this.formatFileSize(item.size)}
          </Typography>
          <Typography variant="subheading" id="simple-modal-description">
            <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
          </Typography>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!verifier) return;
              this.buyItem(item);
            }}
            style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="controlled-open-select">Verifier</InputLabel>
              <Select
                value={verifier}
                classes={{ select: classes.select }}
                onChange={e => this.setState({ verifier: e.target.value })}
                inputProps={{
                  name: 'verifier',
                  id: 'controlled-open-select',
                }}
              >
                <MenuItem value="none">
                  <em>None</em>
                </MenuItem>
                {console.log(address)}
                {this.context.state.verifiers
                  .filter(ver => ver.account !== item.owner.account && ver.account !== address)
                  .map(ver => (
                    <MenuItem key={ver.id} value={ver.account}>
                      {ver.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {!verifier ? null : verifier === 'none' ? (
              <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
                Buy
              </Button>
            ) : (
              <Fragment>
                <TextField
                  label="Verifier's reward"
                  id="simple-start-adornment"
                  type="number"
                  value={reward}
                  onChange={e => this.setState({ reward: e.target.value })}
                  className={classNames(classes.margin, classes.textField)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">%</InputAdornment>,
                  }}
                />
                <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
                  Buy
                </Button>
              </Fragment>
            )}
          </form>
        </div>
      </Modal>
    );
  };

  render() {
    const { classes, items, type } = this.props;

    console.log(items);
    if (type === 'history') {
      return (
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <CustomTableCell>File name</CustomTableCell>
                <CustomTableCell numeric>Price</CustomTableCell>
                <CustomTableCell numeric>File size</CustomTableCell>
                <CustomTableCell numeric>Seller</CustomTableCell>
                <CustomTableCell numeric>Date purchased</CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>Status</div>
                </CustomTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow
                  hover
                  className={classes.row}
                  key={item.id}
                  onClick={() =>
                    this.setState({
                      [`isOpen_${item.id}`]:
                        this.state[`isOpen_${item.id}`] === null ? true : !this.state[`isOpen_${item.id}`],
                    })
                  }
                >
                  <CustomTableCell component="th" scope="row" className={classes.roo}>
                    <div>{item.listing.name}</div>
                  </CustomTableCell>
                  <CustomTableCell numeric>{item.listing.price}</CustomTableCell>
                  <CustomTableCell numeric>{this.formatFileSize(item.listing.size)}</CustomTableCell>
                  <CustomTableCell numeric>{item.listing.owner.name}</CustomTableCell>
                  <CustomTableCell numeric>{moment(item.listing.created_at).format('l')}</CustomTableCell>
                  <CustomTableCell numeric>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ padding: '10px 0' }}>{this.renderStatus(item)}</div>
                      <Collapse in={this.state[`isOpen_${item.id}`]} transitionDuration="auto" unmountOnExit>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Button>Download</Button>
                          <Button>Copy hash</Button>
                        </div>
                      </Collapse>
                    </div>
                  </CustomTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      );
    }
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>File name</CustomTableCell>
              <CustomTableCell numeric>Price</CustomTableCell>
              <CustomTableCell numeric>File size</CustomTableCell>
              <CustomTableCell numeric>Seller</CustomTableCell>
              <CustomTableCell numeric>Date uploaded</CustomTableCell>
              <CustomTableCell numeric>
                <div style={{ textAlign: 'center' }}>Action</div>
              </CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow hover className={classes.row} key={item.id}>
                <CustomTableCell component="th" scope="row">
                  {this.formatName(item.name)}
                </CustomTableCell>
                <CustomTableCell numeric>{item.price}</CustomTableCell>
                <CustomTableCell numeric>{this.formatFileSize(item.size)}</CustomTableCell>
                <CustomTableCell numeric>{item.owner.name}</CustomTableCell>
                <CustomTableCell numeric>{moment(item.created_at).format('l')}</CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>
                    <Button onClick={() => this.setState({ item })}>BUY</Button>
                  </div>
                </CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

export default withStyles(styles)(CustomizedTable);

// import React, { Component, Fragment } from 'react';
// import { withStyles } from 'material-ui/styles';

// import { createWriteStream } from 'streamsaver';

// import { CopyToClipboard } from 'react-copy-to-clipboard';

// import classNames from 'classnames';

// import Button from 'material-ui/Button';

// import Modal from 'material-ui/Modal';

// import Typography from 'material-ui/Typography';

// import { InputLabel, InputAdornment } from 'material-ui/Input';
// import TextField from 'material-ui/TextField';

// import { MenuItem } from 'material-ui/Menu';
// import { FormControl } from 'material-ui/Form';
// import Select from 'material-ui/Select';

// import Card, { CardActions, CardContent } from 'material-ui/Card';
// import InfoPopup from '../../InfoPopup';

// import { _buyItem, _closeTransaction, _verifyItem } from '../../../Components/requests';

// import PasswordModal from '../../PasswordModal';

// import './ItemList.css';
// import { MainContext } from '../../../Context';

// import { HOST } from '../../../Components/Remote';

// const styles = theme => ({
//   card: {
//     minWidth: 275,
//   },
//   bullet: {
//     display: 'inline-block',
//     margin: '0 2px',
//     transform: 'scale(0.8)',
//   },
//   title: {
//     marginBottom: 16,
//     fontSize: 14,
//   },
//   pos: {
//     marginBottom: 12,
//   },
//   paper: {
//     position: 'absolute',
//     width: theme.spacing.unit * 50,
//     backgroundColor: theme.palette.background.paper,
//     boxShadow: theme.shadows[5],
//     padding: theme.spacing.unit * 4,
//   },
//   select: {
//     maxHeight: '200px',
//     minWidth: '50px',
//   },
// });

// class ItemList extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       item: null,
//       verifier: '',
//       reward: '',
//     };
//   }

//   renderItem = item => {
//     const { classes } = this.props;
//     const selectedItem = item.listing || item;

//     return (
//       <div className="card-container" key={Math.random()} style={{ width: '300px' }}>
//         <Card className={classes.card}>
//           <CardContent>
//             <Typography
//               variant="headline"
//               component="h2"
//               style={{
//                 fontSize: '18px',
//                 fontWeight: '500',
//                 width: 250,
//                 height: '26px',
//                 textOverflow: 'ellipsis',
//                 overflow: 'hidden',
//                 whiteSpace: 'no-wrap',
//               }}
//             >
//               {selectedItem.name || 'Name'}
//             </Typography>
//             <Typography className={classes.pos} color="textSecondary">
//               {(selectedItem.owner && selectedItem.owner.name) || 'seller'}
//             </Typography>
//             <Typography component="p">{`${selectedItem.price} tokens`}</Typography>
//           </CardContent>
//           <CardActions>{this.renderButton(item)}</CardActions>
//         </Card>
//       </div>
//     );
//   };

//   renderButton = item => {
//     const { currentPage } = this.context.state;

//     if (this.props.type === 'sell') {
//       return (
//         <Button size="small" disabled>
//           Uploaded
//         </Button>
//       );
//     }
//     if (item.needs_closure) {
//       if (this.props.type !== 'sold' && this.props.type !== 'bought' && item.needs_verification) {
//         return (
//           <div>
//             <Button
//               color="primary"
//               size="small"
//               onClick={() => {
//                 this.verify(item);
//               }}
//             >
//               Verify
//             </Button>
//             <CopyToClipboard
//               text={item.listing ? item.listing.cid : item.cid}
//               onCopy={() => {
//                 this.context.showPopup('Copied to clipboard');
//                 // setTimeout(() => this.setState({ status: '' }), 3000);
//               }}
//             >
//               <Button>Copy ipfs hash</Button>
//             </CopyToClipboard>
//             <Button
//               size="small"
//               // color="primary"
//               style={{ fontSize: '0.875rem' }}
//               onClick={() => {
//                 if (item.listing) {
//                   this.downloadFile(`${HOST}/seller/download?CID=${item.listing.cid}`, item.listing.name);
//                   return;
//                 }
//                 this.downloadFile(`${HOST}/seller/download?CID=${item.cid}`, item.name);
//               }}
//             >
//               Download
//             </Button>
//           </div>
//         );
//       }
//       if (this.props.type === 'sold') {
//         if (item.needs_verification) {
//           return (
//             <Button
//               size="small"
//               disabled
//               onClick={() => {
//                 this.closeTransaction(item);
//               }}
//             >
//               Waiting for verification
//             </Button>
//           );
//         }
//         return (
//           <Button
//             size="small"
//             onClick={() => {
//               this.closeTransaction(item);
//             }}
//           >
//             Close transaction
//           </Button>
//         );
//       }
//       return (
//         <Button disabled size="small" onClick={() => this.setState({ item })}>
//           Waiting for confirmation
//         </Button>
//       );
//     }

//     if (currentPage === 'explore') {
//       return (
//         <Button
//           size="small"
//           onClick={() => {
//             this.setState({ item });
//           }}
//         >
//           See more
//         </Button>
//       );
//     }
//     return (
//       <div>
//         <Button
//           size="small"
//           color="primary"
//           style={{ fontSize: '0.875rem' }}
//           onClick={() => {
//             if (item.listing) {
//               this.downloadFile(`${HOST}/seller/download?CID=${item.listing.cid}`, item.listing.name);
//               return;
//             }
//             this.downloadFile(`${HOST}/seller/download?CID=${item.cid}`, item.name);
//           }}
//         >
//           Download
//         </Button>
//         <CopyToClipboard
//           text={item.listing ? item.listing.cid : item.cid}
//           onCopy={() => {
//             this.context.showPopup('Copied to clipboard');
//             // setTimeout(() => this.setState({ status: '' }), 3000);
//           }}
//         >
//           <Button>Copy ipfs hash</Button>
//         </CopyToClipboard>
//       </div>
//     );
//   };

//   async verify(item) {
//     const { username } = this.context.state;
//     if (this.context.state.balance.tokens === 0) {
//       this.context.showPopup('please get some tokens');
//       return;
//     }
//     // const { item } = this.state;
//     try {
//       const password = await this.passwordModal.open();
//       await _verifyItem(item, username, password);
//       this.context.showPopup('verified successfully');
//       this.context.updateState({ currentPage: 'verified' });
//       // this.context.getItems();
//       // this.context.updateBalance();
//       this.setState({ item: null });
//       this.props.history.push('/verified');
//     } catch (e) {
//       console.log(e);
//       if (e.response) {
//         if (e.response.status === 401) {
//           console.log('aaaaaaahhhhhh 40000001111');
//           this.context.showPopup('You was logged out');
//           this.context.logout();
//           return;
//         }
//       }
//       this.context.showPopup(JSON.stringify(e));
//     }
//   }

//   async downloadFile(url, name) {
//     try {
//       const response = await fetch(url, {
//         headers: new Headers({
//           Authorization: localStorage.getItem('id_token'),
//         }),
//       });
//       const fileStream = createWriteStream(name);
//       const writer = fileStream.getWriter();
//       const reader = response.body.getReader();
//       const pump = () =>
//         reader.read().then(({ value, done }) => (done ? writer.close() : writer.write(value).then(pump)));
//       await pump();
//     } catch (e) {
//       console.log(e);
//       this.context.showPopup(JSON.stringify(e));
//     }
//   }

//   async buyItem(item) {
//     const { username, address } = this.context.state;
//     const { verifier, reward } = this.state;
//     // const { item } = this.state;
//     try {
//       await this.checkForErrors(item);
//       const password = await this.passwordModal.open();
//       await _buyItem(item, username, password, address, verifier, reward);
//       this.context.showPopup('purchased successfully');
//       this.context.updateState({ currentPage: 'in progress' });
//       // this.context.getItems();
//       // this.context.updateBalance();
//       this.setState({ item: null });
//       this.props.history.push('/inprogress');
//     } catch (e) {
//       console.log(e);
//       if (e.response) {
//         if (e.response.status === 401) {
//           this.context.showPopup('You was logged out');
//           this.context.logout();
//           return;
//         }
//       }
//       if (e && e.message) {
//         this.context.showPopup(e.message);
//         return;
//       }
//       this.context.showPopup(JSON.stringify(e));
//     }
//   }

//   checkForErrors = item =>
//     new Promise((resolve, reject) => {
//       const { verifier, reward } = this.state;
//       if (verifier && verifier !== 'none') {
//         // check if reward correct
//         if (reward < 1 || reward > 99) {
//           reject('reward should be more than 1% and less than 99%');
//         }
//       }
//       if (this.context.state.balance.tokens < item.price) {
//         reject("you don't have enough tokens");
//       }
//       resolve();
//     });

//   async closeTransaction(item) {
//     const { username } = this.context.state;
//     if (this.context.state.balance.tokens === 0) {
//       this.context.showPopup('please get some tokens');
//       return;
//     }
//     try {
//       const password = await this.passwordModal.open();
//       await _closeTransaction(item.id, username, password);
//       this.context.showPopup('transaction closed');
//       this.context.updateState({ currentPage: 'sold' });
//       this.props.history.push('/sold');
//       // this.context.getItems();
//       // this.context.updateBalance();
//     } catch (e) {
//       console.log(e);
//       if (e.response) {
//         if (e.response.status === 401) {
//           console.log('aaaaaaahhhhhh 40000001111');
//           this.context.showPopup('You was logged out');
//           this.context.logout();
//           return;
//         }
//       }
//       if (e && e.response && e.response.data) {
//         const { message } = e.response.data;
//         this.context.showPopup(message);
//         return;
//       }
//       this.context.showPopup(JSON.stringify(e));
//     }
//   }

//   formatFileSize(bytes, decimalPoint) {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1000;
//     const dm = decimalPoint || 2;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
//   }

//   renderModal = () => {
//     const { classes } = this.props;
//     const { item, verifier, reward } = this.state;
//     const { address } = this.context.state;
//     if (!item) {
//       return <div />;
//     }
//     return (
//       <Modal
//         aria-labelledby="simple-modal-title"
//         aria-describedby="simple-modal-description"
//         open={!!item}
//         onClose={() => this.setState({ item: null, verifier: '', reward: '' })}
//       >
//         <div
//           style={{
//             top: `50%`,
//             left: `50%`,
//             transform: `translate(-50%, -50%)`,
//           }}
//           className={classes.paper}
//         >
//           <Typography variant="title" id="modal-title" style={{ paddingBottom: '20px' }}>
//             {item.name}
//           </Typography>
//           <Typography variant="subheading" id="simple-modal-description">
//             <span style={{ fontWeight: '600' }}>Seller:</span> {item.owner.name}
//           </Typography>
//           <Typography variant="subheading" id="simple-modal-description">
//             <span style={{ fontWeight: '600' }}>Price:</span> {item.price}
//           </Typography>
//           <Typography variant="subheading" id="simple-modal-description">
//             {console.log(item.size)}
//             <span style={{ fontWeight: '600' }}>Size:</span> {this.formatFileSize(item.size)}
//           </Typography>
//           <Typography variant="subheading" id="simple-modal-description">
//             <span style={{ fontWeight: '600' }}>Date uploaded:</span> {item.created_at}
//           </Typography>
//           <form
//             onSubmit={e => {
//               e.preventDefault();
//               if (!verifier) return;
//               this.buyItem(item);
//             }}
//             style={{
//               marginTop: '10px',
//               display: 'flex',
//               flexDirection: 'row',
//               alignItems: 'flex-end',
//               justifyContent: 'space-between',
//             }}
//           >
//             <FormControl className={classes.formControl}>
//               <InputLabel htmlFor="controlled-open-select">Verifier</InputLabel>
//               <Select
//                 value={verifier}
//                 classes={{ select: classes.select }}
//                 onChange={e => this.setState({ verifier: e.target.value })}
//                 inputProps={{
//                   name: 'verifier',
//                   id: 'controlled-open-select',
//                 }}
//               >
//                 <MenuItem value="none">
//                   <em>None</em>
//                 </MenuItem>
//                 {console.log(address)}
//                 {this.context.state.verifiers
//                   .filter(ver => ver.account !== item.owner.account && ver.account !== address)
//                   // .filter(ver => ver.account !== address)
//                   .map(ver => (
//                     <MenuItem key={ver.id} value={ver.account}>
//                       {ver.name}
//                     </MenuItem>
//                   ))}
//               </Select>
//             </FormControl>
//             {!verifier ? null : verifier === 'none' ? (
//               <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
//                 Buy
//               </Button>
//             ) : (
//               <Fragment>
//                 <TextField
//                   label="Verifier's reward"
//                   id="simple-start-adornment"
//                   type="number"
//                   value={reward}
//                   onChange={e => this.setState({ reward: e.target.value })}
//                   className={classNames(classes.margin, classes.textField)}
//                   InputProps={{
//                     startAdornment: <InputAdornment position="start">%</InputAdornment>,
//                   }}
//                 />
//                 <Button color="primary" className={classes.button} onClick={() => this.buyItem(item)}>
//                   Buy
//                 </Button>
//               </Fragment>
//             )}
//           </form>
//         </div>
//       </Modal>
//     );
//   };

//   render() {
//     const { items } = this.props;
//     return (
//       <MainContext.Consumer>
//         {context => {
//           this.context = context;
//           return (
//             <div className="item-list-container">
//               <InfoPopup message={this.state.status} handleClose={() => this.setState({ status: '' })} />
//               {items.map(item => this.renderItem(item))}
//               {this.renderModal()}
//               <PasswordModal
//                 onRef={ref => {
//                   this.passwordModal = ref;
//                 }}
//               />
//             </div>
//           );
//         }}
//       </MainContext.Consumer>
//     );
//   }
// }

// export default withStyles(styles)(ItemList);
