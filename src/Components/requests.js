import axios from 'axios';
import { HOST } from './Remote';
import { openChannel, buyerAuthorization, verifierAuthorization, closeChannel } from './signer';

// Get tokens
export async function _addTokens(account, amount) {
  console.log(account, amount);
  return axios.get(`${HOST}/fund?account=${account}&amount=${amount}`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });
}

// Get balance
export async function _getBalance(account) {
  return axios.get(`${HOST}/balance?account=${account}`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });
}

export async function getPassword(username) {
  return prompt(`Please enter password for your UserName ${username}`);
}

// Buy an item
export async function _buyItem(listing, username, password, buyer, verifier, rewardPercent) {
  // const listing = await axios.get(`${HOST}/listing/${item}`);
  // convert from %
  const reward = Math.floor(listing.price / 100 * rewardPercent);
  const createBlock = await openChannel(listing.price, { username, password }, listing.owner.account, reward || 0, 1);

  const buyerAuth = await buyerAuthorization({ username, password }, listing.owner.account, createBlock, listing.price);

  return axios({
    method: 'post',
    url: `${HOST}/buyer/purchase`,
    data: {
      listing: listing.id,
      buyer,
      verifier,
      rewards: rewardPercent,
      createBlock,
      buyerAuth: buyerAuth.signature,
    },
    headers: { Authorization: localStorage.getItem('id_token') },
  });
}

// Verify item
export async function _verifyItem(item, username) {
  // const listing = await axios.get(`${HOST}/listing/${item}`);
  console.log('verify', item);
  const password = await getPassword(username);

  const verifierAuth = await verifierAuthorization(
    item.listing.owner.account,
    { username, password },
    item.listing.cid
  );
  console.info('verifierAuth:', verifierAuth);

  return axios.post(`${HOST}/verifier/sign`, {
    item: item.id,
    verifierAuth: verifierAuth.signature,
  });
}

// Close the pending transaction
export async function _closeTransaction(id, username, password) {
  const { data } = await axios.get(`${HOST}/history/${id}`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });
  console.info('close:', data);

  // replace verifier with seller if verifier was not assigned
  const verifier = data.verifier ? data.verifier.account : data.listing.owner.account;
  const verifierAuth = data.verifier_auth
    ? data.verifier_auth
    : (await verifierAuthorization(data.listing.owner.account, { username, password }, data.listing.cid)).signature;

  return closeChannel(
    data.buyer.account,
    {
      username,
      password,
    },
    verifier,
    data.create_block,
    data.listing.cid,
    data.listing.price,
    data.buyer_auth,
    verifierAuth,
    id
  );
}

// Get list of items
export async function _getItems(account, type) {
  if (account && type) {
    return axios.get(`${HOST}/history?${type}=${account}`, {
      headers: { Authorization: localStorage.getItem('id_token') },
    });
  }
  if (account) {
    return axios.get(`${HOST}/listings?owner=${account}`, {
      headers: { Authorization: localStorage.getItem('id_token') },
    });
  }
  return axios.get(`${HOST}/listings`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });
}

// Get list of verifiers
export async function _getVerifiers() {
  return axios.get(`${HOST}/trader`);
}

export const login = (username, password) =>
  axios.post(`${HOST}/login`, {
    username,
    password,
  });

export const register = (username, password, account) =>
  axios.post(`${HOST}/signup`, {
    username,
    password,
    account,
  });

export const logout = () => axios.post(`${HOST}/logout`);
