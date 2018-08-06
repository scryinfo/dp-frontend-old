import Web3 from 'web3';
import axios from 'axios';
import { padLeft, toChecksumAddress } from 'web3-utils';

import { API } from './Remote';
import { loadVault, getKey } from './keys';

const web3 = new Web3();

let token;
let contract;
let gasPrice;
let chainId;

export const initSigner = async () => {
  const { data: _contract } = await axios.get(`${API}/contract`, {
    headers: { JWT: localStorage.getItem('id_token') },
  });
  contract = new web3.eth.Contract(_contract.abi, _contract.address);
  console.info('contract:', contract._address);

  const { data: _token } = await axios.get(`${API}/token`, {
    headers: { JWT: localStorage.getItem('id_token') },
  });
  token = new web3.eth.Contract(_token.abi, _token.address);
  console.info('token:', token._address);

  ({
    data: { gasPrice, chainId },
  } = await axios.get(`${API}/chainInfo`, {
    headers: { JWT: localStorage.getItem('id_token') },
  }));

  console.info(`gas:${gasPrice} chain:${chainId}`);
};

const signAndSend = async ({ from, to, gas, payload, url, extra }) => {
  const vault = await loadVault(window.localStorage.getItem(from.username), from.password);
  const sender = toChecksumAddress(vault.addresses[0]);
  const {
    data: { nonce },
  } = await axios.get(`${API}/nonce/${sender}`, {
    headers: { JWT: localStorage.getItem('id_token') },
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
    url: `${API}/${url}`,
    data: { data: signed.rawTransaction, ...extra },
    headers: { JWT: localStorage.getItem('id_token') },
  });
  console.info('resp:', resp.data);
  return resp.data.create_block;
};

export const openChannel = ({ amount, buyer, seller, reward = 0, verifiers }) => {
  const hx = toChecksumAddress(seller) + padLeft(reward, 8).slice(2) + padLeft(verifiers, 8).slice(2);
  console.info(`hx: ${hx}`);
  const payload = token.methods.transfer(contract._address, amount, hx).encodeABI();

  return signAndSend({ from: buyer, to: token._address, gas: 198580, payload, url: 'rawTx' });
};

export const buyerAuthorization = async ({ buyer, seller, createBlock, amount }) => {
  const vault = await loadVault(window.localStorage.getItem(buyer.username), buyer.password);
  const key = `0x${await getKey(vault, buyer.password)}`;
  const msg = `Receiver: ${seller}, Balance: ${amount}, At Block: ${createBlock}`;
  return web3.eth.accounts.sign(msg, key);
};

export const verifierAuthorization = async ({ seller, verifier, cid }) => {
  if (!seller || !verifier) {
    throw new Error(`invalid arguments for verification seller:${seller}, cid:${verifier}`);
  }
  const vault = await loadVault(window.localStorage.getItem(verifier.username), verifier.password);
  const key = `0x${await getKey(vault, verifier.password)}`;
  const msg = `Owner: ${seller}, For CID: ${cid}`;
  return web3.eth.accounts.sign(msg, key);
};

export const closeChannel = async ({
  buyer,
  seller,
  verifier,
  createBlock,
  cid,
  amount,
  balanceSig,
  verifySig,
  id,
}) => {
  console.info('close', { buyer, seller, verifier, createBlock, cid, amount, balanceSig, verifySig, id });
  const payload = contract.methods
    .close(toChecksumAddress(buyer), createBlock, amount, balanceSig, toChecksumAddress(verifier), cid, verifySig)
    .encodeABI();
  console.info(`payload: ${payload}`);

  return signAndSend({ from: seller, to: contract._address, gas: 315058, payload, url: 'seller/close', extra: { id } });
};
