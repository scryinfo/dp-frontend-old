import { keystore, signing } from 'eth-lightwallet';

const DERIVATION_PATH = "m/44'/60'/0'/0";

export const loadVault = (vaultJs, password) => {
  if (vaultJs === null) {
    throw new Error('Vault not found for user');
  }
  const vault = keystore.deserialize(vaultJs);
  // make sure vault password is correct
  return new Promise((resolve, reject) => {
    // symmetric vault key from password, only valid within callback
    vault.keyFromPassword(password, (err, key) => {
      if (err) {
        reject(err);
      }
      if (!vault.isDerivedKeyCorrect(key)) {
        reject(new Error('bad password'));
      }
      resolve(vault);
    });
  });
};

export const getMnemonic = (vaultJs, password) => {
  if (vaultJs === null) {
    throw new Error('Vault not found for user');
  }
  const vault = keystore.deserialize(vaultJs);
  // make sure vault password is correct
  return new Promise((resolve, reject) => {
    // symmetric vault key from password, only valid within callback
    vault.keyFromPassword(password, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      if (!vault.isDerivedKeyCorrect(key)) {
        reject('bad password');
        return;
      }
      resolve(vault.getSeed(key));
    });
  });
};

export const createVault = (password, mnemonic) =>
  new Promise((resolve, reject) => {
    keystore.createVault(
      {
        seedPhrase: mnemonic,
        password,
        hdPathString: DERIVATION_PATH,
      },
      (err, vault) => {
        if (err) reject(err);
        resolve(vault);
      }
    );
  });

export const createAddress = async (vault, password) =>
  new Promise((resolve, reject) => {
    // symmetric vault key from password, only valid within callback
    vault.keyFromPassword(password, (err, key) => {
      if (err) reject(err);
      // console.info("key:", key, vault.isDerivedKeyCorrect(key));
      vault.generateNewAddress(key, 1);
      resolve(vault.getAddresses());
    });
  });

export const signMsg = (vault, password, rawMsg, addr) =>
  new Promise((resolve, reject) => {
    // symmetric vault key from password, only valid within callback
    vault.keyFromPassword(password, (err, key) => {
      if (err) reject(err);
      const sig = signing.signMsg(vault, key, rawMsg, vault.getAddresses()[addr]);
      resolve(sig);
    });
  });

// danger
export const getKey = (vault, password) =>
  new Promise((resolve, reject) => {
    // symmetric vault key from password, only valid within callback
    vault.keyFromPassword(password, (err, key) => {
      if (err) reject(err);
      // console.info("key:", key, vault.isDerivedKeyCorrect(key));
      const exp = vault.exportPrivateKey(vault.getAddresses()[0], key);
      // console.info('exp:', exp, 'addr', vault.getAddresses()[0]);
      resolve(exp);
    });
  });
