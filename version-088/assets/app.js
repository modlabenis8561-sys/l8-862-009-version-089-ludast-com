(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    all("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");

    if (!input || !list) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (initial) {
      input.value = initial;
    }

    function applyFilter() {
      var term = input.value.trim().toLowerCase();
      var items = all(".movie-card", list);
      var visible = 0;

      items.forEach(function (item) {
        var title = (item.getAttribute("data-title") || "").toLowerCase();
        var meta = (item.getAttribute("data-meta") || "").toLowerCase();
        var matched = !term || title.indexOf(term) !== -1 || meta.indexOf(term) !== -1;
        item.classList.toggle("is-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      var empty = document.querySelector("[data-filter-empty]");
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function initPlayers() {
    all("[data-player-shell]").forEach(function (shell) {
      var video = shell.querySelector("[data-video]");
      var button = shell.querySelector("[data-play-button]");
      var mediaUrl = shell.getAttribute("data-play-url");
      var prepared = false;

      if (!video || !mediaUrl) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = mediaUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
          return;
        }

        video.src = mediaUrl;
      }

      function play() {
        prepare();
        shell.classList.add("is-playing");
        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initFilters();
    initHero();
    initPlayers();
  });
})();
