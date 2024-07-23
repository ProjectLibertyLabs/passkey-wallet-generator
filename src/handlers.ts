import { generateAndReturnPublicKey, signPasskeyPublicKey, triggerSeedPhraseDownload } from './wallet';

export const generate = async (origin: string) => {
  try {
    const result = await generateAndReturnPublicKey();
    parent.postMessage({ resp: 'generate', error: false, result }, origin);
  } catch (e: any) {
    parent.postMessage({ resp: 'generate', error: true, message: e.message }, origin);
  }
};

export const sign = async (origin: string, publicKey: string) => {
  try {
    const result = await signPasskeyPublicKey(publicKey);
    parent.postMessage({ resp: 'sign', error: false, result }, origin);
  } catch (e: any) {
    parent.postMessage({ resp: 'sign', error: true, message: e.message }, origin);
  }
};

export const download = (origin: string, downloadCallback: (exported: string) => void) => {
  try {
    const exported = triggerSeedPhraseDownload();
    if (exported != undefined && exported.length > 0) {
      downloadCallback(exported);
    }
  } catch (e: any) {
    parent.postMessage({ resp: 'download', error: true, message: e.message }, origin);
  }
};
