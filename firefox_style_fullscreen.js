// you must uncheck "show address bar" in the page of "vivaldi://settings/addressbar/"
// Do not set F11 in 'Fullscreen Mode'
// this script set "Alt+X" to toggle address bar and tab bar

(() => {
  'use strict';

  // Costanti di configurazione
  const FULLSCREEN_TOGGLE_DELAY = 111;        // ms di attesa dopo F11
  const TOP_OVERLAY_HEIGHT = '9px';           // altezza strip superiore
  const SIDE_OVERLAY_WIDTH = '8px';           // larghezza strip laterale

  let fullscreenEnabled = false;

  /**
   * Attende la comparsa di un elemento DOM.
   * @param {string} selector - selettore CSS
   * @returns {Promise<Element>}
   */
  function waitForElement(selector) {
    return new Promise(resolve => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      const observer = new MutationObserver((_, obs) => {
        const found = document.querySelector(selector);
        if (found) {
          obs.disconnect();
          resolve(found);
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  /**
   * Inietta uno style globale in <head>
   * @param {string} cssText
   */
  function addGlobalStyle(cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  /**
   * Crea un overlay invisibile per raccogliere pointerenter
   * @param {object} cfg
   * @returns {HTMLElement}
   */
  function createOverlay({ width, height, top, left, zIndex }) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      position: 'fixed',
      width,
      height,
      top,
      left,
      zIndex: String(zIndex),
      background: 'transparent',
      pointerEvents: 'auto'
    });
    document.body.insertBefore(div, document.body.firstChild);
    return div;
  }

  function showUI(header, browser) {
    if (!fullscreenEnabled) return;
    header.hidden = false;
    browser.classList.remove('address-top-off');
    browser.classList.add('address-top');
    document.querySelectorAll('.tabbar-wrapper').forEach(tab => tab.hidden = false);
  }

  function hideUI(header, browser, force = false) {
    if (!force && !fullscreenEnabled) return;
    header.hidden = true;
    browser.classList.remove('address-top');
    browser.classList.add('address-top-off');
    document.querySelectorAll('.tabbar-wrapper').forEach(tab => tab.hidden = true);
  }

  function toggleUI(header, browser) {
    if (!fullscreenEnabled) return;
    if (browser.classList.contains('address-top')) {
      hideUI(header, browser);
    } else {
      showUI(header, browser);
    }
  }

  async function init() {
    // Attendi che Vivaldi abbia montato i container
    const [webview, header, browser] = await Promise.all([
      waitForElement('#webview-container'),
      waitForElement('#header'),
      waitForElement('#browser'),
    ]);

    // Forza il [hidden] a display:none
    addGlobalStyle('[hidden] { display: none !important; }');

    // Verifica API Vivaldi
    if (!window.vivaldi?.tabsPrivate?.onKeyboardShortcut) {
      console.warn('API vivaldi.tabsPrivate.onKeyboardShortcut non trovata.');
      return;
    }

    // Listener per le scorciatoie da tastiera
    vivaldi.tabsPrivate.onKeyboardShortcut.addListener((id, comb) => {
      if (comb === 'F11') {
        if (fullscreenEnabled) {
          showUI(header, browser);
        } else {
          hideUI(header, browser, true);
        }
        setTimeout(() => {
          fullscreenEnabled = !fullscreenEnabled;
        }, FULLSCREEN_TOGGLE_DELAY);
      } else if (comb === 'Alt+X') {
        toggleUI(header, browser);
      }
    });

    // Overlay invisibili per pointerenter
    const topOverlay = createOverlay({
      width: '100vw',
      height: TOP_OVERLAY_HEIGHT,
      top: '0',
      left: '0',
      zIndex: 1000
    });
    topOverlay.addEventListener('pointerenter', () => showUI(header, browser));

    const sideOverlay = createOverlay({
      width: SIDE_OVERLAY_WIDTH,
      height: '100vh',
      top: '0',
      left: '0',
      zIndex: 1000
    });
    sideOverlay.addEventListener('pointerenter', () => showUI(header, browser));

    webview.addEventListener('pointerenter', () => hideUI(header, browser));
  }

  // Avvio
  init().catch(err => console.error('Errore init script:', err));
})();
