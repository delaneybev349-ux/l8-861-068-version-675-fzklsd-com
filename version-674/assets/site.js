(function() {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function() {
            var isOpen = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('.js-hero');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid'));
        if (!grids.length) {
            return;
        }
        var searchInput = document.querySelector('.js-search');
        var typeFilter = document.querySelector('.js-type-filter');
        var sortSelect = document.querySelector('.js-sort');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            grids.forEach(function(grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.searchable-card'));
                var query = normalize(searchInput && searchInput.value);
                var type = normalize(typeFilter && typeFilter.value);
                cards.forEach(function(card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre
                    ].join(' '));
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchType = !type || normalize(card.dataset.type) === type;
                    card.classList.toggle('is-hidden', !(matchQuery && matchType));
                });
                if (sortSelect) {
                    var sorted = cards.slice().sort(function(a, b) {
                        var mode = sortSelect.value;
                        if (mode === 'views') {
                            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                        }
                        if (mode === 'rating') {
                            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                        }
                        if (mode === 'title') {
                            return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                        }
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    });
                    sorted.forEach(function(card) {
                        grid.appendChild(card);
                    });
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', apply);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', apply);
        }
        apply();
    }

    window.initMoviePlayer = function(sourceUrl) {
        var video = document.querySelector('.js-movie-video');
        var overlay = document.querySelector('.player-overlay');
        if (!video || !sourceUrl) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function() {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function() {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function() {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function() {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
