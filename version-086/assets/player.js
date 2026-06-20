(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-start');
    var toggle = document.getElementById('player-toggle');
    var mute = document.getElementById('player-mute');
    var fullscreen = document.getElementById('player-fullscreen');
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }

    function setPlayingState(isPlaying) {
      if (toggle) {
        toggle.textContent = isPlaying ? 'Ⅱ' : '▶';
      }

      if (overlay) {
        overlay.classList.toggle('is-hidden', isPlaying);
      }
    }

    function startPlayback() {
      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          setPlayingState(true);
        }).catch(function () {
          setPlayingState(false);
        });
      } else {
        setPlayingState(true);
      }
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
        setPlayingState(false);
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (toggle) {
      toggle.addEventListener('click', togglePlayback);
    }

    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '静' : '音';
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', function () {
      setPlayingState(true);
    });
    video.addEventListener('pause', function () {
      setPlayingState(false);
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
