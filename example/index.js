new EventSource('/esbuild').addEventListener('change', () => location.reload());

window.addEventListener(
  'message',
  (event) => {
    event.preventDefault();
    try {
      const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (msg.resp === 'generate') {
        document.getElementById('generateResp').innerHTML = JSON.stringify(msg, null, 2);
      }
      if (msg.resp === 'sign') {
        document.getElementById('signResp').innerHTML = JSON.stringify(msg, null, 2);
      }
      if (msg.resp === 'download') {
        document.getElementById('downloadResp').innerHTML = JSON.stringify(msg, null, 2);
      }
    } catch (e) {
      console.error(e);
    }
  },
  false,
);

document.getElementById('generate').addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('generator').contentWindow.postMessage(JSON.stringify({ action: 'generate' }));
});

document.getElementById('sign').addEventListener('submit', (event) => {
  event.preventDefault();
  document
    .getElementById('generator')
    .contentWindow.postMessage(JSON.stringify({ action: 'sign', key: document.getElementById('step2-key').value }));
});

document.getElementById('download').addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('generator').contentWindow.postMessage(JSON.stringify({ action: 'download' }));
});
