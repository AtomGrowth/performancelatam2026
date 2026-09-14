// Loader del mount point (mismo patrón que atom-mountpoint-pages): el host solo pega este script
// y el div; las URLs del bundle salen del src del propio script, así un cambio de dominio no
// obliga a tocar Webflow.
(function () {
  // Un segundo embed en la misma página cargaría dos veces el bundle y montaría duplicado.
  if (window.__aaPerformance) return;
  window.__aaPerformance = true;

  var self = document.currentScript || document.querySelector('script[src*="loader.js"]');
  var base = self ? self.src.replace(/\/loader\.js.*$/, '') : '';

  var css = base + '/dist/landing.css';
  if (!document.querySelector('link[href="' + css + '"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = css;
    document.head.appendChild(link);
  }

  var js = document.createElement('script');
  js.type = 'module';
  js.setAttribute('data-cfasync', 'false');
  js.src = base + '/dist/landing.js';
  document.head.appendChild(js);
})();
