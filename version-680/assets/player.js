(function () {
  window.initMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }

    var box = video.closest(".player-box");
    var overlay = box ? box.querySelector(".player-overlay") : null;
    var hlsInstance = null;
    var prepared = false;

    function attachSource() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", attachSource);
    }

    video.addEventListener("play", attachSource);
    video.addEventListener("click", function () {
      if (!prepared) {
        attachSource();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
