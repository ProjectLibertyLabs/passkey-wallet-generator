import { generateAndReturnPublicKey, signPasskeyPublicKey, triggerSeedPhraseDownload } from './wallet';

export const generate = async () => {
  try {
    const result = await generateAndReturnPublicKey();
    parent.postMessage({ resp: 'generate', error: false, result });
  } catch (e: any) {
    parent.postMessage({ resp: 'generate', error: true });
  }
};

export const sign = async (publicKey: string) => {
  try {
    const result = await signPasskeyPublicKey(publicKey);
    parent.postMessage({ resp: 'sign', error: false, result });
  } catch (e: any) {
    parent.postMessage({ resp: 'sign', error: true });
  }
};

export const download = () => {
  try {
    triggerSeedPhraseDownload();
    parent.postMessage({ resp: 'download', error: false });
  } catch (e: any) {
    parent.postMessage({ resp: 'download', error: true });
  }
};
