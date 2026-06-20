(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var noResults = document.querySelector("[data-no-results]");
    var query = normalize(input ? input.value : "");
    var selected = normalize(select ? select.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].join(" "));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchSelected = !selected || haystack.indexOf(selected) !== -1;
      var show = matchQuery && matchSelected;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle("show", visible === 0);
    }
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (input && q) {
      input.value = q;
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    if (select) {
      select.addEventListener("change", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        if (input) {
          input.value = chip.getAttribute("data-filter-chip") || "";
        }
        applyFilters();
      });
    });

    applyFilters();
  }

  function setupMobileNav() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }
  }

  window.startMoviePlayer = function (streamUrl, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var initialized = false;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function start() {
      cover.classList.add("hidden");

      if (!initialized) {
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = streamUrl;
        }
      }

      playVideo();
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("ended", function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
        hlsInstance.stopLoad();
      }
    });
  };

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
