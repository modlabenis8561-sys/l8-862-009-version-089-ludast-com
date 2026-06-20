(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const stage = document.querySelector("[data-hero-stage]");
  const dotsWrap = document.querySelector("[data-hero-dots]");

  if (stage && dotsWrap) {
    const slides = Array.from(stage.querySelectorAll(".hero-slide"));
    const dots = Array.from(dotsWrap.querySelectorAll("button"));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  const filterInput = document.querySelector("[data-filter-input]");

  if (filterInput) {
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    filterInput.addEventListener("input", function () {
      const keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        card.style.display = haystack.indexOf(keyword) === -1 ? "none" : "";
      });
    });
  }

  const searchForm = document.querySelector("[data-search-form]");
  const searchInput = document.querySelector("[data-search-page-input]");
  const searchResults = document.querySelector("[data-search-results]");

  if (searchForm && searchInput && searchResults && window.SEARCH_MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    searchInput.value = initial;

    function cardTemplate(movie) {
      const tags = movie.tags.slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.url) + "\">" +
        "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-badge\">" + escapeHtml(movie.genre) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "<h3><a href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.one_line) + "</p>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render() {
      const keyword = searchInput.value.trim().toLowerCase();
      const movies = window.SEARCH_MOVIES.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.region,
          movie.genre,
          movie.year,
          movie.type,
          movie.one_line,
          movie.tags.join(" ")
        ].join(" ").toLowerCase();
        return keyword ? haystack.indexOf(keyword) !== -1 : true;
      }).slice(0, 120);

      if (!movies.length) {
        searchResults.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片，请尝试更换关键词。</div>";
        return;
      }

      searchResults.innerHTML = movies.map(cardTemplate).join("");
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const url = new URL(window.location.href);
      const value = searchInput.value.trim();
      if (value) {
        url.searchParams.set("q", value);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
      render();
    });

    searchInput.addEventListener("input", render);
    render();
  }
}());
