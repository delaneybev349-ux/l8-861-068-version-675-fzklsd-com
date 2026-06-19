const CinemaPlayer = (() => {
  function bind(options) {
    const box = document.querySelector('[data-player]');
    if (!box || !options || !options.source) {
      return;
    }

    const video = box.querySelector('video');
    const overlay = box.querySelector('.player-overlay');
    let loaded = false;
    let hls = null;

    function load() {
      if (loaded || !video) {
        return;
      }

      loaded = true;
      if (options.poster) {
        video.setAttribute('poster', options.poster);
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        video.src = options.source;
      }
    }

    function play() {
      load();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {
          video.controls = true;
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  }

  return { bind };
})();

function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function initHeroCarousel() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  if (!slides.length) {
    return;
  }

  let index = 0;
  let timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  function restart() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(() => show(index + 1), 5200);
  }

  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      restart();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      restart();
    });
  });

  restart();
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function initCardFilters() {
  const grids = Array.from(document.querySelectorAll('.filterable-grid'));
  if (!grids.length) {
    return;
  }

  const input = document.querySelector('.card-filter-input');
  const typeFilter = document.querySelector('.type-filter');
  const yearFilter = document.querySelector('.year-filter');
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (input && query) {
    input.value = query;
  }

  function update() {
    const keyword = normalizeText(input ? input.value : '');
    const typeValue = normalizeText(typeFilter ? typeFilter.value : '');
    const yearValue = normalizeText(yearFilter ? yearFilter.value : '');

    grids.forEach((grid) => {
      const cards = Array.from(grid.querySelectorAll('.movie-card'));
      cards.forEach((card) => {
        const text = normalizeText(card.getAttribute('data-search'));
        const type = normalizeText(card.getAttribute('data-type'));
        const year = normalizeText(card.getAttribute('data-year'));
        const keywordOk = !keyword || text.includes(keyword);
        const typeOk = !typeValue || type.includes(typeValue);
        const yearOk = !yearValue || year === yearValue;
        card.classList.toggle('is-hidden', !(keywordOk && typeOk && yearOk));
      });
    });
  }

  [input, typeFilter, yearFilter].forEach((element) => {
    if (element) {
      element.addEventListener('input', update);
      element.addEventListener('change', update);
    }
  });

  update();
}

function initGlobalSearch() {
  const form = document.querySelector('.global-search');
  const results = document.querySelector('.live-search-results');
  if (!form || !results || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
    return;
  }

  const input = form.querySelector('input[name="q"]');

  function render() {
    const keyword = normalizeText(input ? input.value : '');
    if (!keyword) {
      results.innerHTML = '';
      return;
    }

    const matches = window.MOVIE_SEARCH_DATA.filter((item) => {
      return normalizeText([item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ')).includes(keyword);
    }).slice(0, 8);

    results.innerHTML = matches.map((item) => `
      <a class="search-result-card" href="${item.url}">
        <img src="${item.cover}" alt="${item.title}" loading="lazy">
        <span>
          <h3>${item.title}</h3>
          <p>${item.year} · ${item.region} · ${item.type}</p>
        </span>
      </a>
    `).join('');
  }

  if (input) {
    input.addEventListener('input', render);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroCarousel();
  initCardFilters();
  initGlobalSearch();
});
