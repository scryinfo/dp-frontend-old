import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import axios from 'axios';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { Paper, Button, Modal } from 'material-ui';

import { CircularProgress } from 'material-ui/Progress';

import moment from 'moment';

import { Publisher } from '../Components/Remote';

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
    minHeight: 100,
    height: '100%',
    overflowX: 'auto',
  },
  roo: {
    width: '5%',
  },
  table: {
    minWidth: 700,
  },
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 70,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
  select: {
    maxHeight: '200px',
    minWidth: '50px',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

class RelatedListingsModal extends Component {
  state = {
    isOpen: false,
    listings: [],
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  open = id =>
    new Promise((resolve, reject) => {
      this.setState({ isOpen: true });
      this.resolve = resolve;
      this.reject = reject;
      this.getListingsByCategoryId(id);
    });

  close = () => {
    this.setState({ isOpen: false });
    this.reject('password not entered');
  };

  wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  getListingsByCategoryId = async id => {
    try {
      this.setState({ status: 'loading' });
      const { data } = await axios.get(`${Publisher}/listing_by_categories?category_id=${id}`, {
        headers: {
          Authorization: `JWT ${localStorage.getItem('id_token')}`,
        },
      });
      await this.wait(1000);
      this.setState({ listings: data, status: data.length < 1 ? 'No related listing found' : 'loaded' });
    } catch (e) {
      console.log(e);
      this.setState({ status: 'Failed to load' });
    }
  };

  formatFileSize = (bytes, decimalPoint) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const dm = decimalPoint || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  render() {
    const { isOpen, listings, status } = this.state;
    const { classes } = this.props;
    return (
      <Modal open={isOpen} onClose={this.close}>
        <div
          style={{
            position: 'absolute',
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%)`,
            minWidth: 750,
            minHeight: 100,
            maxHeight: '80%',
            overflow: 'scroll',
          }}
        >
          <Paper className={classes.root}>
            {status !== 'loaded' ? (
              <div
                style={{
                  height: '100%',
                  minHeight: 100,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {status === 'loading' ? (
                  <div
                    style={{
                      height: 100,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress />
                  </div>
                ) : (
                  <div>{status}</div>
                )}
              </div>
            ) : (
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
                  {listings.map(item => (
                    <TableRow hover className={classes.row} key={item.id}>
                      <CustomTableCell component="th" scope="row">
                        {item.name}
                      </CustomTableCell>
                      <CustomTableCell numeric>{item.price}</CustomTableCell>
                      <CustomTableCell numeric>{this.formatFileSize(item.size)}</CustomTableCell>
                      <CustomTableCell numeric>{item.owner.name}</CustomTableCell>
                      <CustomTableCell numeric>{moment(item.created_at).format('l')}</CustomTableCell>
                      <CustomTableCell numeric>
                        <div style={{ textAlign: 'center' }}>
                          <Button onClick={() => this.props.context.updateState({ item, action: 'purchase' })}>
                            Buy
                          </Button>
                        </div>
                      </CustomTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </div>
      </Modal>
    );
  }
}

export default withStyles(styles)(RelatedListingsModal);
