function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

function setUp() {
    const canvas = document.getElementsByTagName("canvas")[0];

    window.width = window.innerWidth;
    window.height = window.innerHeight;
    window.ctx = canvas.getContext("2d");

    // Modify canvas to be high DPI
    // Lovingly adapted from http://stackoverflow.com/a/15666143/1313757
    var dpr = window.devicePixelRatio || 1;
    var bsr = ctx.webkitBackingStorePixelRatio
        || ctx.mozBackingStorePixelRatio
        || ctx.msBackingStorePixelRatio
        || ctx.oBackingStorePixelRatio
        || ctx.backingStorePixelRatio
        || 1;
    var ratio = dpr / bsr;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function rain(options) {
    const alpha = "0123456789ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ";

    const fsize = 14;
    const font = `${fsize}pt monospace`;
    const opacity = 0.05;

    // Spacing between glyphs
    const hspace = 1.1;
    const vspace = 1.2;
    // Glyph dimensions
    const glyphW = fsize * hspace;
    const glyphH = fsize * vspace;

    const numDrops = Math.floor(width / glyphW);

    // Unused (horizontal) canvas space
    const unused = width - numDrops * glyphW + fsize * (hspace - 1);

    // Initialize raindrops
    const drops = [];
    for (let i = 0; i < numDrops; i++) {
        const pos = randInt(0, height / glyphH) * glyphH;
        drops.push(-pos);
    }

    function resetShadow() {
        ctx.shadowColor = "";
        ctx.shadowBlur = 0;
    }

    const fpsInterval = 1000 / options.fps;
    let then = Date.now();

    (loop = () => {
        requestAnimationFrame(loop);

        // Enforce fps
        const now = Date.now();
        const elapsed = now - then;
        if (elapsed <= fpsInterval) return;
        then = now - (elapsed % fpsInterval);

        // Redraw background
        resetShadow();
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(0, 0, width, height);

        ctx.font = font;

        drops.map((y, i) => {
            const index = Math.floor(Math.random() * alpha.length);
            const char = alpha.charAt(index);
            const x = unused / 2 + i * glyphW;

            // Draw character
            ctx.fillStyle = '#5CFF5C';
            ctx.fillText(char, x, y);

            // Reset if raindrop is some distance past bottom of screen
            const randHeight = randInt(height, height * 1.667);
            drops[i] = y > randHeight ? 0 : y + glyphH;
        });
    })();
}

(() => {
    const options = {
        fps: 35, // (Speed)
    };
    setUp();
    rain(options);
})();
