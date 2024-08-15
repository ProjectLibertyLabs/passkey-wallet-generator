import { secp256r1 } from '@noble/curves/p256';
import { hexToU8a, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import { sha256 } from '@noble/hashes/sha256';
import { Buffer } from 'buffer';
import cbor from 'cbor';

// Call this function to create passkeys
export function createPassKeys() {
  const passKeyPrivateKey = secp256r1.utils.randomPrivateKey();
  const passKeyPublicKey = secp256r1.getPublicKey(passKeyPrivateKey, true);
  // do a cbor encode of the public key
  const encodedPublicKey = cbor.encode(passKeyPublicKey);
  const passKeyPublicKeyHex = u8aToHex(new Uint8Array(encodedPublicKey));
  const passKeyPrivateKeyHex = u8aToHex(passKeyPrivateKey);
  return { passKeyPrivateKey: passKeyPrivateKeyHex, passKeyPublicKey: passKeyPublicKeyHex };
}

// Call this function to sign a hex message with a private key
export function signAccountPublicKey(privateKeyHex, accountPublicKeyHex) {
  const privateKey = hexToU8a(privateKeyHex);
  const accountPublicKeyBytes = hexToU8a(accountPublicKeyHex);
  const signature = secp256r1.sign(u8aWrapBytes(accountPublicKeyBytes), privateKey).toDERRawBytes();
  return u8aToHex(signature);
}

// Call this function to sign a Frequency Passkey Challenge
export function signPasskeyChallenge(privateKeyHex, passkeyChallengeHex) {
  const privateKey = hexToU8a(privateKeyHex);
  const authenticatorDataRaw = 'WJ8JTNbivTWn-433ubs148A7EgWowi4SAcYBjLWfo1EdAAAAAA';
  const replacedClientDataRaw =
    'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiI3JwbGMjIiwib3JpZ2luIjoiaHR0cHM6Ly9wYXNza2V5LmFtcGxpY2EuaW86ODA4MCIsImNyb3NzT3JpZ2luIjpmYWxzZSwiYWxnIjoiSFMyNTYifQ';
  const challengeReplacer = '#rplc#';
  let clientData = base64UrlToUint8Array(replacedClientDataRaw);
  let authenticatorData = base64UrlToUint8Array(authenticatorDataRaw);
  const passkeyChallengeBytes = hexToU8a(passkeyChallengeHex);
  const calculatedChallengeBase64url = Buffer.from(passkeyChallengeBytes).toString('base64url');
  const clientDataJSON = Buffer.from(clientData)
    .toString('utf-8')
    .replace(challengeReplacer, calculatedChallengeBase64url);
  // prepare signing payload which is [authenticator || sha256(client_data_json)]
  const passkeySha256 = sha256(new Uint8Array([...authenticatorData, ...sha256(Buffer.from(clientDataJSON))]));
  const passKeySignature = secp256r1.sign(passkeySha256, privateKey).toDERRawBytes();
  return u8aToHex(passKeySignature);
}

// Base64 URL to Uint8Array Conversion
export const base64UrlToUint8Array = (base64Url) => {
  const base64String = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Main function to handle command line arguments
const main = () => {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'createPassKeys':
      console.log(createPassKeys());
      break;

    case 'signAccountPublicKey':
      if (args.length !== 3) {
        console.error('Usage: node index.js signAccountPublicKey <privateKeyHex> <accountPublicKeyHex>');
        process.exit(1);
      }
      console.log(signAccountPublicKey(args[1], args[2]));
      break;

    case 'signPasskeyChallenge':
      if (args.length !== 3) {
        console.error('Usage: node index.js signPasskeyChallenge <privateKeyHex> <passkeyChallengeHex>');
        process.exit(1);
      }
      console.log(signPasskeyChallenge(args[1], args[2]));
      break;

    default:
      console.error('Unknown command');
      process.exit(1);
  }
};

main();
