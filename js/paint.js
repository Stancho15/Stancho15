/*
  Paintings source.

  Paint.get(work, size) returns { color, height, w, h } for a work.
  Real photos are loaded from work.image. Works without a photo get a stand-in
  painted here stroke by stroke, drawing every brushstroke into a colour canvas
  and a matching relief canvas, so the moving light has real texture to catch.
  Delete a work's paint: {...} line once you have a photo; nothing else changes.
*/
window.Paint = (function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeNoise(seed) {
    var r = rng(seed), N = 64, g = new Float32Array(N * N);
    for (var i = 0; i < g.length; i++) g[i] = r();
    function smooth(t) { return t * t * (3 - 2 * t); }
    function at(x, y) { return g[((y & 63) * N + (x & 63)) | 0]; }
    function value(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), fx = smooth(x - xi), fy = smooth(y - yi);
      var a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    return function fbm(x, y) {
      return value(x, y) * 0.55 + value(x * 2.1 + 7, y * 2.1 + 3) * 0.3 + value(x * 4.3 + 1, y * 4.3 + 9) * 0.15;
    };
  }

  function hexRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function ramp(colors) {
    return function (t) {
      t = Math.max(0, Math.min(0.9999, t)) * (colors.length - 1);
      var i = Math.floor(t), f = t - i, a = colors[i], b = colors[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    };
  }

  /* Each composition gives a tone (0-1) and a brush direction for a point. */
  var compositions = {
    horizon: function (r, fbm, aspect) {
      var line = 0.42 + r() * 0.2, sun = 0.25 + r() * 0.5;
      return {
        tone: function (u, v) {
          var h = line + (fbm(u * 3, 2.5) - 0.5) * 0.08, t;
          var d = Math.hypot((u - sun) * aspect, (v - h + 0.06) * 1.4);
          if (v < h) t = 0.42 + 0.3 * (1 - v / h) * 0.6 + Math.max(0, 0.62 - d * 1.5) + (fbm(u * 3, v * 7) - 0.5) * 0.3;
          else {
            var streak = Math.exp(-Math.pow((u - sun) * aspect * 5, 2)) * 0.6 * (fbm(u * 8, v * 24) + 0.15);
            t = 0.1 + (1 - (v - h) / (1 - h)) * 0.22 + streak + (fbm(u * 2, v * 12) - 0.5) * 0.42;
          }
          return t;
        },
        angle: function (u, v) { return (fbm(u * 2.5, v * 5) - 0.5) * 0.9; },
      };
    },
    field: function (r, fbm) {
      var a = 0.26 + r() * 0.16, b = a + 0.22 + r() * 0.2;
      var t0 = 0.25 + r() * 0.25, t1 = 0.55 + r() * 0.2, t2 = 0.3 + r() * 0.5;
      function band(e, v) { return Math.max(0, Math.min(1, (v - e) / 0.07 + 0.5)); }
      return {
        tone: function (u, v) {
          var w = (fbm(u * 3, v * 3) - 0.5) * 0.09, s1 = band(a + w, v), s2 = band(b + w, v);
          var t = t0 + (t1 - t0) * s1;
          t = t + (t2 - t) * s2;
          return t + (fbm(u * 6, v * 6) - 0.5) * 0.34;
        },
        angle: function (u, v) { return (fbm(u * 3 + 4, v * 3) - 0.5) * 6.2; },
      };
    },
    bloom: function (r, fbm, aspect) {
      var blobs = [];
      for (var i = 0; i < 16; i++) {
        blobs.push({ x: 0.08 + r() * 0.84, y: 0.08 + r() * 0.8, s: 0.05 + r() * 0.12, t: 0.6 + r() * 0.4 });
      }
      function nearest(u, v) {
        var best = blobs[0], bd = 9;
        for (var i = 0; i < blobs.length; i++) {
          var b = blobs[i], d = Math.hypot((u - b.x) * aspect, v - b.y) / b.s;
          if (d < bd) { bd = d; best = b; }
        }
        return { b: best, d: bd };
      }
      return {
        tone: function (u, v) {
          var n = nearest(u, v), wob = (fbm(u * 9, v * 9) - 0.5) * 0.5;
          var ground = 0.1 + v * 0.14 + (fbm(u * 3, v * 3) - 0.5) * 0.4;
          var mix = Math.max(0, Math.min(1, (1.05 - n.d + wob) * 3.5));
          return ground + (n.b.t - ground) * mix + (0.5 - n.d) * mix * 0.12;
        },
        angle: function (u, v) {
          var n = nearest(u, v);
          return Math.atan2((v - n.b.y), (u - n.b.x) * aspect) + 1.57 + (fbm(u * 4, v * 4) - 0.5) * 1.2;
        },
      };
    },
  };

  var PASSES = [
    { n: 240, len: 0.2, wid: 0.06, b: 14, jitter: 0.06 },
    { n: 800, len: 0.11, wid: 0.026, b: 9, jitter: 0.09 },
    { n: 1250, len: 0.055, wid: 0.012, b: 6, jitter: 0.12 },
  ];

  function tick() { return new Promise(function (res) { setTimeout(res, 0); }); }

  function canvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  async function paintWork(work, size) {
    var aspect = work.w / work.h;
    var W = aspect >= 1 ? size : Math.round(size * aspect);
    var H = aspect >= 1 ? Math.round(size / aspect) : size;
    var L = Math.max(W, H);
    var color = canvas(W, H), height = canvas(W, H);
    var c = color.getContext("2d"), h = height.getContext("2d");
    var spec = work.paint, r = rng(spec.seed), fbm = makeNoise(spec.seed * 7 + 3);
    var palette = ramp(spec.palette.map(hexRgb));
    var comp = compositions[spec.kind](r, fbm, aspect);

    var ground = palette(0.22);
    c.fillStyle = "rgb(" + ground.map(Math.round) + ")";
    c.fillRect(0, 0, W, H);
    h.fillStyle = "#3a3a3a";
    h.fillRect(0, 0, W, H);
    c.lineCap = h.lineCap = "round";
    c.lineJoin = h.lineJoin = "round";
    c.globalAlpha = 0.86;
    h.globalAlpha = 0.5; // ridges build up where strokes overlap, instead of stacking like tiles

    var count = 0;
    for (var p = 0; p < PASSES.length; p++) {
      var pass = PASSES[p];
      var scaled = Math.round(pass.n * (0.75 + 0.5 * Math.max(aspect, 1 / aspect) * 0.5));
      for (var s = 0; s < scaled; s++) {
        var u = r() * 1.1 - 0.05, v = r() * 1.1 - 0.05;
        var rgb = palette(comp.tone(u, v) + (r() - 0.5) * pass.jitter * 1.6);
        var a = comp.angle(u, v) + (r() - 0.5) * 0.35;
        var steps = 9, len = (pass.len * (0.55 + r() * 0.9) * L) / steps;
        var x = u * W, y = v * H, pts = [];
        for (var k = 0; k <= steps; k++) {
          pts.push([x, y, a]);
          x += Math.cos(a) * len; y += Math.sin(a) * len;
          a = comp.angle(x / W, y / H) * 0.35 + a * 0.65 + (r() - 0.5) * 0.12;
        }
        var wid = pass.wid * L * (0.7 + r() * 0.6), B = pass.b;
        var line = (wid / B) * 1.5;
        c.lineWidth = line; h.lineWidth = line;
        var gl = 0.55 + r() * 0.35;
        for (var b = 0; b < B; b++) {
          var o = (b / (B - 1) - 0.5) * wid * (0.85 + r() * 0.3);
          var edge = Math.abs(b / (B - 1) - 0.5) * 2;
          var shade = 1 + (r() - 0.5) * 0.15;
          var grey = Math.round(255 * Math.min(1, (0.3 + r() * 0.42 + edge * 0.08) * gl + 0.14));
          // Bristles land and lift at different moments, so a stroke has no hard square ends.
          var taper = 1 - edge * edge * 0.55;
          var start = Math.floor(r() * 3 * (1.2 - taper));
          var end = Math.max(start + 2, Math.ceil(pts.length * taper * (0.5 + r() * 0.5)));
          c.strokeStyle = "rgb(" + Math.round(rgb[0] * shade) + "," + Math.round(rgb[1] * shade) + "," + Math.round(rgb[2] * shade) + ")";
          h.strokeStyle = "rgb(" + grey + "," + grey + "," + grey + ")";
          c.beginPath(); h.beginPath();
          for (var q = start; q < end; q++) {
            var px = pts[q][0] - Math.sin(pts[q][2]) * o, py = pts[q][1] + Math.cos(pts[q][2]) * o;
            if (q === start) { c.moveTo(px, py); h.moveTo(px, py); }
            else { c.lineTo(px, py); h.lineTo(px, py); }
          }
          c.stroke(); h.stroke();
        }
        if (++count % 90 === 0) await tick();
      }
    }
    // Wet paint settles: soften the relief a touch so light rolls over ridges.
    var soft = canvas(W, H), sc = soft.getContext("2d");
    sc.filter = "blur(" + (L / 1300).toFixed(2) + "px)";
    sc.drawImage(height, 0, 0);
    return { color: color, height: soft, w: W, h: H };
  }

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { rej(new Error("Could not load " + src)); };
      im.src = src;
    });
  }

  async function loadPhoto(work) {
    var im = await loadImage(work.image);
    var ht = work.height ? await loadImage(work.height) : im;
    return { color: im, height: ht, w: im.naturalWidth, h: im.naturalHeight, photo: true };
  }

  /* One job at a time, so painting never fights with scrolling. */
  var cache = {}, thumbs = {}, queue = Promise.resolve();
  function enqueue(fn) {
    var p = queue.then(fn, fn);
    queue = p.catch(function () {});
    return p;
  }

  function get(work, size) {
    var key = work.slug + "@" + (work.image ? "photo" : size);
    if (!cache[key]) {
      cache[key] = enqueue(function () { return work.image ? loadPhoto(work) : paintWork(work, size); });
    }
    return cache[key];
  }

  /* A URL for use in <img> and SVG <image>. */
  function url(work) {
    // Small copies for the wall and thumbnails; the full photo is only loaded up close.
    if (work.image) return Promise.resolve(work.thumb || work.image);
    if (!thumbs[work.slug]) {
      thumbs[work.slug] = get(work, 760).then(function (p) {
        return new Promise(function (res) {
          p.color.toBlob(function (b) { res(URL.createObjectURL(b)); }, "image/jpeg", 0.9);
        });
      });
    }
    return thumbs[work.slug];
  }

  /* A quiet average colour to hold the space while an image arrives. */
  function tint(work) {
    if (work.paint) return work.paint.palette[1];
    return work.tint || "#24201c";
  }

  return { get: get, url: url, tint: tint };
})();
