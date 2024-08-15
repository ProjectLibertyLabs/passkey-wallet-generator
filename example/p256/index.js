import { secp256r1 } from '@noble/curves/p256';
import { hexToU8a, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import { sha256 } from '@noble/hashes/sha256';

// Call this function to create passkeys
// This function returns an object with two properties:
// passKeyPrivateKey: the private key
// passKeyPublicKey: the public key
export function createPassKeys() {
  const passKeyPrivateKey = secp256r1.utils.randomPrivateKey();
  const passKeyPublicKey = secp256r1.getPublicKey(passKeyPrivateKey, true);
  const passKeyPublicKeyHex = u8aToHex(passKeyPublicKey);
  const passKeyPrivateKeyHex = u8aToHex(passKeyPrivateKey);
  return { passKeyPrivateKey: passKeyPrivateKeyHex, passKeyPublicKey: passKeyPublicKeyHex };
}

// Call this function to sign a hex message with a private key
// This function returns the signature as a hex string
export function signAccountPublicKey(privateKey, accountPublicKeyHex) {
  const accountPublicKeyBytes = hexToU8a(accountPublicKeyHex);
  const signature = secp256r1.sign(u8aWrapBytes(accountPublicKeyBytes), privateKey).toDERRawBytes();
  return u8aWrapBytes(signature);
}

// Call this function to sign a Frequency Passkey Challenge
// This function returns the signature as a hex string
export function signPasskeyChallenge(privateKey, passkeyChallengeHex) {
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
  // Decode base64 URL encoding to base64
  const base64String = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Convert to Uint8Array
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Create Passkey
console.log(createPassKeys());
// Sign Account Public Key
console.log(signAccountPublicKey('TODO', 'TODO'));
// Sign Passkey Challenge
console.log(signPasskeyChallenge('TODO', 'TODO'));
