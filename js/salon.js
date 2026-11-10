/* The home page: an endless salon wall. Drag, scroll or use the arrow keys to
   wander it in any direction. Paintings hang on nails and swing as the wall
   moves, and the wall takes the colour of the painting in the middle. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mod(a, n) { return ((a % n) + n) % n; }
  function rand(seed) {
    // Small repeatable random numbers, so the wall hangs the same way every visit.
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Hang every painting in a tile that repeats forever. Real sizes stay in proportion. */
  function layout(works, phone) {
    var r = rand(7), unit = phone ? 2.1 : 3.1, gap = phone ? 54 : 84, label = 64;
    function size(w, dup) {
      var long = Math.max(w.w, w.h) * unit;
      var k = Math.min(1, (phone ? 220 : 320) / long) * Math.max(1, (phone ? 130 : 170) / long);
      return { work: w, dup: dup, w: Math.round(w.w * unit * k), h: Math.round(w.h * unit * k) };
    }
    var sized = works.map(function (w) { return size(w, false); });
    var colW = Math.max.apply(null, sized.map(function (s) { return s.w; })) + gap;
    // The tile must be wider than the screen, or the same arrangement shows twice side by side.
    var cols = Math.max(2, Math.round(Math.sqrt(works.length * (phone ? 0.55 : 1.15))), Math.ceil((innerWidth + 240) / colW));
    // With only a few paintings, hang them again in a different order to fill it.
    for (var round = 1; sized.length < cols * 3; round++) {
      var again = works.slice().sort(function () { return r() - 0.5; });
      if (again[0] === sized[sized.length - 1].work) again.push(again.shift());
      again.forEach(function (w) { if (sized.length < cols * 3) sized.push(size(w, true)); });
    }
    var columns = [];
    for (var c = 0; c < cols; c++) columns.push({ items: [], h: gap * (0.3 + r() * 1.4) });
    sized.forEach(function (s) {
      var col = columns.reduce(function (a, b) { return b.h < a.h ? b : a; });
      s.x = columns.indexOf(col) * colW + (colW - s.w) / 2 + (r() - 0.5) * gap * 0.5;
      s.y = col.h;
      col.h += s.h + label + gap * (0.7 + r() * 0.6);
      col.items.push(s);
    });
    var tileH = Math.max.apply(null, columns.map(function (c) { return c.h; }));
    // Spread each column's spare height between its paintings so the seams don't show.
    columns.forEach(function (col) {
      var spare = (tileH - col.h) / Math.max(1, col.items.length);
      col.items.forEach(function (s, i) { s.y += spare * (i + 0.5); });
    });
    return { items: sized, w: cols * colW, h: tileH };
  }

  function mount(root, o) {
    var works = o.works, phone = window.matchMedia("(max-width: 680px)").matches;
    var plan = layout(works, phone);
    var field = root.querySelector(".salon-field"), hero = root.querySelector(".salon-hero");
    var slots = [], copiesX = 0, copiesY = 0;
    var ox = -plan.w / 2 + innerWidth / 2, oy = -plan.h * 0.18, tx = ox, ty = oy;
    var vx = 0, vy = 0, lastVx = 0, mx = 0, my = 0, raf = 0, last = 0, travelled = 0;
    var swing = plan.items.map(function (s, i) {
      return { a: 0, v: 0, k: 0.012 + (i % 5) * 0.0016 };
    });
    var here = null, filter = null, arrived = false;

    function build() {
      var vw = innerWidth, vh = innerHeight, margin = 460;
      var cx = Math.ceil((vw + margin) / plan.w), cy = Math.ceil((vh + margin) / plan.h);
      if (cx === copiesX && cy === copiesY) return;
      copiesX = cx; copiesY = cy;
      field.innerHTML = "";
      slots = [];
      for (var j = 0; j < cy; j++) for (var i = 0; i < cx; i++) {
        plan.items.forEach(function (s, n) {
          var el = o.slot(s.work, s.w, s.h, i === 0 && j === 0 && !s.dup);
          el.style.setProperty("--d", (n % 7) * 70 + j * 90 + i * 60 + "ms");
          field.appendChild(el);
          slots.push({ el: el, swing: el.querySelector(".swing"), s: s, n: n, i: i, j: j });
        });
      }
      o.hydrate(field);
      applyFilter();
      place();
    }

    function place() {
      var W = copiesX * plan.w, H = copiesY * plan.h, edge = 230;
      var cxv = innerWidth / 2, cyv = innerHeight / 2, best = null, bestD = Infinity;
      slots.forEach(function (sl) {
        var x = mod(sl.s.x + sl.i * plan.w + ox + edge, W) - edge;
        var y = mod(sl.s.y + sl.j * plan.h + oy + edge, H) - edge;
        sl.x = x; sl.y = y;
        sl.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
        sl.swing.style.transform = "rotate(" + swing[sl.n].a.toFixed(2) + "deg)";
        var dx = x + sl.s.w / 2 - cxv, dy = y + sl.s.h / 2 - cyv, d = dx * dx + dy * dy;
        if (d < bestD && sl.s.work.series && !(filter && !filter(sl.s.work))) { bestD = d; best = sl.s.work; }
      });
      if (best && best !== here) {
        here = best;
        root.style.setProperty("--here", best.series.color || "#f18154");
        if (o.onHere) o.onHere(best);
      }
      if (hero) {
        // The name drifts slowly behind the paintings and comes round again.
        var hw = hero.offsetWidth + innerWidth * 0.5, hh = hero.offsetHeight + innerHeight * 0.6;
        var hx = mod((ox - (-plan.w / 2 + innerWidth / 2)) * 0.22 + innerWidth * 0.5 - hero.offsetWidth / 2 + hw, innerWidth + hw) - hw;
        var hy = mod((oy + plan.h * 0.18) * 0.22 + innerHeight * 0.42 - hero.offsetHeight / 2 + hh, innerHeight + hh) - hh;
        hero.style.transform = "translate3d(" + hx.toFixed(1) + "px," + hy.toFixed(1) + "px,0)";
      }
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      if (!dragging) {
        // Thrown: keep gliding and slow down.
        if (Math.abs(mx) + Math.abs(my) > 0.05) {
          tx += mx * dt; ty += my * dt;
          var f = Math.pow(0.94, dt);
          mx *= f; my *= f;
        } else mx = my = 0;
      }
      var k = reduced ? 1 : 1 - Math.pow(1 - 0.2, dt);
      var px = ox, py = oy;
      ox += (tx - ox) * k; oy += (ty - oy) * k;
      vx = (ox - px) / dt; vy = (oy - py) / dt;
      travelled += Math.abs(ox - px) + Math.abs(oy - py);
      if (travelled > 140) root.classList.add("moved");
      var ax = (vx - lastVx) / dt;
      lastVx = vx;
      var moving = Math.abs(tx - ox) + Math.abs(ty - oy) > 0.3 || Math.abs(mx) + Math.abs(my) > 0.05;
      if (!reduced) {
        swing.forEach(function (p) {
          // A picture on a nail: the wall speeds up, the bottom of the frame lags behind.
          p.v += (-p.k * p.a * 4 + ax * 0.22 - vx * 0.002) * dt;
          p.v *= Math.pow(0.9, dt);
          p.a = Math.max(-8, Math.min(8, p.a + p.v * dt));
          if (Math.abs(p.a) + Math.abs(p.v) > 0.02) moving = true;
          else p.a = p.v = 0;
        });
      }
      place();
      if (moving || dragging) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function wake() { if (!raf) raf = requestAnimationFrame(frame); }

    /* Dragging. The pointer is only captured once it really moves, so a click still opens a painting. */
    var dragging = false, down = null, dragged = false, history = [];
    function onDown(e) {
      // A press on the buttons below is never part of a drag: clear the last drag so its tap goes through.
      if (e.target.closest(".salon-ui")) { if (!down) dragged = false; return; }
      // A second finger mid-drag is ignored, so the wall never jumps to it.
      if (down || e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, id: e.pointerId };
      dragged = false;
      mx = my = 0;
      history = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
    }
    function onMove(e) {
      if (!down || e.pointerId !== down.id) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!dragged && dx * dx + dy * dy > 36) {
        dragged = true; dragging = true;
        root.classList.add("dragging");
        try { root.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (!dragged) return;
      tx = down.tx + dx; ty = down.ty + dy;
      if (reduced) { ox = tx; oy = ty; }
      history.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      if (history.length > 6) history.shift();
      wake();
    }
    function onUp(e) {
      if (!down || e.pointerId !== down.id) return;
      down = null;
      if (!dragged) return;
      dragging = false;
      root.classList.remove("dragging");
      var a = history[0], b = history[history.length - 1], span = Math.max(16, b.t - a.t);
      if (!reduced && e.timeStamp - b.t < 90) {
        mx = Math.max(-60, Math.min(60, ((b.x - a.x) / span) * 16.67));
        my = Math.max(-60, Math.min(60, ((b.y - a.y) / span) * 16.67));
      }
      wake();
    }
    function onClick(e) {
      // Only the click that ends a drag is swallowed (so dragging over a painting doesn't open it).
      if (dragged && !e.target.closest(".salon-ui")) { e.preventDefault(); e.stopPropagation(); }
      dragged = false;
    }
    function onWheel(e) {
      // Scrolling up and down moves the page. Sideways scrolling (or Shift) moves the wall.
      if (e.ctrlKey) return;
      if (!e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      var scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1;
      tx -= (e.deltaX || e.deltaY) * scale;
      if (reduced) { ox = tx; oy = ty; }
      wake();
    }
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return;
      if (scrollY > innerHeight * 0.5) return; // the wall is behind the page by now
      var step = e.shiftKey ? 520 : 260;
      // Up and down stay with the page, so the keyboard can scroll to the sections below.
      var d = { ArrowLeft: [step, 0], ArrowRight: [-step, 0] }[e.key];
      if (!d) return;
      e.preventDefault();
      tx += d[0]; ty += d[1];
      if (reduced) { ox = tx; oy = ty; }
      wake();
    }
    // Tabbing to a painting brings it to the middle of the screen.
    function onFocus(e) {
      var a = e.target.closest(".slot");
      if (!a) return;
      var sl = slots.filter(function (x) { return x.el === a; })[0];
      if (sl) glideTo(sl);
    }
    function glideTo(sl) {
      mx = my = 0;
      tx += innerWidth / 2 - (sl.x + sl.s.w / 2);
      ty += innerHeight / 2 - (sl.y + sl.s.h / 2);
      if (reduced) { ox = tx; oy = ty; }
      wake();
    }

    function shown(work) { return !work.series || !filter || filter(work); }
    function applyFilter() {
      slots.forEach(function (sl) { sl.el.classList.toggle("away", !shown(sl.s.work)); });
    }
    function nearest(test) {
      var cxv = innerWidth / 2, cyv = innerHeight / 2, best = null, bestD = Infinity;
      slots.forEach(function (sl) {
        if (!test(sl)) return;
        var dx = sl.x + sl.s.w / 2 - cxv, dy = sl.y + sl.s.h / 2 - cyv, d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = sl; }
      });
      return best;
    }
    function setFilter(test) {
      filter = test;
      applyFilter();
      if (!test) return;
      // Glide to the nearest painting that matches.
      var best = nearest(function (sl) { return sl.s.work.series && test(sl.s.work); });
      if (best) glideTo(best);
    }
    // Glide to a random painting somewhere else on the wall.
    function surprise() {
      var pool = plan.items.filter(function (s) { return s.work.series && s.work !== here && shown(s.work); });
      if (!pool.length) return;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      var best = nearest(function (sl) { return sl.s === pick; });
      if (best) glideTo(best);
    }

    function arrive() {
      if (arrived) return;
      arrived = true;
      root.classList.add("arriving");
      if (!reduced) {
        // Each painting is hung with a little push, and settles on its nail.
        swing.forEach(function (p, i) { p.a = (i % 2 ? 1 : -1) * (3 + (i % 4) * 1.2); p.v = 0; });
        wake();
      }
      setTimeout(function () { root.classList.remove("arriving"); }, 1800);
    }

    var resizeTimer = 0;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { build(); place(); }, 120);
    }

    build();
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("click", onClick, true);
    root.addEventListener("dragstart", function (e) { e.preventDefault(); });
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("focusin", onFocus);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return {
      arrive: arrive,
      setFilter: setFilter,
      surprise: surprise,
      current: function () { return here; }, // the painting nearest the middle of the screen
      destroy: function () {
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
      },
    };
  }

  window.Salon = { mount: mount };
})();
