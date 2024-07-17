import { Keyring } from '@polkadot/api';
import {cryptoWaitReady, mnemonicGenerate} from '@polkadot/util-crypto'
import { hexToU8a, u8aToHex, u8aWrapBytes } from '@polkadot/util';

let SEED : String;
cryptoWaitReady().then(() => {
    SEED = mnemonicGenerate();
    // console.log(SEED);
});

export const generateAndReturnPublicKey = async () => {
    SEED = mnemonicGenerate();
    // console.log("updated: ", SEED);
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromMnemonic(SEED);
    // localStorage.setItem("mnemonic", SEED);
    return u8aToHex(pair.publicKey)
};

export const signPasskeyPublicKey = async (compressedPublicKeyHex: string) => {
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromMnemonic(SEED);

    let payloadHex = hexToU8a(compressedPublicKeyHex);
    let wrapped = u8aWrapBytes(payloadHex);
    let signature =  u8aToHex(pair.sign(wrapped));
    console.log(signature);
    return signature;
};

export const triggerSeedPhraseDownload = () => {
  // @TODO
};
