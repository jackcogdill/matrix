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

function rain() {
    const alpha = "0123456789ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ";

    const fsize = 10;
    const font = `${fsize}pt 'Hack', 'Ubuntu Light', monospace`;
    const opacity = 0.05;

    // Spacing between glyphs
    const hspace = 1.1;
    const vspace = 1.3;
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

    const R = () => randInt(100, 250);
    const color = (x, y) => {
        const r = R() * y / height * 1.2 | 0;
        const g = R() * x / width * 1.667 * 0.9 | 0;
        const b = R() * ((height - y) * 2 / x) / (height/width) * 0.4 | 0;
        return `rgb(${r}, ${g}, ${b})`;
    };

    const fps = 35;
    const fpsInterval = 1000 / fps;
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
            ctx.fillStyle = color(x, y);
            ctx.fillText(char, x, y);

            // Reset if raindrop is some distance past bottom of screen
            const randHeight = randInt(height, height * 1.667);
            drops[i] = y > randHeight ? 0 : y + glyphH;
        });
    })();
}

(() => {
    setUp();
    rain();
})();
