(function () {
    function initImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-fallback');
            });
        });
    }

    function initMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!opened));
            panel.hidden = opened;
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
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

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-root]').forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var list = root.parentElement.querySelector('[data-filter-list]');
            var allButton = root.querySelector('[data-filter-all]');
            var activeYear = '';
            var activeRegion = '';

            if (!input || !list) {
                return;
            }

            if (input.hasAttribute('data-query-sync')) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get('q');
                if (query) {
                    input.value = query;
                }
            }

            function updateButtons(selector, value) {
                root.querySelectorAll(selector).forEach(function (button) {
                    var key = button.getAttribute('data-filter-year') || button.getAttribute('data-filter-region') || '';
                    button.classList.toggle('is-active', key === value);
                });
            }

            function applyFilter() {
                var query = input.value.trim().toLowerCase();
                var cards = list.querySelectorAll('.movie-card');
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var year = card.getAttribute('data-year') || '';
                    var region = card.getAttribute('data-region') || '';
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedYear = !activeYear || year === activeYear;
                    var matchedRegion = !activeRegion || region === activeRegion;
                    card.classList.toggle('hidden-card', !(matchedQuery && matchedYear && matchedRegion));
                });
            }

            input.addEventListener('input', applyFilter);
            root.querySelectorAll('[data-filter-year]').forEach(function (button) {
                button.addEventListener('click', function () {
                    activeYear = button.getAttribute('data-filter-year') || '';
                    if (allButton) {
                        allButton.classList.remove('is-active');
                    }
                    updateButtons('[data-filter-year]', activeYear);
                    applyFilter();
                });
            });
            root.querySelectorAll('[data-filter-region]').forEach(function (button) {
                button.addEventListener('click', function () {
                    activeRegion = button.getAttribute('data-filter-region') || '';
                    updateButtons('[data-filter-region]', activeRegion);
                    applyFilter();
                });
            });
            if (allButton) {
                allButton.addEventListener('click', function () {
                    activeYear = '';
                    activeRegion = '';
                    input.value = '';
                    root.querySelectorAll('.filter-buttons button').forEach(function (button) {
                        button.classList.remove('is-active');
                    });
                    allButton.classList.add('is-active');
                    applyFilter();
                });
            }
            applyFilter();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initImages();
        initMobileMenu();
        initHero();
        initFilters();
    });
}());
