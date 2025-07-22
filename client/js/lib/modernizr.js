// Minimal Modernizr replacement for BrowserQuest
window.Modernizr = {
    canvas: !!(document.createElement('canvas').getContext),
    audio: !!(document.createElement('audio').canPlayType),
    webgl: (function() {
        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch(e) {
            return false;
        }
    })(),
    localstorage: (function() {
        try {
            localStorage.setItem('modernizr', 'modernizr');
            localStorage.removeItem('modernizr');
            return true;
        } catch(e) {
            return false;
        }
    })(),
    touch: 'ontouchstart' in window,
    websockets: !!(window.WebSocket || window.MozWebSocket)
};