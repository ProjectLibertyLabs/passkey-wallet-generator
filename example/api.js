import { hexToU8a, u8aToHex, u8aWrapBytes } from 'https://cdn.jsdelivr.net/npm/@polkadot/util@12.6.2/+esm';
import { WsProvider, ApiPromise } from 'https://cdn.jsdelivr.net/npm/@polkadot/api@10.12.6/+esm';

let singletonApi;
let singletonProvider;

// Load up the api for the given provider uri
export async function loadApi(providerUri) {
  // Singleton
  if (!providerUri && singletonApi) return singletonApi;
  // Just asking for the singleton, but don't have it
  if (!providerUri) {
    return null;
  }
  // Handle disconnects
  if (providerUri) {
    if (singletonApi) {
      await singletonApi.disconnect();
    } else if (singletonProvider) {
      await singletonProvider.disconnect();
    }
  }

  // Singleton Provider because it starts trying to connect here.
  singletonProvider = new WsProvider(providerUri);
  singletonApi = await ApiPromise.create({ provider: singletonProvider, throwOnConnect: true });
  return singletonApi;
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return u8aToHex(new Uint8Array(hashBuffer));
}

// Create passkey challenge
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
  // replace the challenge in the clientData with placeholder
  const clientData = Buffer.from(clientDataRaw).toString('utf-8').replace(originalChallenge, challengeReplacer);

  const passkeyTransactionPayload = {
    passkeyPublicKey: Array.from(passKeyPublicKeyBytes),
    verifiablePasskeySignature: {
      signature: Array.from(passkeySignatureBytes),
      authenticatorData: Array.from(authenticatorData),
      clientDataJson: Array.from(Buffer.from(clientData)),
    },
    passkeyCall: passkeyCallType,
  };
  const payload = api.createType('PalletPasskeyPasskeyPayload', passkeyTransactionPayload);
  const tx = api.tx.passkey.passkey(payload);
  return tx.toHex();
}

export const base64UrlToUint8Array = (base64) => new Uint8Array(Buffer.from(base64, 'base64url'));
