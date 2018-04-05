import decode from 'jwt-decode';
import axios from 'axios';
import { HOST } from '../Components/Remote';

export default class AuthService {
  constructor() {
    this.fetch = this.fetch.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired = token => {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  setToken = idToken => {
    localStorage.setItem('id_token', idToken);
  };

  getToken = () => localStorage.getItem('id_token');

  logout = async () => {
    await axios.post(`${HOST}/logout`, null, {
      headers: { Authorization: this.getToken() },
    });
    localStorage.removeItem('id_token');
  };

  getProfile() {
    return decode(this.getToken());
  }

  fetch(url, options) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.loggedIn()) {
      headers.Authorization = this.getToken();
    }

    return (
      fetch(url, {
        headers,
        ...options,
      })
        // .then(this._checkStatus)
        .then(response => response.json())
    );
  }

  _checkStatus = async response => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response);
    try {
      const errMessage = await response.json();
      error.response = errMessage;
      throw error;
    } catch (e) {
      throw error;
    }
  };
}
