if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' }).then((registration) => {
      const announceUpdate = () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new Event('asteria:update-ready'));
          }
        });
      };
      registration.addEventListener('updatefound', announceUpdate);
      if (registration.waiting && navigator.serviceWorker.controller) window.dispatchEvent(new Event('asteria:update-ready'));
      return registration.update();
    }).catch((error) => console.warn('ASTERIA offline support registration failed:', error));
  });
}
