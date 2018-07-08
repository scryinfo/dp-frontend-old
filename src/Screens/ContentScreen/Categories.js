/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { Paper, Button, Collapse, Typography, Modal, TextField, Select } from 'material-ui';

import JSONModal from '../JSONModal';
import RelatedListingsModal from '../RelatedListingsModal';
import ItemModal from './ItemModal/ItemModal';

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

  openJSONModal = async category => {
    await this.jsonModal.open(category);
  };

  openRelatedListingsModal = async id => {
    console.log(this.relatedListingsModal);
    await this.relatedListingsModal.open(id);
  };

  renderTable = categories => {
    const { classes } = this.props;
    console.log({ categories });

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <CustomTableCell component="th" scope="row">
                #
              </CustomTableCell>
              <CustomTableCell numeric>Category</CustomTableCell>
              <CustomTableCell numeric>Subcategory</CustomTableCell>
              <CustomTableCell numeric>Subsubcategory</CustomTableCell>
              {/* <CustomTableCell numeric>{item.price}</CustomTableCell>
                  <CustomTableCell numeric>{this.formatFileSize(item.size)}</CustomTableCell> */}

              <CustomTableCell numeric>
                <div style={{ textAlign: 'center' }}>
                  Metadata and Listing
                  {/* <Button>View JSON</Button> */}
                </div>
              </CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category, index) => {
              const { DataStructure, CategoryName } = category.metadata;
              return (
                <TableRow hover className={classes.row} key={index}>
                  <CustomTableCell component="th" scope="row">
                    {index + 1}
                  </CustomTableCell>
                  {CategoryName.map((categoryName, i) => (
                    <CustomTableCell key={i} numeric>
                      {categoryName}
                    </CustomTableCell>
                  ))}
                  {/* <CustomTableCell numeric>{item.price}</CustomTableCell>
                  <CustomTableCell numeric>{this.formatFileSize(item.size)}</CustomTableCell> */}

                  <CustomTableCell numeric>
                    <div style={{ textAlign: 'center' }}>
                      <Button onClick={() => this.openJSONModal(category.metadata, null, 2)}>View JSON</Button>
                      <Button onClick={() => this.openRelatedListingsModal(category.id)}>See listings</Button>
                    </div>
                  </CustomTableCell>
                  {/* <CustomTableCell numeric>
                    <div style={{ textAlign: 'center' }}>
                      <Button onClick={() => this.openJSONModal(category.metadata, null, 2)}>View List</Button>
                    </div>
                  </CustomTableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  render() {
    const { classes } = this.props;

    console.log(this.props.context);
    const { tables } = this.props.context.state;
    console.log({ tables });
    return (
      <div style={{ marginTop: 30 }}>
        {this.renderTable(tables)}
        <JSONModal
          onRef={ref => {
            console.log({ ref });
            this.jsonModal = ref;
          }}
          context={this.props.context}
        />
        <RelatedListingsModal
          onRef={ref => {
            this.relatedListingsModal = ref;
          }}
          context={this.props.context}
        />
        <ItemModal context={this.props.context} />
      </div>
    );
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
