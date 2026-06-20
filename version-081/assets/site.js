(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var type = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card], .rank-item'));

    function cardText(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-category') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      cards.forEach(function (card) {
        var ok = true;
        if (query && cardText(card).indexOf(query) === -1) {
          ok = false;
        }
        if (selectedYear && (card.getAttribute('data-year') || card.textContent).indexOf(selectedYear) === -1) {
          ok = false;
        }
        if (selectedType && (card.getAttribute('data-type') || card.textContent).indexOf(selectedType) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SITE_MOVIES) {
    var queryInput = searchPage.querySelector('[data-search-input]');
    var categorySelect = searchPage.querySelector('[data-search-category]');
    var yearSelect = searchPage.querySelector('[data-search-year]');
    var searchButton = searchPage.querySelector('[data-search-button]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (queryInput) {
      queryInput.value = initialQuery;
    }

    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a href="' + movie.url + '" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\')">' +
        '<span class="poster-mask"></span><span class="play-badge">播放</span></a>' +
        '<div class="movie-card-body"><h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
        '<p>' + escapeHtml(cutText(movie.oneLine || '', 68)) + '</p><div class="tag-row">' + tags + '</div></div></article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[match];
      });
    }

    function cutText(value, size) {
      value = String(value || '');
      return value.length > size ? value.slice(0, size - 1) + '…' : value;
    }

    function renderSearch() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var list = window.SITE_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (category && movie.category !== category) {
          return false;
        }
        if (year && movie.year !== year) {
          return false;
        }
        return true;
      }).slice(0, 96);
      if (!list.length) {
        results.innerHTML = '<div class="movie-card"><div class="movie-card-body"><h2>未找到匹配影片</h2><p>可以更换关键词、分类或年份继续搜索。</p></div></div>';
        return;
      }
      results.innerHTML = list.map(movieCard).join('');
    }

    [queryInput, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', renderSearch);
        control.addEventListener('change', renderSearch);
      }
    });
    if (searchButton) {
      searchButton.addEventListener('click', renderSearch);
    }
    if (initialQuery) {
      renderSearch();
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    if (!video || !overlay) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var mounted = false;

    function mount() {
      if (!stream) {
        return;
      }
      if (!mounted) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        mounted = true;
      }
      overlay.classList.add('is-hidden');
      video.play().catch(function () {});
    }

    overlay.addEventListener('click', mount);
    video.addEventListener('click', function () {
      if (!mounted || video.paused) {
        mount();
      }
    });
  });
})();
