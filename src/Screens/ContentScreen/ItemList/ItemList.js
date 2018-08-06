import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { Paper, Button } from 'material-ui';

import { HourglassEmpty, HourglassFull, CheckCircle } from 'material-ui-icons';

import moment from 'moment';

import { MainContext } from '../../../Context';
import ItemModal from '../ItemModal/ItemModal';

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
});

class ItemList extends Component {
  state = {
    isOpen: false,
  };

  componentDidMount() {}

  formatName = name => (name.length > 22 ? `${name.substring(0, 19)}...` : name);

  formatFileSize = (bytes, decimalPoint) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1000;
    const dm = decimalPoint || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  renderStatus = item => {
    if (item.needs_verification) return <HourglassEmpty color="primary" />;
    if (item.needs_closure) return <HourglassFull color="primary" />;
    return <CheckCircle color="primary" />;
  };

  allItemsTable = () => {
    const { classes, items } = this.props;
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
                  {item.name}
                </CustomTableCell>
                <CustomTableCell numeric>{item.price}</CustomTableCell>
                <CustomTableCell numeric>{this.formatFileSize(item.size)}</CustomTableCell>
                <CustomTableCell numeric>{item.owner.name}</CustomTableCell>
                <CustomTableCell numeric>{moment(item.created_at).format('l')}</CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>
                    <Button onClick={() => this.context.updateState({ item, action: 'purchase' })}>Buy</Button>
                  </div>
                </CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  myFilesTable = () => {
    const { classes, items } = this.props;
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>File name</CustomTableCell>
              <CustomTableCell numeric>Price</CustomTableCell>
              <CustomTableCell numeric>File size</CustomTableCell>
              <CustomTableCell numeric>Date uploaded</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow hover className={classes.row} key={item.id}>
                <CustomTableCell component="th" scope="row">
                  {item.name}
                </CustomTableCell>
                <CustomTableCell numeric>{item.price}</CustomTableCell>
                <CustomTableCell numeric>{this.formatFileSize(item.size)}</CustomTableCell>
                <CustomTableCell numeric>{moment(item.created_at).format('l')}</CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  purchasedTable = () => {
    const { classes, items } = this.props;
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>File name</CustomTableCell>
              <CustomTableCell numeric>Price</CustomTableCell>
              <CustomTableCell numeric>Seller</CustomTableCell>
              <CustomTableCell numeric>Date purchased</CustomTableCell>
              <CustomTableCell numeric>
                <div style={{ textAlign: 'center' }}>Action</div>
              </CustomTableCell>
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
                <CustomTableCell numeric>{item.listing.owner.name}</CustomTableCell>
                <CustomTableCell numeric>{moment(item.listing.created_at).format('l')}</CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>
                    <Button onClick={() => this.context.updateState({ item })}>Details</Button>
                  </div>
                </CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>{this.renderStatus(item)}</div>
                </CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  soldTable = () => {
    const { classes, items } = this.props;
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>File name</CustomTableCell>
              <CustomTableCell numeric>Price</CustomTableCell>
              <CustomTableCell numeric>Buyer</CustomTableCell>
              <CustomTableCell numeric>Date purchased</CustomTableCell>
              <CustomTableCell numeric>
                <div style={{ textAlign: 'center' }}>Action</div>
              </CustomTableCell>
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
                <CustomTableCell numeric>{item.buyer.name}</CustomTableCell>
                <CustomTableCell numeric>{moment(item.listing.created_at).format('l')}</CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>
                    <Button onClick={() => this.context.updateState({ item })}>Details</Button>
                  </div>
                </CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>{this.renderStatus(item)}</div>
                </CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  verifiedTable = () => {
    const { classes, items } = this.props;
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell>File name</CustomTableCell>
              <CustomTableCell numeric>Price</CustomTableCell>
              <CustomTableCell numeric>Seller</CustomTableCell>
              <CustomTableCell numeric>Date purchased</CustomTableCell>
              <CustomTableCell numeric>
                <div style={{ textAlign: 'center' }}>Action</div>
              </CustomTableCell>
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
                <CustomTableCell numeric>{item.listing.owner.name}</CustomTableCell>
                <CustomTableCell numeric>{moment(item.listing.created_at).format('l')}</CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>
                    <Button onClick={() => this.context.updateState({ item })}>Details</Button>
                  </div>
                </CustomTableCell>
                <CustomTableCell numeric>
                  <div style={{ textAlign: 'center' }}>{this.renderStatus(item)}</div>
                </CustomTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  renderTable = page => {
    switch (page) {
      case 'purchased':
        return this.purchasedTable();
      case 'sold':
        return this.soldTable();
      case 'verified':
        return this.soldTable();
      case 'my files':
        return this.myFilesTable();
      default:
        return this.allItemsTable();
    }
  };

  render() {
    const { item, action } = this.state;
    return (
      <MainContext.Consumer>
        {context => {
          this.context = context;
          return (
            <div>
              {this.renderTable(this.context.state.currentPage)}
              <ItemModal item={item} action={action} context={this.context} />
            </div>
          );
        }}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(ItemList);
