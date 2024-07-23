import { generate, sign, download } from './handlers.js';

interface ActionGenerate {
  action: 'generate';
}

interface ActionSign {
  action: 'sign';
  key: string;
}

interface ActionDownload {
  action: 'download';
}

type ActionMsg = ActionGenerate | ActionSign | ActionDownload;

let originUrls: string[] = [];
let isEventRegistered = false;

/**
 * Initializes the library with accepted origins and download callback for the generated seed
 * @param acceptedOriginUrls
 * @param downloadCallback
 */
export function initialize(acceptedOriginUrls: string[], downloadCallback: (exported: string) => void) {
  if (acceptedOriginUrls.length === 0) {
    throw new Error('No accepted origin url is provided.');
  }

  originUrls = verifyAndSanitizeURLs(acceptedOriginUrls);

  // Only allowed in iframe mode
  if (window.parent) {
    // only registering once
    if (!isEventRegistered) {
      isEventRegistered = true;
      registerMessageEventListener(downloadCallback);
    }
  }
}

export const isValidOrigin = function (origin: string): boolean {
  return originUrls.some((url) => url === origin);
};

export const verifyAndSanitizeURLs = function (origins: string[]): string[] {
  let result = [];
  for (const origin of origins) {
    // throws an error if not a valid url
    let _ = new URL(origin);
    result.push(origin.toLowerCase().trim());
  }
  return result;
};

const registerMessageEventListener = function (downloadCallback: (exported: string) => void) {
  window.addEventListener(
    'message',
    (event) => {
      if (!isValidOrigin(event.origin)) {
        console.log('could not find for ', event.origin, originUrls);
        return;
      }
      try {
        const msg = typeof event.data === 'string' ? (JSON.parse(event.data) as ActionMsg) : event.data;
        switch (msg.action) {
          case 'generate':
            generate(event.origin);
            break;
          case 'sign':
            sign(event.origin, msg.key);
            break;
          case 'download':
            download(event.origin, downloadCallback);
            break;
        }
      } catch (_e: any) {
        // Do nothing, as this isn't a message for us.
      }
      return;
    },
    false,
  );
};

export const testHelperResetState = () => {
  originUrls = [];
  isEventRegistered = false;
};

export const testHelperSetState = (urls: string[]) => {
  originUrls = urls;
};
