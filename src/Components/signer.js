import Web3 from 'web3';
import axios from 'axios';
import { padLeft, toChecksumAddress } from 'web3-utils';

import { HOST } from './Remote';
import { loadVault, getKey } from './keys';

const web3 = new Web3();

let token;
let contract;
let gasPrice;
let chainId;

export const initSigner = async () => {
  const { data: contracts } = await axios.get(`${HOST}/contracts.json`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });
  const { data: { deployments } } = await axios.get(`${HOST}/registrar.json`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });

  // eslint-disable-next-line
  const registry = Object.values(deployments).reduce((acc, ele) => (acc = Object.assign(acc, ele)), {});
  token = new web3.eth.Contract(contracts.ScryToken.abi, registry.ScryToken);
  console.info('token:', token._address);
  contract = new web3.eth.Contract(contracts.Scry.abi, registry.Scry);
  console.info('contract:', contract._address);

  ({ data: { gasPrice, chainId } } = await axios.get(`${HOST}/chainInfo`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  }));

  console.info(`gas:${gasPrice} chain:${chainId}`);
};

const signAndSend = async (from, to, gas, payload, url, extra) => {
  const vault = await loadVault(window.localStorage.getItem(from.username), from.password);
  const sender = toChecksumAddress(vault.addresses[0]);
  const { data: { nonce } } = await axios.get(`${HOST}/nonce/${sender}`, {
    headers: { Authorization: localStorage.getItem('id_token') },
  });
  console.info(`nonce ${nonce} for acct: ${sender}`);
  console.info(`from: ${sender} to: ${to}`);
  const tx = {
    chainId,
    gasPrice,
    nonce,
    from: sender,
    to,
    gas,
    data: payload,
  };
  console.info(`tx: ${JSON.stringify(tx)}`);

  const key = `0x${await getKey(vault, from.password)}`;
  console.info(`key: ${key}`);
  const signed = await web3.eth.accounts.signTransaction(tx, key);
  console.info('signed', signed);

  const resp = await axios({
    method: 'post',
    url: `${HOST}/${url}`,
    data: { data: signed.rawTransaction, ...extra },
    headers: { Authorization: localStorage.getItem('id_token') },
  });
  console.info('resp:', resp.data);
  return resp.data.create_block;
};

export const openChannel = (amount, buyer, seller, reward, verifiers) => {
  const hx = toChecksumAddress(seller) + padLeft(reward, 8).slice(2) + padLeft(verifiers, 8).slice(2);
  console.info(`hx: ${hx}`);
  console.log(token);
  const payload = token.methods.transfer(contract._address, amount, hx).encodeABI();

  return signAndSend(buyer, token._address, 198580, payload, 'rawTx');
};

export const buyerAuthorization = async (buyer, seller, createBlock, amount) => {
  const vault = await loadVault(window.localStorage.getItem(buyer.username), buyer.password);
  const key = `0x${await getKey(vault, buyer.password)}`;
  const msg = `Receiver: ${seller}, Balance: ${amount}, At Block: ${createBlock}`;
  return web3.eth.accounts.sign(msg, key);
};

export const verifierAuthorization = async (seller, verifier, cid) => {
  if (!seller || !verifier) {
    throw new Error(`invalid arguments for verification seller:${seller}, cid:${verifier}`);
  }
  const vault = await loadVault(window.localStorage.getItem(verifier.username), verifier.password);
  const key = `0x${await getKey(vault, verifier.password)}`;
  const msg = `Owner: ${seller}, For CID: ${cid}`;
  return web3.eth.accounts.sign(msg, key);
};

export const closeChannel = async (...params) => {
  console.info('close', params);
  const [buyer, seller, verifier, createBlock, cid, amount, balanceSig, verifySig, id] = params;
  const payload = contract.methods
    .close(toChecksumAddress(buyer), createBlock, amount, balanceSig, toChecksumAddress(verifier), cid, verifySig)
    .encodeABI();
  console.info(`payload: ${payload}`);

  return signAndSend(seller, contract._address, 315058, payload, 'seller/close', { id });
};
