(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });

    startTimer();
  }

  var filterScope = document.querySelector('.js-filter-scope');

  if (filterScope) {
    var input = filterScope.querySelector('[data-filter-input]');
    var typeSelect = filterScope.querySelector('[data-filter-type]');
    var yearSelect = filterScope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
  }

  var playerShell = document.querySelector('[data-player-shell]');
  var video = playerShell ? playerShell.querySelector('video') : null;
  var playButton = playerShell ? playerShell.querySelector('[data-play-button]') : null;
  var hlsInstance = null;

  function bindSource() {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
    } else if (video.src !== source) {
      video.src = source;
    }
  }

  function playVideo() {
    if (!video || !playerShell) {
      return;
    }

    bindSource();
    var playPromise = video.play();
    playerShell.classList.add('is-playing');

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        playerShell.classList.remove('is-playing');
      });
    }
  }

  if (video && playerShell) {
    bindSource();

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    playerShell.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }

      if (event.target === video || event.target === playerShell) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      playerShell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      playerShell.classList.remove('is-playing');
    });
  }
}());
