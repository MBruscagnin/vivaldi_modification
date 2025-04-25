(() => {
  'use strict';

  const SELECTOR_WEBVIEW = '#webview-container';
  const SELECTOR_BROWSER = '#browser';

  /**
   * Attende la comparsa di un elemento nel DOM
   * @param {string} selector - CSS selector dell'elemento
   * @returns {Promise<Element>}
   */
  function waitForElement(selector) {
    return new Promise(resolve => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }
      const obs = new MutationObserver((mutations, observer) => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  /**
   * Inizializza i listener su webview-container
   */
  async function initPointerToggle() {
    const webviewContainer = await waitForElement(SELECTOR_WEBVIEW);
    const browserContainer = document.querySelector(SELECTOR_BROWSER);

    if (!browserContainer) {
      console.warn(`Elemento "${SELECTOR_BROWSER}" non trovato.`);
      return;
    }

    webviewContainer.addEventListener('pointerenter', () => {
      browserContainer.classList.add('address-top-off');
      browserContainer.classList.remove('address-top');
    });

    webviewContainer.addEventListener('pointerleave', () => {
      browserContainer.classList.remove('address-top-off');
      browserContainer.classList.add('address-top');
    });
  }

  // Avvio: se il DOM non è pronto, attende DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPointerToggle);
  } else {
    initPointerToggle();
  }
})();
