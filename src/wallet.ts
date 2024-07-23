import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { hexToU8a, isHex, u8aToHex, u8aWrapBytes } from '@polkadot/util';

const keyring = new Keyring({ type: 'sr25519' });

let isReady = false;
let SEED: string = '';
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
  let payloadHex = hexToU8a(compressedPublicKeyHex);
  let wrapped = u8aWrapBytes(payloadHex);
  return u8aToHex(pair.sign(wrapped));
};

export const triggerSeedPhraseDownload = () => {
  if (SEED.length === 0) {
    throw new Error('Keypair is not generated!');
  }
  // @TODO
  return SEED;
};

export const testHelperResetState = () => {
  SEED = '';
};
