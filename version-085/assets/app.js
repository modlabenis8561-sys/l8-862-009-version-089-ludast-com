function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function createCard(item) {
    var article = document.createElement("article");
    article.className = "movie-card";

    var link = document.createElement("a");
    link.className = "card-cover";
    link.href = item.url;
    link.setAttribute("aria-label", item.title);

    var image = document.createElement("img");
    image.src = item.cover;
    image.alt = item.title;
    image.loading = "lazy";
    link.appendChild(image);

    var play = document.createElement("span");
    play.className = "card-play";
    play.textContent = "立即观看";
    link.appendChild(play);

    var body = document.createElement("div");
    body.className = "card-body";

    var meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = item.meta;
    body.appendChild(meta);

    var title = document.createElement("h3");
    var titleLink = document.createElement("a");
    titleLink.href = item.url;
    titleLink.textContent = item.title;
    title.appendChild(titleLink);
    body.appendChild(title);

    var summary = document.createElement("p");
    summary.textContent = item.summary;
    body.appendChild(summary);

    article.appendChild(link);
    article.appendChild(body);
    return article;
}

ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (toggle && mobileMenu) {
        toggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    document.querySelectorAll("[data-page-filter]").forEach(function (input) {
        var scope = document.querySelector("[data-filter-scope]");
        var empty = document.querySelector("[data-empty-state]");
        if (!scope) {
            return;
        }
        var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-item"));
        input.addEventListener("input", function () {
            var query = normalizeText(input.value);
            var visibleCount = 0;
            items.forEach(function (item) {
                var haystack = normalizeText(item.getAttribute("data-title") + " " + item.getAttribute("data-tags") + " " + item.textContent);
                var visible = !query || haystack.indexOf(query) !== -1;
                item.style.display = visible ? "" : "none";
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        });
    });

    var searchResults = document.getElementById("searchResults");
    var searchInput = document.getElementById("siteSearchInput");
    var searchEmpty = document.getElementById("searchEmpty");
    if (searchResults && Array.isArray(window.siteSearchItems)) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (searchInput) {
            searchInput.value = query;
        }
        var normalized = normalizeText(query);
        searchResults.innerHTML = "";
        if (normalized) {
            var results = window.siteSearchItems.filter(function (item) {
                return normalizeText(item.title + " " + item.meta + " " + item.tags + " " + item.summary).indexOf(normalized) !== -1;
            });
            results.forEach(function (item) {
                searchResults.appendChild(createCard(item));
            });
            if (searchEmpty) {
                searchEmpty.textContent = results.length ? "" : "没有找到匹配的影片";
                searchEmpty.classList.toggle("is-visible", !results.length);
            }
        } else if (searchEmpty) {
            searchEmpty.classList.add("is-visible");
        }
    }

    document.querySelectorAll(".movie-player").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".player-start");
        if (!video) {
            return;
        }
        var sourceUrl = video.getAttribute("data-video-url");
        var initialized = false;

        function bindVideo() {
            if (initialized || !sourceUrl) {
                return;
            }
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function playVideo() {
            bindVideo();
            if (button) {
                button.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        player.addEventListener("click", function (event) {
            if (event.target === player || event.target === video) {
                playVideo();
            }
        });
    });
});
