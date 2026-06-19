(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setHero(index, slides, dots) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        current = index;
        setHero(current, slides, dots);
      });
    });
    setInterval(function () {
      current = (current + 1) % slides.length;
      setHero(current, slides, dots);
    }, 5200);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      button.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function initFilters() {
    var input = document.getElementById('catalog-search');
    var region = document.getElementById('region-filter');
    var type = document.getElementById('type-filter');
    var year = document.getElementById('year-filter');
    var category = document.getElementById('category-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (input && query) {
      input.value = query;
    }
    function apply() {
      var q = normalize(input && input.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var c = normalize(category && category.value);
      var shown = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var ok = (!q || hay.indexOf(q) !== -1) && (!r || cardRegion.indexOf(r) !== -1 || hay.indexOf(r) !== -1) && (!t || cardType.indexOf(t) !== -1) && (!y || cardYear === y) && (!c || cardCategory === c);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }
    [input, region, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (stream) {
    var stage = document.querySelector('[data-player]');
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('[data-play-cover]');
    if (!stage || !video || !stream) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', start);
    }
    stage.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        start();
      }
    });
  };

  ready(function () {
    initHero();
    initMenu();
    initFilters();
  });
})();
