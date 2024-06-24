import { expect, describe, it } from 'vitest';
import { generateAndReturnPublicKey, signPasskeyPublicKey, triggerSeedPhraseDownload } from './wallet.js';

describe('generateAndReturnPublicKey', () => {
  it('Does nothing', async () => {
    expect(generateAndReturnPublicKey()).resolves.toBeUndefined();
  });
});

describe('signPasskeyPublicKey', () => {
  it('Does nothing', async () => {
    expect(signPasskeyPublicKey('')).resolves.toBeUndefined();
  });
});

describe('triggerSeedPhraseDownload', () => {
  it('Does nothing', async () => {
    expect(triggerSeedPhraseDownload()).toBeUndefined();
  });
});
