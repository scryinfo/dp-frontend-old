import axios from 'axios';
import { API, Publisher } from './Remote';
import { openChannel, buyerAuthorization, verifierAuthorization, closeChannel } from './signer';

const getToken = () => localStorage.getItem('id_token');

// Get tokens
export const _addTokens = (account, amount) =>
  axios({
    method: 'post',
    url: `${API}/fund?account=${account}&amount=${amount}`,
    headers: { JWT: getToken() },
  });

// Get balance
export const _getBalance = account =>
  axios.get(`${API}/balance?account=${account}`, {
    headers: { JWT: getToken() },
  });

// Buy an item
export const _buyItem = async ({ listing, username, password, buyer, verifier, rewardPercent }) => {
  const reward = Math.floor((listing.price / 100) * rewardPercent);
  const createBlock = await openChannel({
    amount: listing.price,
    buyer: { username, password },
    seller: listing.owner.account,
    reward,
    verifiers: 1,
  });

  const buyerAuth = await buyerAuthorization({
    buyer: { username, password },
    seller: listing.owner.account,
    createBlock,
    amount: listing.price,
  });

  return axios({
    method: 'post',
    url: `${API}/buyer/purchase`,
    data: {
      listing: listing.id,
      buyer,
      verifier: verifier !== 'none' ? verifier : null,
      rewards: rewardPercent,
      createBlock,
      buyerAuth: buyerAuth.signature,
    },
    headers: { JWT: getToken() },
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
    url: `${API}/verifier/sign`,
    data: {
      item: item.id,
      verifierAuth: verifierAuth.signature,
    },
    headers: { JWT: getToken() },
  });
};

// Close the pending transaction
export const _closeTransaction = async (id, username, password) => {
  const { data } = await axios.get(`${API}/history/${id}`, {
    headers: { JWT: getToken() },
  });
  console.info('close:', data);

  // replace verifier with seller if verifier was not assigned
  const verifier = data.verifier ? data.verifier.account : data.listing.owner.account;
  const verifierAuth = data.verifier_auth
    ? data.verifier_auth
    : (await verifierAuthorization({
        seller: data.listing.owner.account,
        verifier: { username, password },
        cid: data.listing.cid,
      })).signature;

  return closeChannel({
    buyer: data.buyer.account,
    seller: {
      username,
      password,
    },
    verifier,
    createBlock: data.create_block,
    cid: data.listing.cid,
    amount: data.listing.price,
    balanceSig: data.buyer_auth,
    verifySig: verifierAuth,
    id,
  });
};

// Get list of items
export const _getItems = async account => {
  const [
    { data: allItems },
    { data: myItems },
    { data: historyBuyer },
    { data: historySeller },
    { data: historyVerifier },
  ] = await Promise.all([
    axios.get(`${API}/listings`, {
      headers: { JWT: getToken() },
    }),
    axios.get(`${API}/listings?owner=${account}`, {
      headers: { JWT: getToken() },
    }),
    axios.get(`${API}/history?buyer=${account}`, {
      headers: { JWT: getToken() },
    }),
    axios.get(`${API}/history?seller=${account}`, {
      headers: { JWT: getToken() },
    }),
    axios.get(`${API}/history?verifier=${account}`, {
      headers: { JWT: getToken() },
    }),
  ]);
  return [allItems, myItems, historyBuyer, historySeller, historyVerifier];
  // if (account && type) {
  //   return axios.get(`${API}/history?${type}=${account}`, {
  //     headers: { JWT: getToken() },
  //   });
  // }
  // if (account) {
  //   return axios.get(`${API}/listings?owner=${account}`, {
  //     headers: { JWT: getToken() },
  //   });
  // }
  // return axios.get(`${API}/listings`, {
  //   headers: { JWT: getToken() },
  // });
};

// Get list of verifiers
export const _getVerifiers = () =>
  axios.get(`${API}/trader`, {
    headers: { JWT: getToken() },
  });

// Login
export const login = (username, password) =>
  axios.post(`${API}/login`, {
    username,
    password,
  });

// Signup
export const register = (username, password, account) =>
  axios.post(`${API}/signup`, {
    username,
    password,
    account,
  });

// Logout
export const logout = () =>
  axios({
    method: 'post',
    url: `${API}/logout`,
    headers: { JWT: getToken() },
  });

export const _downloadFile = cid =>
  axios({
    url: `${API}/seller/download?CID=${cid}`,
    method: 'get',
    responseType: 'blob',
    headers: { JWT: getToken() },
  });

export const uploadFile = ({ data, price, getProgress }) =>
  axios({
    method: 'POST',
    url: `${API}/seller/upload?&price=${price}`,
    headers: {
      'content-type': 'multipart/form-data',
      JWT: getToken(),
    },
    data,
    onUploadProgress: progress => {
      const status = Math.floor((progress.loaded / progress.total) * 100);
      getProgress(status);
    },
  });

export const uploadFileToPublisher = ({ data, getProgress }) =>
  axios({
    method: 'POST',
    url: `${Publisher}/publisher`,
    headers: {
      'content-type': 'multipart/form-data',
      Authorization: `JWT ${getToken()}`,
    },
    data,
    onUploadProgress: progress => {
      const status = Math.floor((progress.loaded / progress.total) * 100);
      getProgress(status);
    },
  });
