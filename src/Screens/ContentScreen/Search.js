import React from 'react';
import { Input, InputAdornment } from 'material-ui';
import { Search as SearchIcon } from 'material-ui-icons';

class Search extends React.Component {
  render() {
    return (
      <div style={{ width: '300px' }}>
        <Input
          placeholder="Find items"
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

export default Search;
