(function () {
    var scriptUrl = document.currentScript ? document.currentScript.src : '';
    var hlsModuleUrl = scriptUrl ? new URL('hls-vendor.js', scriptUrl).href : './hls-vendor.js';
    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsPromise) {
            hlsPromise = import(hlsModuleUrl).then(function (module) {
                return module.H;
            }).catch(function () {
                return null;
            });
        }
        return hlsPromise;
    }

    function showMessage(player, text) {
        var old = player.querySelector('.player-message');
        if (old) {
            old.remove();
        }
        var message = document.createElement('div');
        message.className = 'player-message';
        message.textContent = text;
        message.style.position = 'absolute';
        message.style.left = '50%';
        message.style.top = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.zIndex = '4';
        message.style.padding = '14px 18px';
        message.style.borderRadius = '14px';
        message.style.background = 'rgba(15, 23, 42, 0.92)';
        message.style.color = '#f8fafc';
        player.appendChild(message);
    }

    function setupPlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var source = player.getAttribute('data-src');
        var hlsInstance = null;
        var initialized = false;

        if (!video || !cover || !source) {
            return;
        }

        function startPlayback() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    showMessage(player, '点击视频区域即可继续播放');
                });
            }
        }

        function bindSource(HlsClass) {
            if (initialized) {
                player.classList.add('is-playing');
                video.controls = true;
                startPlayback();
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    startPlayback();
                }, { once: true });
            } else if (HlsClass && HlsClass.isSupported()) {
                hlsInstance = new HlsClass({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(HlsClass.Events.MANIFEST_PARSED, function () {
                    startPlayback();
                });
                hlsInstance.on(HlsClass.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showMessage(player, '暂时无法播放，请稍后再试');
                    }
                });
            } else {
                showMessage(player, '当前浏览器暂不支持播放');
                initialized = false;
                return;
            }
            video.controls = true;
            player.classList.add('is-playing');
        }

        cover.addEventListener('click', function () {
            loadHls().then(bindSource);
        });
        video.addEventListener('click', function () {
            if (!initialized) {
                loadHls().then(bindSource);
                return;
            }
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.media-player').forEach(setupPlayer);
    });
}());
