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
  return new Uint8Array(hashBuffer);
}

// Create Passkey Challenge
export async function createPasskeyChallenge(frequencyUrl, accountPublicKey, nonce, accountOwnershipProof) {
  const api = await loadApi(frequencyUrl);
  const alicePublicKey = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const balanceTransferTx = api.tx.balances.transferAllowDeath(alicePublicKey, 1000);
  const ext_call_type = api.registry.createType('Call', balanceTransferTx);
  const passkeyCall = {
    accountId: accountPublicKey,
    accountNonce: nonce,
    accountOwnershipProof: {
      Sr25519: accountOwnershipProof,
    },
    call: ext_call_type,
  };
  const passkeyCallType = api.createType('PalletPasskeyPasskeyCall', passkeyCall);
  const calculatedChallenge = u8aToHex(await sha256(passkeyCallType.toU8a()));
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
export async function generatePasskeyTx(
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
  const tx = api.tx.passkey.proxy(payload);
  const txHex = tx.toHex();
  const rpcUrl = encodeURIComponent(frequencyUrl);
  const polkadotJsUrl = `https://polkadot.js.org/apps/?rpc=${rpcUrl}#/extrinsics/decode/${txHex}`;

  return {
    txHex,
    polkadotJsUrl,
  };
}

export const credentialPublicKeyCborToCompressedKey = (credentialPublicKey) => {
  try {
    // Decode the CBOR data
    const decoded = cbor.decode(credentialPublicKey);

    // Check if the decoded data is a Uint8Array (likely just the x and y concatenated)
    if (decoded instanceof Uint8Array) {
      // If you know the format, extract x and y
      const x = decoded.slice(0, 32); // Assuming first 32 bytes are x
      const y = decoded.slice(32); // Assuming next bytes are y

      // Determine the tag based on the last bit of y
      const tag = (y[y.length - 1] & 1) === 1 ? 3 : 2;

      // Create a Uint8Array to store the compressed key
      const result = new Uint8Array(33);
      result[0] = tag;

      // Copy x into the result starting at index 1
      result.set(x, 1);

      return result;
    } else if (decoded instanceof Map) {
      // Handle Map as previously explained
      if (!decoded.has(-2) || !decoded.has(-3)) {
        throw new Error('Unexpected CBOR structure');
      }

      const x = decoded.get(-2);
      const y = decoded.get(-3);

      const tag = (y[y.length - 1] & 1) === 1 ? 3 : 2;
      const result = new Uint8Array(33);
      result[0] = tag;
      result.set(x, 1);

      return result;
    } else {
      throw new Error('Unexpected decoded CBOR structure');
    }
  } catch (error) {
    console.error('Error decoding CBOR data:', error);
    throw new Error('Failed to decode CBOR data properly');
  }
};

// Call this function to create passkeys
export async function createPassKeys() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
  );

  const publicKey = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const encodedPublicKey = cbor.encode(new Uint8Array(publicKey));
  return {
    passKeyPrivateKey: u8aToHex(new Uint8Array(privateKey)),
    passKeyPublicKey: u8aToHex(encodedPublicKey),
  };
}

// Call this function to sign passkey challenges
export async function signPasskeyChallenge(privateKeyHex, passkeyChallengeHex) {
  const privateKey = await importPrivateKey(privateKeyHex);
  const authenticatorDataRaw = 'WJ8JTNbivTWn-433ubs148A7EgWowi4SAcYBjLWfo1EdAAAAAA';
  const replacedClientDataRaw =
    'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiI3JwbGMjIiwib3JpZ2luIjoiaHR0cHM6Ly9wYXNza2V5LmFtcGxpY2EuaW86ODA4MCIsImNyb3NzT3JpZ2luIjpmYWxzZSwiYWxnIjoiSFMyNTYifQ';
  const challengeReplacer = '#rplc#';
  let clientData = base64UrlToUint8Array(replacedClientDataRaw);
  let authenticatorData = base64UrlToUint8Array(authenticatorDataRaw);
  const passkeyChallengeBytes = hexToU8a(passkeyChallengeHex);

  // Convert passkeyChallengeBytes to a base64 URL-encoded string
  const calculatedChallengeBase64url = btoa(String.fromCharCode(...passkeyChallengeBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Replace the placeholder in the clientData JSON string
  const clientDataJSON = new TextDecoder().decode(clientData).replace(challengeReplacer, calculatedChallengeBase64url);
  const clientDataBytes = new TextEncoder().encode(clientDataJSON);

  // Prepare the signing payload
  const shaClientData = await sha256(clientDataBytes);

  // Concatenate authenticatorData and shaClientData
  const dataToSign = new Uint8Array([...authenticatorData, ...shaClientData]);

  // Sign the challenge using the private key
  const passKeySignature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' }, // Specify the hash algorithm used
    },
    privateKey,
    dataToSign,
  );

  return u8aToHex(new Uint8Array(passKeySignature)); // Ensure this conversion
}

// Helper function to import a private key from a hex string
async function importPrivateKey(privateKeyHex) {
  const privateKeyBytes = hexToU8a(privateKeyHex);

  return await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign'],
  );
}
