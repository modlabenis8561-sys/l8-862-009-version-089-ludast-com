(function () {
  var body = document.body;
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      body.classList.toggle('is-menu-open', isOpen);
      mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyQueryToSearchInputs() {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    document.querySelectorAll('[data-query-value]').forEach(function (input) {
      input.value = query;
    });
  }

  function initFilterBlocks() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var select = scope.querySelector('[data-filter-select]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
      var empty = scope.querySelector('[data-empty-state]');

      function runFilter() {
        var term = normalizeText(input ? input.value : '');
        var typeValue = normalizeText(select ? select.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalizeText(card.getAttribute('data-search-text'));
          var type = normalizeText(card.getAttribute('data-card-type'));
          var termMatch = !term || text.indexOf(term) !== -1;
          var typeMatch = !typeValue || type.indexOf(typeValue) !== -1;
          var show = termMatch && typeMatch;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', runFilter);
      }

      if (select) {
        select.addEventListener('change', runFilter);
      }

      runFilter();
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        activate(itemIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function initPlayer(videoId, source) {
    var video = document.getElementById(videoId);
    if (!video || !source) {
      return;
    }

    var panel = video.closest('.player-stage');
    var overlay = panel ? panel.querySelector('[data-play-overlay]') : null;
    var attached = false;
    var wantsPlay = false;
    var hlsInstance = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }

    function tryPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showOverlay();
        });
      }
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (wantsPlay) {
            tryPlay();
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              video.src = source;
            }
          }
        });
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      wantsPlay = true;
      attachStream();
      hideOverlay();
      tryPlay();
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (!video.ended) {
        hideOverlay();
      }
    });
  }

  applyQueryToSearchInputs();
  initFilterBlocks();
  initHero();
  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
