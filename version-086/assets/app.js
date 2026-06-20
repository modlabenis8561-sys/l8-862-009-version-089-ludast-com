(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterType = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilter() {
      if (!cards.length) {
        return;
      }

      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var type = filterType ? filterType.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-keywords') || ''
        ].join(' ').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedType = !type || cardType.indexOf(type) !== -1;
        var matched = matchedQuery && matchedType;

        card.classList.toggle('is-filtered-out', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (filterType) {
      filterType.addEventListener('change', applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (filterInput && queryFromUrl) {
      filterInput.value = queryFromUrl;
      applyFilter();
    }
  });
})();
