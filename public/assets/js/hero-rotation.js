(function () {
  var photos = Array.prototype.slice.call(document.querySelectorAll('[data-hero-photo]'));
  if (!photos.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var i = 0;
  setInterval(function () {
    i = (i + 1) % photos.length;
    photos.forEach(function (el, idx) {
      el.classList.toggle('is-active', idx === i);
    });
  }, 4000);
})();
