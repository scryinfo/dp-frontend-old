import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Input, Icon, InputAdornment } from 'material-ui';
import { Search as SearchIcon } from 'material-ui-icons';

const styles = () => ({});

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <div style={{ width: '300px' }}>
        <Input
          placeholder="Find items"
          className={classes.input}
          onChange={this.props.onChange}
          value={this.props.value}
          type="search"
          fullWidth
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Search);
