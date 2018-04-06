import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';

import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import TextField from 'material-ui/TextField';

import IconButton from 'material-ui/IconButton';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';

import Visibility from 'material-ui-icons/Visibility';
import Search from 'material-ui-icons/Search';
import VisibilityOff from 'material-ui-icons/VisibilityOff';

import './Sell.css';
import { MainContext } from '../../../Context';

const styles = {
  textField: {
    width: '260px',
  },
  inputText: {
    color: 'rgba(0,0,0,1)',
    paddingLeft: '5px',
    // paddingTop: '8px',
    fontSize: '12px',
  },
  inputLabel: {
    fontSize: '11px',
    paddingTop: '3px',
    color: 'rgba(0,0,0,1)',
  },
  searchIcon: {
    fontSize: '20px',
    marginRight: '-10px',
    color: 'rgba(0,0,0,0.4)',
  },
};

class Sell extends Component {
  constructor() {
    super();
    this.state = {
      search: '',
    };
  }

  render() {
    const { search } = this.state;
    const { classes } = this.props;
    return (
      <MainContext.Consumer>
        {context => (
          <div className="content-container">
            <div className="content-header">
              <div className="content-title">{context.state.currentPage}</div>
              <div className="content-search-bar-container">
                <div className="">
                  <TextField
                    id="search"
                    name="search"
                    type="search"
                    fullWidth
                    placeholder="Find something..."
                    className={classes.textField}
                    value={search}
                    onChange={event => this.setState({ search: event.target.value })}
                    style={{
                      height: '23px',
                      border: '1px solid rgba(0,0,0,0.3)',
                      borderRadius: '3px',
                    }}
                    InputLabelProps={{
                      classes: {
                        root: classes.inputLabel,
                        shrink: classes.inputShrink,
                      },
                    }}
                    InputProps={{
                      disableUnderline: true,
                      classes: {
                        input: classes.inputText,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Toggle password visibility"
                            onClick={this.handleClickShowPassword}
                            onMouseDown={this.handleMouseDownPassword}
                          >
                            <Search classes={{ root: classes.searchIcon }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                {/* <input className="content-search-bar" type="text" /> */}
              </div>
            </div>
          </div>
        )}
      </MainContext.Consumer>
    );
  }
}

export default withStyles(styles)(Sell);