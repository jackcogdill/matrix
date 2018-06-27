// Util functions
// ================================
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min));

const choice = str => str.charAt(randInt(0, str.length));

function animate(innerFunction, baseCase, fps) {
    if (fps) {
        const fpsInterval = 1000 / fps;
        let then = Date.now();
        let done = false;

        function loop(callback) {
            if (done) {
                callback();
                return;
            }

            requestAnimationFrame(() => loop(callback));
            // Enforce FPS
            const now = Date.now();
            const elapsed = now - then;
            if (elapsed <= fpsInterval) return;
            then = now - (elapsed % fpsInterval);

            baseCase() ? done = true : innerFunction();
        }
        return new Promise(resolve => loop(resolve));
    } else {
        function loop(callback) {
            if (baseCase()) {
                callback();
                return;
            }
            requestAnimationFrame(() => loop(callback));
            innerFunction();
        }
        return new Promise(resolve => loop(resolve));
    }
}

// Main functions
// ================================
function setUp() {
    const canvas = document.getElementById('introCanvas');

    window.width = window.innerWidth;
    window.height = window.innerHeight;
    window.ctx = canvas.getContext('2d');
    window.isMobile = screen.width <= 768;

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
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

async function rain(_options = {}) {
    // Options
    // ================================
    const defaults = {
        message: 'H3110, W0R1D',
        fps: isMobile ? 30 : 35,
    };
    const options = Object.assign({}, defaults, _options);

    const alpha = '0123456789ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ';
    const hex = '0123456789ABCDEF';

    // Colors
    // ================================
    const normal = '#5CFF5C';
    const brightA = '#8F8';
    const brightB = '#AFA';

    // Display Constants
    // ================================
    const fsize = isMobile ? 48 : 14;
    ctx.font = `${fsize}pt monospace`;
    const defaultBackground = 'rgba(0, 0, 0, 0.05)';
    // Spacing between glyphs
    const hspace = 1.1;
    const vspace = 1.2;
    // Glyph dimensions
    const glyphW = fsize * hspace;
    const glyphH = fsize * vspace;

    // Initialization Variables
    // ================================
    const { message } = options;
    let numDrops = Math.floor(width / glyphW);
    // Both 'numDrops' and 'message.length' must be either even or odd to easily center
    if ((numDrops + message.length) & 1) {
        numDrops--;
    }

    // Unused (horizontal) canvas space
    const unused = width - numDrops * glyphW + fsize * (hspace - 1);
    const padding = unused / 2; // Used to center all columns horizontally

    const hmiddle = Math.floor(numDrops / 2); // Horizontal middle of the screen (in glyphs)
    const halfText = Math.floor(message.length / 2);
    const textLeft = hmiddle - halfText; // Raindrop column index to start message
    const textRight = textLeft + message.length; // Raindrop column index to end message
    // Vertical location on screen for text (50% of screen height)
    const textTop = Math.floor(height / glyphH / 2) * glyphH;

    // Raindrop Initialization
    // ================================
    let drops = [];
    let numPerma = 0;
    for (let i = 0; i < numDrops; i++) {
        // Start randomly above screen
        let y = -1 * randInt(0, height / glyphH) * glyphH;
        y += 0.1337; // Ensure no permanent letters align the first time

        // Is this a column to display message in? (should become permanent)
        const perma = (
            i >= textLeft && i < textRight // Bounds
            && message.charAt(i - textLeft) !== ' ' // Spaces are not permanent letters
        );

        if (perma) numPerma++;

        drops.push({ y: y, perma: perma, done: false });
    }
    let numFinished = 0;
    let shouldStop = false;

    // Canvas Drawing Functions
    // ================================
    function addShadow() {
        ctx.shadowColor = 'white';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = fsize * 2;
    }

    function resetShadow() {
        ctx.shadowColor = '';
        ctx.shadowBlur = 0;
    }

    function drawBackground(fillStyle = defaultBackground) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(0, 0, width, height);
    }

    // Animation Functions
    // ================================
    function fall() {
        drawBackground();

        drops = drops.map((drop, i) => {
            let { y, perma, done } = drop;

            // Letter in message reached its final position
            if (perma && Math.abs(y - textTop) < 0.0001) {
                const char = message.charAt(i - textLeft);
                const x = padding + i * glyphW;

                if (!done) {
                    done = true;
                    numFinished++;

                    // Signal to stop the raining if half of the text has formed
                    if (numFinished > message.length / 2) {
                        shouldStop = true;
                    }

                    addShadow();
                    ctx.fillStyle = 'white';
                    ctx.fillText(char, x, y);
                    resetShadow();
                } else {
                    ctx.fillStyle = brightA;
                    ctx.fillText(char, x, y);
                }
            } else if (!done) {
                const char = choice(alpha);
                const x = padding + i * glyphW;

                // 3% brighter color
                ctx.fillStyle = (Math.random() > 0.97) ? brightB : normal;
                ctx.fillText(char, x, y);

                const shouldReset = y > randInt(height, height * 1.667);

                if (shouldReset) {
                    if (shouldStop && !perma) {
                        done = true;
                        numFinished++;
                    } else {
                        y = 0;
                    }
                } else {
                    y += glyphH;
                }
            }

            return { y, perma, done };
        });
    }

    function fadeBackground() {
        drawBackground();
        ctx.fillStyle = normal;

        drops.forEach(({ y, perma }, i) => {
            if (perma) {
                const char = message.charAt(i - textLeft);
                const x = padding + i * glyphW;
                ctx.fillText(char, x, y);
            }
        });
    }

    let numGone = 0;
    let tries = 0;
    function disappear(maxTries) {
        tries++;
        drawBackground('rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = normal;

        drops = drops.map(({ y, perma, done, char }, i) => {
            if (!perma) return { perma };

            let gone = !done;
            if (!gone) {
                if (char === undefined) {
                    char = message.charAt(i - textLeft);
                }
                if (Math.random() > 0.75) {
                    char = choice(hex);
                }

                const x = padding + i * glyphW;
                ctx.fillText(char, x, y);

                // Kill if it's taking too long
                if (Math.random() > 0.90 || tries > maxTries) {
                    gone = true;
                    numGone++;
                }
            }
            return { y, perma, done: !gone, char };
        });
    }

    const { fps } = options;
    await animate(fall, () => numFinished === numDrops, fps);

    let i = 0;
    await animate(fadeBackground, () => i++ === 25, fps);

    const disappearFps = fps / 2;
    const maxSeconds = 1;
    const maxTries = maxSeconds * disappearFps;
    await animate(() => disappear(maxTries), () => numGone === numPerma, disappearFps);

    drawBackground('black');
}

(async () => {
    setUp();
    const message = isMobile ? 'WELCOME' : 'WELCOME, VISITOR';
    await rain({ message });
})();
