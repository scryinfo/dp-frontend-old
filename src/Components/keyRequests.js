import Mnemonic from 'bitcore-mnemonic';

const { loadVault, createVault, getKey, createAddress } = require('./keys');

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
  await createAddress(vault, password);
  // save locally
  window.localStorage.setItem(username, vault.serialize());
  await getKey(vault, password);
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
  try {
    const vault = await createVault(password, mnemonic);
    console.info('created vault:', vault, ' for:', username, ' mnemonic:', mnemonic);
    await createAddress(vault, password);
    // save locally
    window.localStorage.setItem(username, vault.serialize());
    await getKey(vault, password);
    // save on remote
    // await newAccount(username, addresses[0], key);
    return {
      username,
      mnemonic,
      address: vault.getAddresses()[0],
    };
  } catch (e) {
    console.log('errrrororororor');
    throw new Error(e);
  }
};
