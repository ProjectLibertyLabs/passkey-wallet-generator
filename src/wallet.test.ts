import { expect, describe, it, beforeEach } from 'vitest';
import {
  generateAndReturnPublicKey,
  signPasskeyPublicKey,
  testHelperResetState,
  triggerSeedPhraseDownload,
} from './wallet.js';
import { isHex } from '@polkadot/util';
import { signatureVerify } from '@polkadot/util-crypto';

beforeEach(() => {
  testHelperResetState();
});

describe('generateAndReturnPublicKey', () => {
  it('It should successfully generate a Sr25519 public key', async () => {
    let publicKey = await generateAndReturnPublicKey();
    expect(publicKey).exist;
    expect(isHex(publicKey)).equals(true);
  });

  it('It should successfully generate different Sr25519 public keys', async () => {
    let publicKey1 = await generateAndReturnPublicKey();
    let publicKey2 = await generateAndReturnPublicKey();
    expect(publicKey1).exist;
    expect(publicKey2).exist;
    expect(publicKey1).not.equals(publicKey2);
  });
});

describe('signPasskeyPublicKey', () => {
  it('It should throw error if key is not generated', async () => {
    expect(signPasskeyPublicKey('0x1234')).rejects.toThrowError(/^Keypair is not generated!$/);
  });
  it('It should throw error if not a valid hex input', async () => {
    await generateAndReturnPublicKey();
    expect(signPasskeyPublicKey('shgidghsadas')).rejects.toThrowError(/^Input is not a valid hex!$/);
  });
  it('It should sign successfully', async () => {
    let publicKey = await generateAndReturnPublicKey();
    let payload =
      '0xdc5e4f604c629cd96b00d0cdd91d20c8efc0d9dd81c15953119225b7337a6c4768012dc084c7992bcb4973608f3d0d97c7ce2cc7b5c4b54d2c1d1696dc49a282';
    let signature = await signPasskeyPublicKey(payload);
    expect(signature).exist;
    expect(isHex(signature)).equals(true);

    let result = signatureVerify(payload, signature, publicKey);
    expect(result.isValid).equals(true);
  });
});

describe('triggerSeedPhraseDownload', () => {
  it('should throw error if key is not generated', () => {
    expect(() => triggerSeedPhraseDownload()).toThrowError(/^Keypair is not generated!$/);
  });

  it('should return a valid JSON string if key is generated', async () => {
    await generateAndReturnPublicKey();
    const seedData = triggerSeedPhraseDownload();
    const parsedData = JSON.parse(seedData);

    expect(parsedData).toHaveProperty('seed');
    expect(parsedData).toHaveProperty('whenCreated');
    expect(typeof parsedData.seed).toBe('string');
    expect(typeof parsedData.whenCreated).toBe('number');
  });
});
