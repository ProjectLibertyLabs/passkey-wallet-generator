import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { hexToU8a, isHex, u8aToHex, u8aWrapBytes } from '@polkadot/util';

const keyring = new Keyring({ type: 'sr25519' });

let isReady = false;
let SEED = '';
cryptoWaitReady().then(() => {
  isReady = true;
});

export const generateAndReturnPublicKey = async () => {
  if (!isReady) {
    throw new Error('Library is not loaded yet!');
  }
  SEED = mnemonicGenerate();
  const pair = keyring.createFromUri(SEED);
  return u8aToHex(pair.publicKey);
};

export const signPasskeyPublicKey = async (compressedPublicKeyHex: string) => {
  if (SEED.length === 0) {
    throw new Error('Keypair is not generated!');
  }
  if (!isHex(compressedPublicKeyHex)) {
    throw new Error('Input is not a valid hex!');
  }
  const pair = keyring.createFromUri(SEED);
  const payloadHex = hexToU8a(compressedPublicKeyHex);
  const wrapped = u8aWrapBytes(payloadHex);
  return u8aToHex(pair.sign(wrapped));
};

export const triggerSeedPhraseDownload = () => {
  if (SEED.length === 0) {
    throw new Error('Keypair is not generated!');
  }
  const pair = keyring.createFromUri(SEED);
  const seedData = {
    seed: SEED,
    whenCreated: new Date().getTime(),
    encoding: {
      content: ['pkcs8', 'sr25519'],
    },
    address: pair.address,
  };

  return JSON.stringify(seedData);
};

export const testHelperResetState = () => {
  SEED = '';
};
