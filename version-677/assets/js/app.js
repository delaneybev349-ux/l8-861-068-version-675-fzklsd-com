(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-menu-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
                slide.setAttribute("aria-hidden", slideIndex === current ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
        ].join(" ").toLowerCase();
    }

    function filterScope(scope) {
        var input = scope.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var empty = scope.querySelector("[data-empty-state]");
        var activeChip = scope.querySelector("[data-filter-chip].is-active");
        var query = input ? input.value.trim().toLowerCase() : "";
        var chip = activeChip ? activeChip.getAttribute("data-filter-chip") : "all";
        var visible = 0;

        cards.forEach(function (card) {
            var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
            var matchesChip = chip === "all" || card.getAttribute("data-type") === chip || card.getAttribute("data-region") === chip || card.getAttribute("data-category") === chip;
            var matched = matchesQuery && matchesChip;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        if (!scopes.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));

            if (input && query && scope.getAttribute("data-search-page") === "true") {
                input.value = query;
            }
            if (input) {
                input.addEventListener("input", function () {
                    filterScope(scope);
                });
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    filterScope(scope);
                });
            });
            filterScope(scope);
        });
    }

    function initPlayer() {
        var box = document.querySelector("[data-player]");
        if (!box) {
            return;
        }
        var video = box.querySelector("[data-player-video]");
        var button = box.querySelector("[data-player-button]");
        if (!video || !button) {
            return;
        }
        var src = video.getAttribute("data-src");
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !src) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegURL")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            attach();
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
