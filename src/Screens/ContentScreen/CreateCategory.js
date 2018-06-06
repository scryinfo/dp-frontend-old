/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import {
  MenuItem,
  TextField,
  Paper,
  FormControlLabel,
  InputLabel,
  Select,
  FormControl,
  Switch,
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
} from '@material-ui/core';

import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { Delete } from '@material-ui/icons';

import Dragger from './dragger.svg';

const host = 'https://139.219.107.164:443';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: '#192631',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

export class CreateCategory extends Component {
  state = {
    tab: 0,
    columns: [
      {
        name: '',
        DataType: '',
        IsUnique: false,
        IsNull: false,
        IsPrimaryKey: false,
      },
    ],
  };

  addColumn = () => {
    const columns = [...this.state.columns];
    const newColumn = {
      name: '',
      DataType: '',
      IsUnique: false,
      IsNull: false,
      IsPrimaryKey: false,
    };
    columns.push(newColumn);
    this.setState({ columns });
  };

  handleTabChange = (event, value) => {
    this.setState({ tab: value });
  };

  handleChange = ({ column, index, isSwitch }) => event => {
    console.log(event.target.checked);
    const clonedColumns = [...this.state.columns];
    const clonedColumn = { ...column };
    clonedColumn[event.target.name] = isSwitch ? event.target.checked : event.target.value;
    clonedColumns[index] = clonedColumn;

    this.setState({ columns: clonedColumns });
  };

  deleteColumn = index => {
    const clonedColumns = [...this.state.columns];
    clonedColumns.splice(index, 1);
    this.setState({ columns: clonedColumns });
  };

  onSubmit = async () => {
    try {
      const wrapped = this.generateJson();
      const res = await axios.post(`${host}/meta/categories`, wrapped, {
        headers: {
          Authorization: `JWT ${localStorage.getItem('id_token')}`,
        },
      });
      this.props.context.showPopup('Succesfully created category. Check categories section');
      this.setState({
        columns: [
          {
            name: '',
            DataType: '',
            IsUnique: false,
            IsNull: false,
            IsPrimaryKey: false,
          },
        ],
      });
      this.props.context.getItems();
      console.log(res);
    } catch (e) {
      this.props.context.showPopup('Oops, something went wrong');
      console.log(e);
    }
  };

  generateJson = () => {
    const { columns } = this.state;
    const cleanedColumns = columns.map(column => this.reformat(this.boolToString(this.removeFalse(column))));
    const wrapped = {
      CategoryName: ['Aviation', 'Commercia Flights', `Airport Info ${Math.random()}`],
      DataStructure: cleanedColumns,
    };
    console.log(JSON.stringify(wrapped, null, 4));
    return wrapped;
    // this.setState({ json: JSON.stringify(wrapped, null, 4) }, () => console.log(this.state.json));
    // console.log(this.state.json);
  };

  // boolToString = ()

  reformat = column => {
    const { name, ...rest } = column;
    const newColumn = {
      [name]: rest,
    };
    return newColumn;
  };

  removeFalse = obj => {
    const clonedObj = { ...obj };
    for (const k in clonedObj) {
      if (clonedObj.hasOwnProperty(k) && clonedObj[k] === false) {
        delete clonedObj[k];
      }
    }
    return clonedObj;
  };

  boolToString = obj => {
    const clonedObj = { ...obj };
    for (const k in clonedObj) {
      if (clonedObj.hasOwnProperty(k) && typeof clonedObj[k] === 'boolean') {
        clonedObj[k] = clonedObj[k].toString();
      }
    }
    return clonedObj;
  };

  DragHandle = SortableHandle(() => (
    <IconButton>
      <img src={Dragger} alt="" />
    </IconButton>
  ));

  SortableItem = SortableElement(({ column, i }) =>
    this.renderColumn({ column, index: i, classes: this.props.classes })
  );

  SortableList = SortableContainer(({ items }) => (
    <div className={this.props.classes.sortableContainer}>
      {items.map((column, index) => (
        <this.SortableItem key={`item-${index}`} index={index} column={column} i={index} />
      ))}
    </div>
  ));

  onSortStart = ({ index }) => {
    // this.setState({ onSort: index });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      columns: arrayMove(this.state.columns, oldIndex, newIndex),
    });
  };

  renderTable = table => {
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {table.map((column, index) => <CustomTableCell key={index}>{column.name}</CustomTableCell>)}
            </TableRow>
          </TableHead>
        </Table>
      </Paper>
    );
  };

  renderColumn = ({ column, index, classes }) => (
    <Paper elevation={1}>
      <div className={classes.columnContainer} key={index}>
        <div className={classes.paddLeft}>
          <this.DragHandle />
          <TextField
            id="name"
            name="name"
            label="Name"
            className={classes.textField}
            value={column.name}
            onChange={this.handleChange({ column, index })}
            margin="normal"
          />
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="datatype">Datatype</InputLabel>
            <Select
              value={column.DataType}
              onChange={this.handleChange({ column, index })}
              inputProps={{
                name: 'DataType',
                id: 'datatype',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="String">String</MenuItem>
              <MenuItem value="Int">Int</MenuItem>
              <MenuItem value="Float">Float</MenuItem>
              <MenuItem value="Date">Date</MenuItem>
              <MenuItem value="Datetime">Datetime</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            className={classes.switch}
            control={
              <Switch
                checked={column.IsNull}
                onChange={this.handleChange({ column, index, isSwitch: true })}
                value="IsNull"
                name="IsNull"
                color="primary"
              />
            }
            label="Is Null"
          />
          <FormControlLabel
            className={classes.switch}
            control={
              <Switch
                checked={column.IsUnique}
                onChange={this.handleChange({ column, index, isSwitch: true })}
                value="IsUnique"
                name="IsUnique"
                color="primary"
              />
            }
            label="Is Unique"
          />
          <FormControlLabel
            className={classes.switch}
            control={
              <Switch
                checked={column.IsPrimaryKey}
                onChange={this.handleChange({ column, index, isSwitch: true })}
                value="IsPrimaryKey"
                name="IsPrimaryKey"
                color="primary"
              />
            }
            label="Is Primary Key"
          />
        </div>
        <IconButton
          className={classes.deleteButton}
          onClick={() => this.deleteColumn(index)}
          aria-label="Delete"
          color="secondary"
        >
          <Delete />
        </IconButton>
      </div>
    </Paper>
  );

  render() {
    const { classes } = this.props;
    const { columns } = this.state;

    return (
      <div style={{ marginTop: 25 }}>
        <div style={{ marginBottom: 25 }}>{this.renderTable(columns)}</div>
        <div className={classes.addNewButton}>
          <Button className={classes.button} variant="raised" color="primary" onClick={this.addColumn}>
            Add a column
          </Button>
          <Button className={classes.generateJsonButton} variant="raised" color="primary" onClick={this.onSubmit}>
            Submit
          </Button>
        </div>
        <form className={classes.container} noValidate autoComplete="off">
          <this.SortableList
            items={columns}
            onSortStart={this.onSortStart}
            onSortEnd={this.onSortEnd}
            useDragHandle
            lockAxis="y"
          />
        </form>
      </div>
    );
  }
}

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    width: 1000,
    // marginTop: 20,
  },
  textField: {
    // marginLeft: theme.spacing.unit,
    // marginRight: theme.spacing.unit,
    // width: 200,
  },
  menu: {
    width: 200,
  },
  columnContainer: {
    // paddingTop: 10,
    // paddingBottom: 10,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  formControl: {
    marginLeft: 20,
    minWidth: 150,
  },
  paddLeft: {
    paddingLeft: -10,
    paddingBottom: 10,
  },
  sortableContainer: {
    position: 'relative',
    width: 1000,
  },
  switch: {
    marginLeft: 20,
  },
  addNewButton: {
    marginBottom: 20,
  },
  generateJsonButton: {
    marginLeft: 15,
  },
});

export default withStyles(styles)(CreateCategory);
