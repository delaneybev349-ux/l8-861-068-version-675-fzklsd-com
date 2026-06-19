function initMoviePlayer(source) {
  var box = document.querySelector('[data-player]');
  if (!box) {
    return;
  }

  var video = box.querySelector('video');
  var overlay = box.querySelector('.player-overlay');
  var buttons = Array.prototype.slice.call(box.querySelectorAll('[data-play]'));
  var loaded = false;
  var hlsInstance = null;

  function bindVideo() {
    if (loaded || !video) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    bindVideo();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var request = video.play();
    if (request && request.catch) {
      request.catch(function () {});
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', playVideo);
  });

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
