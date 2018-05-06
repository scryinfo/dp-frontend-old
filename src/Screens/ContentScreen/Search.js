import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Input } from 'material-ui';

const styles = () => ({});

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <div style={{ marginLeft: '150px' }}>
        <Input
          placeholder="Find items"
          className={classes.input}
          onChange={this.props.onChange}
          value={this.props.value}
          type="search"
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Search);
