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

// Only allowed in iframe mode
if (window.parent) {
  window.addEventListener(
    'message',
    (event) => {
      // Add an origin URL check
      // if (event.origin !== "http://example.org:8080") return;
      try {
        const msg = typeof event.data === 'string' ? (JSON.parse(event.data) as ActionMsg) : event.data;
        switch (msg.action) {
          case 'generate':
            generate();
            break;
          case 'sign':
            sign(msg.key);
            break;
          case 'download':
            download();
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
