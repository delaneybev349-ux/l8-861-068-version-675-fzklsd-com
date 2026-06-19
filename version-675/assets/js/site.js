(function () {
    function findCards(scope) {
        return Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    }

    function applyFilters(scope) {
        var cards = findCards(scope);
        var queryInput = scope.querySelector('[data-search-input]');
        var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('.filter-button.is-active'));
        var active = {};
        buttons.forEach(function (button) {
            var key = button.getAttribute('data-filter-key');
            var value = button.getAttribute('data-filter-value');
            if (key && value && value !== 'all') {
                active[key] = value;
            }
        });
        var visible = 0;
        cards.forEach(function (card) {
            var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
            var ok = true;
            Object.keys(active).forEach(function (key) {
                var field = card.getAttribute('data-' + key) || '';
                if (field.indexOf(active[key]) === -1) {
                    ok = false;
                }
            });
            if (query && keywords.indexOf(query) === -1) {
                ok = false;
            }
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });
        var empty = scope.querySelector('.no-results');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    function initMenus() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll('form.site-search')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function initFilterScopes() {
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
            Array.prototype.slice.call(scope.querySelectorAll('.filter-button')).forEach(function (button) {
                button.addEventListener('click', function () {
                    var key = button.getAttribute('data-filter-key');
                    Array.prototype.slice.call(scope.querySelectorAll('.filter-button[data-filter-key="' + key + '"]')).forEach(function (peer) {
                        peer.classList.remove('is-active');
                    });
                    button.classList.add('is-active');
                    applyFilters(scope);
                });
            });
            Array.prototype.slice.call(scope.querySelectorAll('[data-search-input]')).forEach(function (input) {
                input.addEventListener('input', function () {
                    applyFilters(scope);
                });
            });
            applyFilters(scope);
        });
    }

    function initSearchPage() {
        var input = document.querySelector('[data-search-input]');
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
            var scope = input.closest('[data-filter-scope]');
            if (scope) {
                applyFilters(scope);
            }
        }
    }

    window.initPlayer = function (streamUrl) {
        var player = document.querySelector('.movie-player');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var started = false;
        function play() {
            if (started) {
                video.play();
                return;
            }
            started = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }
            video.src = streamUrl;
            video.play();
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!started) {
                play();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenus();
        initHero();
        initSearchForms();
        initFilterScopes();
        initSearchPage();
    });
})();
