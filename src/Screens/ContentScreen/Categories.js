/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { Paper, Button, Collapse, Typography, Modal, TextField, Select } from 'material-ui';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: '#192631',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

export class Categories extends Component {
  state = {
    tables: [],
  };

  componentDidMount() {
    // this.getCategories();
  }

  // getCategories = async () => {
  //   try {
  //     const { data } = await axios({
  //       url: `https://139.219.107.164:443/meta/getcategories`,
  //       method: 'post',
  //       headers: {
  //         Authorization: `JWT ${localStorage.getItem('id_token')}`,
  //       },
  //     });
  //     this.setState({ tables: data });
  //     console.log({ data });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  renderTable = (table, index) => {
    const { classes } = this.props;

    return (
      <Paper key={index} className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {table.DataStructure.map((column, index) => {
                console.log(column);
                return <CustomTableCell key={index}>{Object.keys(column)[0]}</CustomTableCell>;
              })}
            </TableRow>
          </TableHead>
        </Table>
      </Paper>
    );
  };

  render() {
    const { classes } = this.props;
    console.log(this.props.context);
    const { tables } = this.props.context.state;
    return <div style={{ marginTop: 30 }}>{tables.map((table, index) => this.renderTable(table, index))}</div>;
  }
}

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 1000,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

export default withStyles(styles)(Categories);
