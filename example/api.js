import { hexToU8a, u8aToHex } from 'https://cdn.jsdelivr.net/npm/@polkadot/util@12.6.2/+esm';
import { WsProvider, ApiPromise } from 'https://cdn.jsdelivr.net/npm/@polkadot/api@10.12.6/+esm';
import cbor from 'https://cdn.jsdelivr.net/npm/cbor-x/dist/index.js/+esm';

// Singleton API and Provider
let singletonApi;
let singletonProvider;

// Load up the api for the given provider URI
export async function loadApi(providerUri) {
  if (!providerUri && singletonApi) return singletonApi;
  if (!providerUri) return null;

  if (singletonApi) await singletonApi.disconnect();
  if (singletonProvider) await singletonProvider.disconnect();

  singletonProvider = new WsProvider(providerUri);
  singletonApi = await ApiPromise.create({ provider: singletonProvider, throwOnConnect: true });
  return singletonApi;
}

// SHA-256 Hashing Function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return u8aToHex(new Uint8Array(hashBuffer));
}

// Create Passkey Challenge
export async function createPasskeyChallenge(
  frequencyUrl,
  accountPublicKey,
  nonce,
  accountOwnershipProof,
  balanceTransferTxHash,
) {
  const api = await loadApi(frequencyUrl);
  const call = hexToU8a(balanceTransferTxHash);
  const ext_call_type = api.registry.createType('Call', call);
  const passkeyCall = {
    accountId: accountPublicKey,
    accountNonce: nonce,
    accountOwnershipProof: {
      Sr25519: accountOwnershipProof,
    },
    call: ext_call_type,
  };
  const passkeyCallType = api.createType('PalletPasskeyPasskeyCall', passkeyCall);
  const calculatedChallenge = await sha256(passkeyCallType.toU8a());
  const challenge = {
    challenge: calculatedChallenge,
    passkeyCall: u8aToHex(passkeyCallType.toU8a()),
  };
  return challenge;
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

// Create Passkey Transaction
export async function sendPasskeyTransaction(
  frequencyUrl,
  passkeyPublicKey,
  originalChallenge,
  passkeySignature,
  passkeyAuthenticatorData,
  passkeyClientData,
  passkeyCall,
) {
  const api = await loadApi(frequencyUrl);
  const call = hexToU8a(passkeyCall);
  const passkeyCallType = api.createType('PalletPasskeyPasskeyCall', call);
  const passKeyPublicKeyBytes = hexToU8a(passkeyPublicKey);
  const passkeySignatureBytes = hexToU8a(passkeySignature);
  const challengeReplacer = '#rplc#';

  let clientDataRaw = base64UrlToUint8Array(passkeyClientData);
  let authenticatorData = base64UrlToUint8Array(passkeyAuthenticatorData);

  // Convert clientDataRaw to a string, replace challenge, and then convert back to Uint8Array
  const clientData = new TextDecoder().decode(clientDataRaw).replace(originalChallenge, challengeReplacer);
  const clientDataBytes = new TextEncoder().encode(clientData);

  const passkeyTransactionPayload = {
    passkeyPublicKey: Array.from(credentialPublicKeyCborToCompressedKey(passKeyPublicKeyBytes)),
    verifiablePasskeySignature: {
      signature: Array.from(passkeySignatureBytes),
      authenticatorData: Array.from(authenticatorData),
      clientDataJson: Array.from(clientDataBytes),
    },
    passkeyCall: passkeyCallType,
  };

  const payload = api.createType('PalletPasskeyPasskeyPayload', passkeyTransactionPayload);
  const tx = api.tx.passkey.passkey(payload);
  return tx.toHex();
}

export const credentialPublicKeyCborToCompressedKey = (credentialPublicKey) => {
  let decoded = cbor.decode(credentialPublicKey);
  let x = decoded.get(-2);
  let y = decoded.get(-3);
  let tag = (y[y.length - 1] & 1) === 1 ? 3 : 2;
  let result = new Uint8Array(33);
  result[0] = tag;
  x.copy(result, 1, 0, 32);
  return result;
};
