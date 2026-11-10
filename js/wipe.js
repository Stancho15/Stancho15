/*
  PaintWipe: giant loaded brushstrokes sweep across the screen between rooms.

  Each stroke is a long bristly sprite, painted once and recoloured per trip.
  Strokes rush in from alternate sides and pause when they fully cover the
  screen. The page swaps there, unseen, and the strokes carry on and off.
*/
window.PaintWipe = (function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas, ctx, masks = [], streaks = [], W = 0, H = 0, sw = 0, bandH = 0, BANDS = 7, busy = false;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function sheet(w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  /* One stroke: a solid body with bristles that run past it at both ends. */
  function paintMask() {
    var c = sheet(sw, bandH), g = c.getContext("2d"), margin = sw * 0.09;
    g.fillStyle = "#fff";
    g.fillRect(margin, bandH * 0.04, sw - margin * 2, bandH * 0.92);
    g.strokeStyle = "#fff";
    g.lineCap = "round";
    for (var i = 0; i < 90; i++) {
      var y = rand(0, bandH);
      g.lineWidth = rand(1.5, bandH / 18);
      g.beginPath();
      g.moveTo(rand(0, margin * 1.2), y);
      g.bezierCurveTo(sw * 0.3, y + rand(-8, 8), sw * 0.7, y + rand(-8, 8), sw - rand(0, margin * 1.2), y + rand(-5, 5));
      g.stroke();
    }
    return c;
  }

  /* Dark and light hairs dragged through the paint, laid over the colour. */
  function paintStreaks() {
    var c = sheet(sw, bandH), g = c.getContext("2d");
    for (var i = 0; i < 150; i++) {
      var y = rand(0, bandH), dark = Math.random() < 0.55;
      g.strokeStyle = dark ? "rgba(0,0,0," + rand(0.05, 0.24) + ")" : "rgba(255,255,255," + rand(0.04, 0.18) + ")";
      g.lineWidth = rand(1, bandH / 26);
      g.beginPath();
      var x = rand(0, sw * 0.5);
      g.moveTo(x, y);
      g.bezierCurveTo(x + sw * 0.2, y + rand(-7, 7), x + sw * 0.4, y + rand(-7, 7), x + rand(sw * 0.4, sw * 0.9), y + rand(-5, 5));
      g.stroke();
    }
    return c;
  }

  function prepare() {
    if (W === innerWidth && H === innerHeight && canvas) return;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "wipe";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    BANDS = W < 680 ? 6 : 7;
    sw = Math.round(W * 1.9);
    bandH = Math.ceil((H / BANDS) * 1.42);
    masks = []; streaks = [];
    for (var i = 0; i < 3; i++) { masks.push(paintMask()); streaks.push(paintStreaks()); }
  }

  function colourise(paints) {
    var out = [];
    for (var i = 0; i < BANDS; i++) {
      var c = sheet(sw, bandH), g = c.getContext("2d");
      g.drawImage(masks[i % 3], 0, 0);
      g.globalCompositeOperation = "source-in";
      g.fillStyle = paints[i % paints.length];
      g.fillRect(0, 0, sw, bandH);
      g.globalCompositeOperation = "source-atop";
      g.drawImage(streaks[(i + 1) % 3], 0, 0);
      out.push(c);
    }
    return out;
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }

  function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  function run(paints, cover) {
    if (reduced || busy || document.hidden) { cover(); return; }
    busy = true;
    prepare();
    var sprites = colourise(paints), IN = 430, HOLD = 50, OUT = 460, STAGGER = 34;
    var delays = [];
    for (var i = 0; i < BANDS; i++) delays.push(((i * 3) % BANDS) * STAGGER);
    var longest = (BANDS - 1) * STAGGER, start = 0, covered = false;
    canvas.style.display = "block";

    function doCover() {
      if (covered) return;
      covered = true;
      cover();
    }
    // A stalled tab must never leave someone stuck on the old page.
    var safety = setTimeout(function () { doCover(); finish(); }, 2600);

    function finish() {
      clearTimeout(safety);
      ctx.clearRect(0, 0, W, H);
      canvas.style.display = "none";
      busy = false;
    }

    function frame(now) {
      if (!start) start = now;
      var t = now - start, inEnd = IN + longest;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < BANDS; i++) {
        var p = t < inEnd + HOLD
          ? 0.5 * easeOut(clamp((t - delays[i]) / IN))
          : 0.5 + 0.5 * easeIn(clamp((t - inEnd - HOLD - delays[i]) / OUT));
        var x = -sw + (sw + W) * p, y = (i / BANDS) * H - bandH * 0.16;
        if (i % 2) { // alternate strokes travel the other way
          ctx.save();
          ctx.translate(W, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(sprites[i], x, y);
          ctx.restore();
        } else ctx.drawImage(sprites[i], x, y);
      }
      if (t >= inEnd) doCover();
      if (t < inEnd + HOLD + OUT + longest) requestAnimationFrame(frame);
      else finish();
    }
    requestAnimationFrame(frame);
  }

  return { run: run, available: !reduced };
})();
