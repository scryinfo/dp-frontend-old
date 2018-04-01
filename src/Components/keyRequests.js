import axios from 'axios';
import { HOST } from './Remote';

const Mnemonic = require('bitcore-mnemonic');
const { loadVault, createVault, getKey, createAddress } = require('./keys');

// const newAccount = async (username, account, password) => {
//   const url = `${HOST}/trader`;
//   const data = {
//     account,
//     username,
//     password,
//   };
//   return axios({
//     method: 'POST',
//     url,
//     data,
//   })
//     .then(response => response.data.balance)
//     .catch(err => console.log(err));
// };

export const getAccount = async (username, password) => {
  let vault;
  try {
    vault = await loadVault(window.localStorage.getItem(username), password);
  } catch (e) {
    console.log('vault not found', e);
    return null;
  }
  if (vault) {
    console.info('loaded vault:', vault, ' for:', username);
  }
  return vault.getAddresses()[0];
};

// CREATE NEW VAULT
export const newVault = async (username, password) => {
  const mnemonic = new Mnemonic(Mnemonic.Words.ENGLISH).phrase;
  // create
  const vault = await createVault(password, mnemonic);
  console.info('created vault:', vault, ' for:', username, ' mnemonic:', mnemonic);
  const addresses = await createAddress(vault, password);
  // save locally
  window.localStorage.setItem(username, vault.serialize());
  const key = await getKey(vault, password);
  // save on remote
  // await newAccount(username, addresses[0], key);
  return {
    username,
    mnemonic,
    address: vault.getAddresses()[0],
  };
};

// IMPORT VAULT
export const importVault = async (username, password, mnemonic) => {
  // create
  const vault = await createVault(password, mnemonic);
  console.info('created vault:', vault, ' for:', username, ' mnemonic:', mnemonic);
  const addresses = await createAddress(vault, password);
  // save locally
  window.localStorage.setItem(username, vault.serialize());
  const key = await getKey(vault, password);
  // save on remote
  // await newAccount(username, addresses[0], key);
  return {
    username,
    mnemonic,
    address: vault.getAddresses()[0],
  };
};
