// Advanced DevTools detection logic

let devtoolsOpen = false;
let threshold = 160; // px, for window resize detection

function emitDevtoolsEvent(open) {
  if (devtoolsOpen !== open) {
    devtoolsOpen = open;
    window.dispatchEvent(new CustomEvent('devtoolschange', { detail: { open } }));
  }
}

// 1. Detect by measuring window size changes
window.addEventListener('resize', () => {
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    emitDevtoolsEvent(true);
  } else {
    emitDevtoolsEvent(false);
  }
});

// 2. Detect by measuring execution time of debugger statement
setInterval(() => {
  const start = performance.now();
  debugger;
  if (performance.now() - start > 100) {
    emitDevtoolsEvent(true);
  }
}, 1000);

// 3. Detect by checking for DevTools-specific properties
setInterval(() => {
  if (
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
    window.devtools ||
    window.chrome && window.chrome.devtools
  ) {
    emitDevtoolsEvent(true);
  }
}, 1000);

// 4. Detect by using console.log side effects
(function() {
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      emitDevtoolsEvent(true);
    }
  });
  setInterval(() => {
    devtoolsOpen = false;
    console.log(element);
    setTimeout(() => {
      if (!devtoolsOpen) emitDevtoolsEvent(false);
    }, 100);
  }, 1000);
})();

// 5. Detect by listening for key events (F12, Ctrl+Shift+I)
window.addEventListener('keydown', (e) => {
  if (
    (e.key === 'F12') ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
  ) {
    emitDevtoolsEvent(true);
  }
});

// Usage: Listen for devtoolschange event
// window.addEventListener('devtoolschange', (e) => {
//   if (e.detail.open) {
//     // DevTools is open
//   } else {
//     // DevTools is closed
//   }
// });
