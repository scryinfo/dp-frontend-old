import React from 'react';
import { withStyles } from 'material-ui/styles';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

const styles = theme => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
  infoPopup: {
    backgroundColor: '#14222C',
    marginBottom: '20px',
    borderRadius: '3px',
  },
});

class InfoPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={!!this.props.message}
        autoHideDuration={20000}
        onClose={this.props.handleClose}
        SnackbarContentProps={{
          className: this.props.classes.infoPopup,
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{this.props.message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.props.handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    );
  }
}

export default withStyles(styles)(InfoPopup);
