// Homepage margin art (styles in css/home-margins.css). Builds the art only once the window is
// wide enough to have gutters, so narrow screens never download it. Each image is shown once,
// whole; brass colour, opacity and feathering are applied here by SVG filter and mask, and the
// art itself is unchanged. The pointer light only runs on pointer and scroll events.
(function () {
    var DIR = 'img/morrowind/';
    var BRASS = '0 0 0 0 .867  0 0 0 0 .71  0 0 0 0 .455  ';
    // Parchments: the luminance window [dark, light] that becomes the ink
    var PARCH = {
        tx_dwrv_parch00: [.26, .42], tx_dwrv_parch10: [.02, .15], tx_dwrv_parch20: [.10, .36],
        tx_dwrv_parch30: [.32, .48], tx_dwrv_parch40: [.06, .20], tx_dwrv_parch50: [.44, .60]
    };
    // Eight per gutter, top to bottom: [file, kind, height, width on a wide screen, place across
    // the gutter]. Script pages and wide parchments alternate with illustrations.
    var COLS = {
        l: [
            ['divinemetaphysics', 'ill', 256, 236, 'flex-end'], ['divinemetaphysics_text1', 'txt', 256, 150, 'flex-start'],
            ['secret_of_dwemer1', 'ill', 256, 196, 'center'], ['tx_dwrv_parch00', 'parch', 128, 270, 'flex-start'],
            ['eggoftime_illust2', 'ill', 256, 220, 'flex-end'], ['tx_dwrv_parch10', 'parch', 256, 190, 'flex-start'],
            ['eggoftime_illust3', 'txt', 256, 150, 'center'], ['tx_dwrv_parch40', 'parch', 128, 280, 'flex-end']
        ],
        r: [
            ['secret_of_dwemer2', 'ill', 256, 210, 'flex-start'], ['tx_dwrv_parch30', 'parch', 128, 260, 'flex-end'],
            ['eggoftime_illust1', 'txt', 256, 150, 'center'], ['tx_dwrv_parch50', 'parch', 256, 230, 'flex-start'],
            ['secret_of_dwemer3', 'ill', 256, 236, 'flex-end'], ['divinemetaphysics_text2', 'txt', 256, 150, 'flex-start'],
            ['eggoftime_illust4', 'ill', 256, 220, 'center'], ['tx_dwrv_parch20', 'parch', 256, 200, 'flex-end']
        ]
    };
    var wide = window.matchMedia('(min-width: 88rem)');
    var fine = window.matchMedia('(min-width: 88rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    var layer = null, lit = null;

    function mask(h) {
        return '<mask id="mb-m' + h + '" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="' + h + '"><rect x="6" y="6" width="244" height="' + (h - 12) + '" fill="url(#mb-g)" filter="url(#mb-soft)"/></mask>';
    }
    function build() {
        if (layer) return;
        // Book pages keep their own alpha; a parchment's alpha comes from its luminance window
        var defs = '<filter id="mb-a" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1"><feColorMatrix type="matrix" values="' + BRASS + '0 0 0 1 0"/></filter>';
        Object.keys(PARCH).forEach(function (f) {
            var lo = PARCH[f][0], hi = PARCH[f][1], k = 1 / (hi - lo);
            defs += '<filter id="mb-' + f + '" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1"><feColorMatrix type="matrix" values="' + BRASS +
                (-.2126 * k) + ' ' + (-.7152 * k) + ' ' + (-.0722 * k) + ' 0 ' + (hi * k) + '"/><feComponentTransfer><feFuncA type="gamma" exponent="1.4"/></feComponentTransfer><feComposite in2="SourceAlpha" operator="in"/></filter>';
        });
        defs += '<filter id="mb-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>' +
            '<radialGradient id="mb-g"><stop offset=".55" stop-color="#fff"/><stop offset=".84" stop-color="#777"/><stop offset="1" stop-color="#000"/></radialGradient>' +
            mask(256) + mask(128);
        var cols = Object.keys(COLS).map(function (side) {
            return '<div class="mb-col mb-' + side + '">' + COLS[side].map(function (p) {
                var filter = p[1] === 'parch' ? 'mb-' + p[0] : 'mb-a';
                return '<svg class="mb-' + p[1] + '" viewBox="0 0 256 ' + p[2] + '" style="--s:' + p[3] + 'px;aspect-ratio:256/' + p[2] + ';align-self:' + p[4] + '" focusable="false">' +
                    '<g class="mb-pen" mask="url(#mb-m' + p[2] + ')"><image href="' + DIR + p[0] + '.png" width="256" height="' + p[2] + '" filter="url(#' + filter + ')"/></g></svg>';
            }).join('') + '</div>';
        }).join('');
        document.body.insertAdjacentHTML('afterbegin',
            '<svg class="mb-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' + defs + '</defs></svg>' +
            '<div class="mb" aria-hidden="true">' + cols + '</div>');
        layer = document.body.querySelector('.mb');
    }

    // Pointer light: a lit copy of the art under a soft mask that follows the pointer. Its
    // position is taken against the layer, so it stays correct while the page scrolls.
    var x = 0, y = 0, frame = 0, live = false, seen = false;
    function paint() {
        frame = 0;
        var r = lit.getBoundingClientRect();
        lit.style.setProperty('--mb-x', (x - r.left) + 'px');
        lit.style.setProperty('--mb-y', (y - r.top) + 'px');
        lit.classList.add('mb-on');
    }
    function move(e) {
        if (e.pointerType === 'touch') return;
        x = e.clientX; y = e.clientY; seen = true;
        if (!frame) frame = requestAnimationFrame(paint);
    }
    function scroll() { if (seen && !frame) frame = requestAnimationFrame(paint); }
    function hide() {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        seen = false;
        if (lit) lit.classList.remove('mb-on');
    }
    function out(e) { if (!e.relatedTarget) hide(); }
    function syncLight() {
        if (fine.matches === live) return;
        live = fine.matches;
        if (live && !lit) {
            build();
            lit = layer.cloneNode(true);
            lit.classList.add('mb-lit');
            layer.after(lit);
        }
        var on = live ? 'addEventListener' : 'removeEventListener';
        document[on]('pointermove', move, { passive: true });
        document[on]('pointerout', out);
        window[on]('scroll', scroll, { passive: true });
        window[on]('blur', hide);
        if (!live) hide();
    }
    function watch(mq, fn) {
        if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn);
    }
    function syncWide() { if (wide.matches) build(); }

    watch(wide, syncWide);
    watch(fine, syncLight);
    syncWide();
    syncLight();
})();
