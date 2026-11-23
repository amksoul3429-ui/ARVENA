if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' }).then((registration) => registration.update()).catch((error) => {
      console.warn('ARVENA offline support registration failed:', error);
    });
  });
}
