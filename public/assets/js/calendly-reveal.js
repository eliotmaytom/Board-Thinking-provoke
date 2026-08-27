(function () {
  var panel = document.getElementById('calendlyPanel');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-book-cta]'));
  if (!panel || !triggers.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var widgetLoaded = false;

  function loadWidgetScript(onReady) {
    if (widgetLoaded) { onReady(); return; }
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.onload = function () { widgetLoaded = true; onReady(); };
    document.body.appendChild(s);
  }

  triggers.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      panel.hidden = false;
      loadWidgetScript(function () {
        panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
  });
})();
