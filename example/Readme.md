# Passkey Wallet Generator Example

## Overview

This project provides a set of tools for generating, signing, and managing passkeys in a browser environment using WebAssembly and the Polkadot.js library. The implementation is designed to work with the Frequency blockchain and includes functions for creating passkeys, signing messages, and handling passkey challenges.

## Prerequisites

- Node.js (for running the `index.js` script)
- A modern web browser (for using the `index.html` interface)
- Access to a Frequency node (for interacting with the blockchain)

## Getting Started

### Setting Up the Project

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd passkey-wallet-generator
   ```

2. **Install dependencies:**

   This project uses some dependencies that are loaded via CDNs, so no local installation is required for the front-end. However, ensure you have Node.js installed for running the backend scripts.

### Using the JavaScript Functions

The `index.js` file includes several key functions:

- **`createPassKeys()`**: Generates a new passkey (private and public keys) and returns them in hexadecimal format, with the public key encoded in CBOR format.

- **`signAccountPublicKey(privateKeyHex, accountPublicKeyHex)`**: Signs a public key using the provided private key and returns the signature in hexadecimal format.

- **`signPasskeyChallenge(privateKeyHex, passkeyChallengeHex)`**: Signs a passkey challenge using the provided private key and returns the signature in hexadecimal format.

### Example Usage

To run these functions from the command line:

```bash
node p256/index.js createPassKeys
node p256/index.js signAccountPublicKey <privateKeyHex> <accountPublicKeyHex>
node p256/index.js signPasskeyChallenge <privateKeyHex> <passkeyChallengeHex>
```

### Using the Web Interface

The `index.html` file provides a simple web interface to interact with the passkey generator and signer. To use it:

1. **Run the following npm command**:

   ```bash
   npm i
   npm run dev
   ```

2. **Interact with the UI** to generate and sign passkeys. The UI should include fields to input required data like `privateKeyHex`, `accountPublicKeyHex`, and `passkeyChallengeHex`.

### Integrating with the Blockchain

The project includes functions that interact with the Frequency blockchain:

- **`loadApi(providerUri)`**: Initializes the Polkadot.js API using the specified WebSocket provider URI.

- **`createPasskeyChallenge(frequencyUrl, accountPublicKey, nonce, accountOwnershipProof, balanceTransferTxHash)`**: Creates a passkey challenge based on account details and a balance transfer transaction hash.

- **`sendPasskeyTransaction(frequencyUrl, passkeyPublicKey, originalChallenge, passkeySignature, passkeyAuthenticatorData, passkeyClientData, passkeyCall)`**: Sends a signed passkey transaction to the Frequency blockchain.

### Dependencies

The project uses the following libraries:

- [@polkadot/util](https://www.npmjs.com/package/@polkadot/util) for utility functions.
- [@polkadot/api](https://www.npmjs.com/package/@polkadot/api) for interacting with the Polkadot ecosystem.
- [@noble/curves](https://www.npmjs.com/package/@noble/curves) for cryptographic functions.
- [cbor](https://www.npmjs.com/package/cbor) for encoding and decoding CBOR data.

### Troubleshooting

- **CBOR Errors**: If you encounter issues related to CBOR encoding or decoding, ensure that the structure being decoded matches your expectations. Adjustments may be needed depending on the format of the encoded data.

- **Blockchain Connection**: Ensure you have a reliable connection to a Frequency node when using the `loadApi` function.
