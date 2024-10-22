import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from '@material-ui/core/styles';
import App from './App';
import './index.css';

const theme = createMuiTheme({
  overrides: {
    MuiInput: {
      underline: {
        '&:hover:not($disabled):before': {
          backgroundColor: 'a5a9ac',
          // backgroundColor: 'rgba(255, 255, 255, 0.7)',
          height: 1,
        },
      },
    },
  },
  palette: {
    primary: {
      light: '#ffffff',
      main: '#4AA4E0',
      dark: '#4AA4E0',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#ffffff',
      main: '#ffffff',
      dark: '#ffffff',
      contrastText: '#ffffff',
    },
  },
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Router>
      <Route
        render={({ location, history, match }) => <App currentLocation={location} match={match} history={history} />}
      />
    </Router>
  </MuiThemeProvider>,
  document.querySelector('#root')
);
