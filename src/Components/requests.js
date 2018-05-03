import axios from 'axios';
import { HOST } from './Remote';
import { openChannel, buyerAuthorization, verifierAuthorization, closeChannel } from './signer';

// Get tokens
export const _addTokens = (account, amount) =>
  axios({
    method: 'post',
    url: `${HOST}/fund?account=${account}&amount=${amount}`,
    headers: { Authorization: localStorage.getItem('id_token') },
  });

// Get balance
export const _getBalance = account =>
  axios.get(`${HOST}/balance?account=${account}`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });

// Buy an item
export const _buyItem = async (listing, username, password, buyer, verifier, rewardPercent) => {
  const reward = Math.floor(listing.price / 100 * rewardPercent);
  const createBlock = await openChannel(listing.price, { username, password }, listing.owner.account, reward || 0, 1);

  const buyerAuth = await buyerAuthorization({ username, password }, listing.owner.account, createBlock, listing.price);

  return axios({
    method: 'post',
    url: `${HOST}/buyer/purchase`,
    data: {
      listing: listing.id,
      buyer,
      verifier: verifier !== 'none' ? verifier : null,
      rewards: rewardPercent,
      createBlock,
      buyerAuth: buyerAuth.signature,
    },
    headers: { Authorization: localStorage.getItem('id_token') },
  });
};

// Verify item
export const _verifyItem = async (item, username, password) => {
  const verifierAuth = await verifierAuthorization(
    item.listing.owner.account,
    { username, password },
    item.listing.cid
  );
  console.info('verifierAuth:', verifierAuth);

  return axios({
    method: 'post',
    url: `${HOST}/verifier/sign`,
    data: {
      item: item.id,
      verifierAuth: verifierAuth.signature,
    },
    headers: { Authorization: localStorage.getItem('id_token') },
  });
};

// Close the pending transaction
export const _closeTransaction = async (id, username, password) => {
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
};

// Get list of items
export const _getItems = (account, type) => {
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
};

// Get list of verifiers
export const _getVerifiers = () =>
  axios.get(`${HOST}/trader`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });

// // Login
// export const login = (username, password) =>
//   axios.post(`${HOST}/login`, {
//     username,
//     password,
//   });

// Login
export const login = (username, password) =>
  axios({
    method: 'post',
    url: `${HOST}/login`,
    data: {
      username,
      password,
    },
    auth: false,
  });

// Register
export const register = (username, password, account) =>
  axios({
    method: 'post',
    url: `${HOST}/signup`,
    data: {
      username,
      password,
      account,
    },
    auth: false,
  });

// Logout
export const logout = () =>
  axios({
    method: 'post',
    url: `${HOST}/logout`,
    auth: false,
  });
