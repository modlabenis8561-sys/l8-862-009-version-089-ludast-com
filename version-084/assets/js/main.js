(function () {
    function $(selector, context) {
        return (context || document).querySelector(selector);
    }

    function $all(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var button = $('.menu-toggle');
        var panel = $('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var frame = $('.hero-frame');
        if (!frame) {
            return;
        }
        var slides = $all('.hero-slide', frame);
        var dots = $all('.hero-dot');
        var prev = $('[data-hero-prev]');
        var next = $('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function auto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                auto();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                auto();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                auto();
            });
        });
        show(0);
        auto();
    }

    function initImageFallback() {
        function mark(image) {
            var holder = image.closest('.movie-cover, .hero-poster, .rank-cover, .detail-poster');
            if (holder) {
                holder.classList.add('image-missing');
            }
        }

        $all('img').forEach(function (image) {
            image.addEventListener('error', function () {
                mark(image);
            });
            if (image.complete && image.naturalWidth === 0) {
                mark(image);
            }
        });
    }

    function initFiltering() {
        var cards = $all('[data-movie-card]');
        if (!cards.length) {
            return;
        }
        var input = $('[data-filter-input]');
        var yearSelect = $('[data-filter-year]');
        var typeSelect = $('[data-filter-type]');
        var empty = $('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var video = $('[data-stream]');
        if (!video) {
            return;
        }
        var shell = video.closest('.video-shell');
        var button = $('.video-start');
        var stream = video.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        function attachStream() {
            if (loaded || !stream) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            attachStream();
            if (shell) {
                shell.classList.add('playing');
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('playing');
            }
        });
        video.addEventListener('pause', function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initImageFallback();
        initFiltering();
        initPlayer();
    });
}());
