(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function readQueryValue() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function initSearchAndFilter() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.live-search'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    if (!cards.length) {
      return;
    }
    var state = {
      query: readQueryValue().trim().toLowerCase(),
      filter: '全部'
    };
    inputs.forEach(function (input) {
      if (state.query) {
        input.value = state.query;
      }
      input.addEventListener('input', function () {
        state.query = input.value.trim().toLowerCase();
        applyFilters();
      });
      var form = input.closest('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          if (form.classList.contains('page-search')) {
            event.preventDefault();
            state.query = input.value.trim().toLowerCase();
            applyFilters();
          }
        });
      }
    });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        state.filter = chip.getAttribute('data-filter') || '全部';
        applyFilters();
      });
    });
    function applyFilters() {
      var filter = state.filter.toLowerCase();
      cards.forEach(function (card) {
        var searchable = (card.getAttribute('data-search') || '').toLowerCase();
        var tagged = (card.getAttribute('data-tags') || '').toLowerCase();
        var passQuery = !state.query || searchable.indexOf(state.query) !== -1;
        var passFilter = filter === '全部' || searchable.indexOf(filter) !== -1 || tagged.indexOf(filter) !== -1;
        card.classList.toggle('is-hidden', !(passQuery && passFilter));
      });
    }
    if (state.query) {
      applyFilters();
    }
  }

  function initImageFallbacks() {
    Array.prototype.forEach.call(document.querySelectorAll('img'), function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initPlayers() {
    Array.prototype.forEach.call(document.querySelectorAll('.player-card'), function (card) {
      var video = card.querySelector('video');
      var trigger = card.querySelector('.play-trigger');
      var streamUrl = card.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;
      function loadStream() {
        if (!video || !streamUrl || loaded) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      }
      function play() {
        loadStream();
        card.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            card.classList.remove('is-playing');
          });
        }
      }
      if (trigger) {
        trigger.addEventListener('click', play);
      }
      card.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!loaded) {
          play();
        }
      });
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          card.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchAndFilter();
    initImageFallbacks();
    initPlayers();
  });
})();
