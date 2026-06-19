(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-missing");
      });
    });

    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var index = 0;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });

      show(0);
      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-search-area]").forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var sort = area.querySelector("[data-sort-select]");
      var grid = area.querySelector("[data-card-grid]");
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));

      function filterCards() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
        });
      }

      function sortCards() {
        if (!sort || !grid) {
          return;
        }
        var mode = sort.value;
        var ordered = cards.slice();
        ordered.sort(function (a, b) {
          if (mode === "latest") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (mode === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (mode === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          return 0;
        });
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
        filterCards();
      }

      if (input) {
        input.addEventListener("input", filterCards);
      }
      if (sort) {
        sort.addEventListener("change", sortCards);
      }
    });
  });
})();

function setupMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var layer = document.querySelector("[data-player-layer]");
  var button = document.getElementById("play-button");
  var loaded = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    loaded = true;
  }

  function start() {
    attachStream();
    if (layer) {
      layer.classList.add("is-hidden");
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (layer) {
    layer.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
