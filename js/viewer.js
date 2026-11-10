/*
  LitCanvas: shows a painting as a surface under a movable lamp.

  The relief comes from a height texture (or the photo's own brightness), and
  the lamp is computed per pixel, so raking light catches each ridge of paint.
  Pointer = lamp, drag = pan, wheel or pinch = zoom. It only renders while
  something is moving, so it costs nothing when the page is still.
*/
window.LitCanvas = (function () {
  var VS = "#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}";

  var FS = `#version 300 es
  precision highp float;
  uniform sampler2D uColor, uHeight;
  uniform vec2 uRes;
  uniform vec4 uRect;     // painting rectangle in device px, y down
  uniform vec3 uLight;    // lamp in device px, z above the surface
  uniform float uAmbient, uPower, uRelief, uEven, uRadius, uWall, uReliefK;
  uniform vec3 uTint;
  uniform vec2 uDepth;    // 3D depth: how far near parts shift against far parts
  out vec4 outColor;

  float lum(vec3 c){ return dot(c, vec3(.3,.59,.11)); }
  vec3 toLinear(vec3 c){ return pow(c, vec3(2.2)); }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }

  // Distance outside a rectangle, used for the soft shadow on the wall.
  float boxDist(vec2 p, vec2 c, vec2 h){ vec2 d = abs(p-c)-h; return length(max(d,0.)) + min(max(d.x,d.y),0.); }

  void main(){
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec2 uv = (p - uRect.xy) / uRect.zw;
    vec3 toL = uLight - vec3(p, 0.);
    float d2 = dot(toL.xy, toL.xy) / (uRadius * uRadius);
    float fall = 1. / (1. + d2 * 2.2);
    vec3 lamp = vec3(1., .94, .84) * uPower;
    vec3 col;

    if (uv.x >= 0. && uv.x <= 1. && uv.y >= 0. && uv.y <= 1.) {
      // Depth: a landscape recedes towards the top (sky far, foreground near), with a touch
      // of the paint's own relief. Near parts shift more than far ones, which reads as 3D.
      if (any(notEqual(uDepth, vec2(0.)))) {
        float h0 = lum(texture(uHeight, uv).rgb);
        float depth = clamp(uv.y * .85 + (h0 - .5) * .3, 0., 1.);
        uv = clamp(uv + uDepth * (depth - .5), vec2(.001), vec2(.999));
      }
      vec3 albedo = toLinear(texture(uColor, uv).rgb);
      vec2 size = vec2(textureSize(uHeight, 0));
      // Keep the sampling step at least one screen pixel, so relief stays stable when zoomed out.
      vec2 e = max(1. / size, 1. / uRect.zw) * 1.2;
      float hx = lum(texture(uHeight, uv + vec2(e.x,0.)).rgb) - lum(texture(uHeight, uv - vec2(e.x,0.)).rgb);
      float hy = lum(texture(uHeight, uv + vec2(0.,e.y)).rgb) - lum(texture(uHeight, uv - vec2(0.,e.y)).rgb);
      vec3 n = normalize(vec3(-hx * uRelief * uReliefK, -hy * uRelief * uReliefK, 1.));
      vec3 l = normalize(toL);
      float diff = max(dot(n, l), 0.);
      vec3 hv = normalize(l + vec3(0.,0.,1.));
      float spec = pow(max(dot(n, hv), 0.), 48.) * .16;
      vec3 raked = albedo * (uAmbient + diff * fall * lamp) + spec * fall * lamp;
      col = mix(raked, albedo * .92, uEven);
    } else {
      // The wall: same lamp, plus a soft shadow thrown away from it.
      vec2 c = uRect.xy + uRect.zw * .5;
      vec2 offset = normalize(c - uLight.xy + 1e-3) * min(uRect.z, uRect.w) * .012;
      float sd = boxDist(p - offset, c, uRect.zw * .5);
      float shadow = smoothstep(0., min(uRect.z, uRect.w) * .05, sd);
      float wallLight = uAmbient + mix(max(normalize(toL).z, 0.) * fall * uPower, .1, uEven);
      col = uTint * uWall * wallLight * mix(.42, 1., shadow);
    }
    col = pow(max(col, 0.), vec3(1./2.2));
    col += (hash(gl_FragCoord.xy) - .5) / 255.;  // dither, so dark walls don't band
    outColor = vec4(col, 1.);
  }`;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function shader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function texture(gl, unit, source) {
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var ext = gl.getExtension("EXT_texture_filter_anisotropic");
    if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  }

  function LitCanvas(host, opts) {
    var o = Object.assign({ cover: false, ambient: 0.14, power: 1.5, relief: 4, lampHeight: 0.34, wall: 0.1, zoom: true }, opts);
    var canvas = document.createElement("canvas");
    canvas.className = "surface";
    host.appendChild(canvas);

    var gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) throw new Error("WebGL2 unavailable");

    var prog = gl.createProgram();
    gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    var u = {};
    ["uColor", "uHeight", "uRes", "uRect", "uLight", "uAmbient", "uPower", "uRelief", "uEven", "uRadius", "uWall", "uTint", "uDepth", "uReliefK"].forEach(function (n) {
      u[n] = gl.getUniformLocation(prog, n);
    });
    gl.bindVertexArray(gl.createVertexArray());
    gl.uniform1i(u.uColor, 0);
    gl.uniform1i(u.uHeight, 1);
    // The wall takes the series' colour, converted to linear light for the lamp.
    var hex = parseInt((o.tint || "#efe3d0").slice(1), 16);
    gl.uniform3f(u.uTint, Math.pow(((hex >> 16) & 255) / 255, 2.2), Math.pow(((hex >> 8) & 255) / 255, 2.2), Math.pow((hex & 255) / 255, 2.2));

    var dpr = 1, vw = 1, vh = 1, img = null, frame = 0, last = 0, dead = false;
    var scale = 1, cx = 0.5, cy = 0.5, tScale = 1, tCx = 0.5, tCy = 0.5;
    var lx = 0.2, ly = 0.2, tLx = 0.2, tLy = 0.2, even = 0, tEven = 0, lampUp = 1;
    var pointers = new Map(), pinch = null, dragging = false, dragMode = "light";
    var idle = o.drift && !reduced, idleStart = 0;
    var resting = o.rest || [0.18, 0.2];
    // 3D depth (o.depth) and the opening pull-back (intro). Both off unless asked for.
    var useDepth = !!o.depth && !reduced, depthX = 0, depthY = 0, tDepthX = 0, tDepthY = 0, depthInput = 0;
    var intro = null, reliefK = 1;
    function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

    function fit() {
      if (!img) return { w: 1, h: 1 };
      var a = img.w / img.h, pad = o.cover ? 0 : Math.min(vw, vh) * 0.09;
      var aw = vw - pad * 2, ah = vh - pad * 2;
      var useW = o.cover ? aw / ah > a : aw / ah < a;
      var w = useW ? aw : ah * a, h = useW ? aw / a : ah;
      var boost = o.cover ? 1.1 : 1;
      return { w: w * boost, h: h * boost };
    }

    function clampCentre(s, x, y) {
      var f = fit(), w = f.w * s, h = f.h * s;
      var mx = w <= vw ? 0 : 0.5 - vw / 2 / w, my = h <= vh ? 0 : 0.5 - vh / 2 / h;
      return [Math.max(0.5 - mx, Math.min(0.5 + mx, x)), Math.max(0.5 - my, Math.min(0.5 + my, y))];
    }

    function draw() {
      var f = fit(), w = f.w * scale, h = f.h * scale;
      var x = vw / 2 - cx * w, y = vh / 2 - cy * h;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform4f(u.uRect, x * dpr, y * dpr, w * dpr, h * dpr);
      var base = Math.max(vw, vh);
      gl.uniform3f(u.uLight, lx * vw * dpr, ly * vh * dpr, o.lampHeight * Math.min(vw, vh) * dpr);
      gl.uniform1f(u.uAmbient, o.ambient);
      gl.uniform1f(u.uPower, o.power * lampUp);
      gl.uniform1f(u.uRelief, o.relief);
      gl.uniform1f(u.uEven, even);
      gl.uniform1f(u.uRadius, base * 0.62 * dpr);
      gl.uniform1f(u.uWall, o.wall);
      var amt = o.depthAmount || 0.028;
      gl.uniform2f(u.uDepth, useDepth ? depthX * amt : 0, useDepth ? depthY * amt * 0.6 : 0);
      gl.uniform1f(u.uReliefK, reliefK);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
      frame = 0;
      if (dead || !img) return;
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      if (idle) {
        var t = (now - idleStart) / 1000;
        tLx = 0.5 + Math.sin(t * 0.31) * 0.34;
        tLy = 0.42 + Math.sin(t * 0.47 + 1) * 0.26;
      }
      // The lamp lags a little, like something with weight. On arrival it sweeps slowly across the paint.
      var kl = reduced ? 1 : 1 - Math.exp(-dt * (lampUp < 0.9 ? 2.3 : 7));
      var kv = reduced ? 1 : 1 - Math.exp(-dt * 16);
      lx += (tLx - lx) * kl; ly += (tLy - ly) * kl;
      scale += (tScale - scale) * kv; cx += (tCx - cx) * kv; cy += (tCy - cy) * kv;
      even += (tEven - even) * (reduced ? 1 : 1 - Math.exp(-dt * 11));
      lampUp += (1 - lampUp) * (1 - Math.exp(-dt * 3.4));
      // The opening: from a close-up of the brushstrokes, slowly pulled back to the whole painting.
      if (intro) {
        var ip = Math.max(0, Math.min(1, (now - intro.start) / intro.ms)), ie = ease(ip);
        scale = tScale = intro.s + (1 - intro.s) * ie;
        cx = tCx = intro.x + (0.5 - intro.x) * ie;
        cy = tCy = intro.y + (0.5 - intro.y) * ie;
        reliefK = intro.r + (1 - intro.r) * ie;
        if (ip >= 1) { intro = null; reliefK = 1; if (o.onIntroEnd) o.onIntroEnd(); }
      }
      // Depth follows the mouse or the phone's tilt; with nothing to follow it sways gently by itself.
      if (useDepth) {
        if (now - depthInput > 2500) {
          var st = now / 1000;
          tDepthX = Math.sin(st * 0.45) * 0.55;
          tDepthY = Math.sin(st * 0.33 + 1.2) * 0.35;
        }
        var kd = 1 - Math.exp(-dt * 4.5);
        depthX += (tDepthX - depthX) * kd; depthY += (tDepthY - depthY) * kd;
      }
      draw();
      var moving = idle || intro || useDepth || 1 - lampUp > 0.004 || Math.abs(tLx - lx) + Math.abs(tLy - ly) > 0.0008 ||
        Math.abs(tScale - scale) > 0.001 || Math.abs(tCx - cx) + Math.abs(tCy - cy) > 0.0004 ||
        Math.abs(tEven - even) > 0.002;
      if (moving) wake();
    }

    function wake() {
      if (!frame && !dead) { if (!last) last = performance.now(); frame = requestAnimationFrame(loop); }
    }

    function resize() {
      var r = host.getBoundingClientRect();
      vw = Math.max(1, r.width); vh = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (img) { var c = clampCentre(tScale, tCx, tCy); tCx = c[0]; tCy = c[1]; draw(); wake(); }
    }

    function zoomAt(px, py, factor) {
      if (!o.zoom || !img) return;
      var next = Math.max(1, Math.min(12, tScale * factor));
      var f = fit(), w = f.w * tScale, h = f.h * tScale, nw = f.w * next, nh = f.h * next;
      // Keep the point under the cursor where it is.
      var ux = tCx + (px - vw / 2) / w, uy = tCy + (py - vh / 2) / h;
      var c = clampCentre(next, ux - (px - vw / 2) / nw, uy - (py - vh / 2) / nh);
      tScale = next; tCx = c[0]; tCy = c[1];
      wake();
      if (o.onZoom) o.onZoom(next);
    }

    function setLamp(px, py) {
      tLx = px / vw; tLy = py / vh;
      if (idle) idle = false;
      wake();
      if (o.onLight) o.onLight();
    }

    function local(e) {
      var r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }

    function down(e) {
      if (dead) return;
      canvas.setPointerCapture(e.pointerId);
      var p = local(e);
      pointers.set(e.pointerId, p);
      if (pointers.size === 2) {
        var a = Array.from(pointers.values());
        pinch = { d: Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]), x: (a[0][0] + a[1][0]) / 2, y: (a[0][1] + a[1][1]) / 2 };
      } else if (pointers.size === 1) {
        dragging = true;
        if (e.pointerType === "touch" && dragMode === "light") setLamp(p[0], p[1]);
      }
    }

    function move(e) {
      if (dead) return;
      var p = local(e);
      if (pointers.has(e.pointerId)) {
        var prev = pointers.get(e.pointerId);
        pointers.set(e.pointerId, p);
        if (pointers.size >= 2 && pinch) {
          var a = Array.from(pointers.values());
          var d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
          var mx = (a[0][0] + a[1][0]) / 2, my = (a[0][1] + a[1][1]) / 2;
          zoomAt(mx, my, d / pinch.d);
          panBy(mx - pinch.x, my - pinch.y);
          pinch = { d: d, x: mx, y: my };
          return;
        }
        var touch = e.pointerType === "touch";
        if (touch && dragMode === "light") setLamp(p[0], p[1]);
        else if (o.zoom) panBy(p[0] - prev[0], p[1] - prev[1]);
        if (!touch) setLamp(p[0], p[1]);
      } else if (e.pointerType === "mouse") {
        setLamp(p[0], p[1]);
      }
    }

    function panBy(dx, dy) {
      var f = fit(), c = clampCentre(tScale, tCx - dx / (f.w * tScale), tCy - dy / (f.h * tScale));
      tCx = c[0]; tCy = c[1];
      wake();
    }

    function up(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) dragging = false;
    }

    function leave(e) {
      if (e.pointerType === "mouse" && !dragging && !o.drift) {
        tLx = resting[0]; tLy = resting[1];
        wake();
      } else if (o.drift && !reduced && e.pointerType === "mouse") {
        idle = true; idleStart = performance.now() - 1000; wake();
      }
    }

    function wheel(e) {
      if (!o.zoom) return;
      e.preventDefault();
      var p = local(e), amount = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      zoomAt(p[0], p[1], Math.exp(-amount * 0.0016));
    }

    function dbl(e) {
      if (!o.zoom) return;
      var p = local(e);
      zoomAt(p[0], p[1], tScale > 1.2 ? 1 / tScale : 3);
    }

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("dblclick", dbl);
    var ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    return {
      element: canvas,
      setPainting: function (p) {
        // A photo opened straight from disk can't be read by WebGL; the caller falls back to a plain image.
        texture(gl, 0, p.color);
        texture(gl, 1, p.height);
        if (p.photo) o.relief = p.relief || 2.5;
        img = p;
        scale = tScale = 1; cx = tCx = 0.5; cy = tCy = 0.5;
        if (o.drift && !reduced) { idle = true; idleStart = performance.now() - 2000; }
        lx = tLx = resting[0]; ly = tLy = resting[1];
        lampUp = reduced ? 1 : 0.04; // the lamp comes up each time a painting is hung
        if (!o.cover && !reduced) { lx = -0.25; ly = 0.75; } // and rakes across it from the far side
        last = 0;
        resize();
        draw();
        wake();
      },
      setEven: function (on) { tEven = on ? 1 : 0; wake(); },
      // Start very close on the paint (scale s, centred on x, y of the painting, relief boosted by r)
      // and pull back to the whole painting over ms. Skipped for reduced motion.
      intro: function (s, x, y, ms, r) {
        if (reduced || !img) { if (o.onIntroEnd) o.onIntroEnd(); return; }
        intro = { s: s, x: x, y: y, ms: ms, r: r || 2, start: performance.now() };
        scale = tScale = s; cx = tCx = x; cy = tCy = y; reliefK = intro.r;
        wake();
      },
      // Tilt for the 3D depth, each from -1 to 1 (mouse position or phone tilt).
      setDepth: function (x, y) {
        if (!useDepth) return;
        tDepthX = Math.max(-1, Math.min(1, x)); tDepthY = Math.max(-1, Math.min(1, y));
        depthInput = performance.now();
        wake();
      },
      setDragMode: function (m) { dragMode = m; },
      zoomBy: function (f) { zoomAt(vw / 2, vh / 2, f); },
      reset: function () { zoomAt(vw / 2, vh / 2, 1 / tScale); },
      nudge: function (dx, dy) { panBy(dx, dy); },
      destroy: function () {
        dead = true;
        cancelAnimationFrame(frame);
        ro.disconnect();
        var lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
        canvas.remove();
      },
    };
  }

  return LitCanvas;
})();
