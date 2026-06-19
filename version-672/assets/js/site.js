(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyMovieFilters(scope) {
    var container = scope || document;
    var input = container.querySelector("[data-search-input]");
    var typeSelect = container.querySelector("[data-type-filter]");
    var yearSelect = container.querySelector("[data-year-filter]");
    var chips = Array.prototype.slice.call(container.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-search-item]"));
    var empty = container.querySelector("[data-empty-state]");
    var query = normalize(input ? input.value : "");
    var typeValue = normalize(typeSelect ? typeSelect.value : "");
    var yearValue = normalize(yearSelect ? yearSelect.value : "");
    var activeChip = chips.find(function (chip) {
      return chip.classList.contains("is-active");
    });
    var regionValue = normalize(activeChip ? activeChip.getAttribute("data-filter-chip") : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.textContent
      ].join(" "));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
      var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
      var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
      var show = matchesQuery && matchesType && matchesYear && matchesRegion;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.addEventListener("mouseenter", function () {
        show(thumbIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupSearchBlocks() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-search-block]"));
    blocks.forEach(function (block) {
      var input = block.querySelector("[data-search-input]");
      var typeSelect = block.querySelector("[data-type-filter]");
      var yearSelect = block.querySelector("[data-year-filter]");
      var chips = Array.prototype.slice.call(block.querySelectorAll("[data-filter-chip]"));

      if (input) {
        input.addEventListener("input", function () {
          applyMovieFilters(block);
        });
      }

      if (typeSelect) {
        typeSelect.addEventListener("change", function () {
          applyMovieFilters(block);
        });
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", function () {
          applyMovieFilters(block);
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (other) {
            other.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyMovieFilters(block);
        });
      });

      applyMovieFilters(block);
    });
  }

  function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./index.html?search=" + encodeURIComponent(query) + "#library";
        } else {
          window.location.href = "./index.html#library";
        }
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("search");
    if (query) {
      var libraryInput = document.querySelector("#library [data-search-input]");
      if (libraryInput) {
        libraryInput.value = query;
        var block = libraryInput.closest("[data-search-block]");
        if (block) {
          applyMovieFilters(block);
        }
      }
    }
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-player-cover]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play]"));
    var attached = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", startPlayback);
    });

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (!attached) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearchBlocks();
    setupHeaderSearch();
  });
})();
