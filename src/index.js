import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { createMuiTheme } from 'material-ui/styles';
import App from './App';
import './index.css';

const theme = createMuiTheme({
  overrides: {
    MuiInput: {
      underline: {
        '&:hover:not($disabled):before': {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
    // error: will us the default color
  },
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>,
  document.querySelector('#root')
);
