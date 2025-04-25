(() => {
  'use strict';

  // Costanti
  const PANEL_ID = 'window-panel';
  const PANEL_CLASS = 'panel-group';
  const INPUT_SELECTOR = `#${PANEL_ID} .tabsearch`;

  /**
   * Callback eseguita quando vengono aggiunti nodi al DOM.
   * Se trova il pannello, focalizza l'input e ferma l'observer
   */
  function onMutations(mutations, observer) {
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          (node.id === PANEL_ID || node.classList.contains(PANEL_CLASS))
        ) {
          const input = document.querySelector(INPUT_SELECTOR);
          if (input) {
            input.focus();
            observer.disconnect();
            return;
          }
        }
      }
    }
  }

  /**
   * Inizializza il MutationObserver per il childList del documentElement
   */
  function initObserver() {
    const observer = new MutationObserver(onMutations);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Avvio: se il DOM non è ancora pronto, attende DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
