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

let originUrls: URL[] = [];
let eventRegistered = false;

export function initialize(acceptedOriginUrls: string[], downloadCallback: (exported: string) => void) {
  if (acceptedOriginUrls.length === 0) {
    throw new Error('No accepted origin url is provided.');
  }
  originUrls = acceptedOriginUrls.map((url: string) => new URL(url));

  // Only allowed in iframe mode
  if (window.parent) {
    // only registering once
    if (!eventRegistered) {
      eventRegistered = true;

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
                let exported = download(event.origin);
                if (exported != undefined && exported.length > 0) {
                  downloadCallback(exported);
                }
                break;
            }
          } catch (_e: any) {
            // Do nothing, as this isn't a message for us.
          }
          return;
        },
        false,
      );
    }
  }
}

const isValidOrigin = (origin: string) => {
  return originUrls.find((url) => url.origin === origin);
};
