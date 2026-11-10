/* Pages and navigation. All the words and paintings come from content.js. */
(function () {
  var SITE = window.SITE;
  var main = document.getElementById("main");
  var nav = document.getElementById("nav");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var viewer = null, cleanup = null, renderToken = 0;
  var instant = false, level = 0, entranceOpen = false, salon = null;
  var flight = null, currentKey = "", app = document.getElementById("app");
  var DEPTH = { wall: 0, series: 1, journal: 1, commissions: 1, about: 1, none: 1, work: 2 };

  /* Interface words in both languages. Everything else lives in content.js. */
  var UI = {
    en: {
      map: "Gallery", journal: "Journal", commissions: "Commissions", about: "Studio",
      wallTitle: "a wall of paintings", back: "Back to the gallery", sail: "Next room",
      all: "All", available: "Available", surprise: "Surprise me", openRoom: "Open the room",
      hintWall: "Swipe in any direction to look around. Tap ↓ for the studio and more.",
      hintWallMouse: "Drag to look around the wall. Scroll down for the studio, commissions and journal.",
      ringWord: "Choose", ringKicker: "Your pick", ringTitle: "Spin and choose",
      ringSub: "Turn the circle, tap a painting to bring it close, or press Spin and let one choose you.",
      ringSpin: "Spin", ringChosen: "This one chose you", ringPrev: "Previous painting", ringNext: "Next painting",
      c_sunset: "sunset", c_gold: "gold", c_rose: "rose", c_lavender: "lavender", c_sky: "sky", c_sea: "sea", c_meadow: "meadow", c_night: "night",
      moreBelow: "More below", fromJournal: "From the studio", readJournal: "Read the whole journal",
      meet: "Meet Ivelina", moreAbout: "More about the studio",
      share: "Share", linkCopied: "Link copied", moreFrom: "More from {s}", noPhoto: "Photo coming soon",
      availableAsk: "Available · ask for the price", onWall: "See it on your wall", inStudio: "Ivelina in her studio",
      cueMouse: "Scroll or click to enter", cueTouch: "Swipe up or tap to enter",
      tryWall: "Try it on your wall", enterRoom: "Try a painting on your wall", seePainting: "See this painting", choosePainting: "Choose a painting",
      talk: "Get in touch", contactLead: "Ask anything, or tell her about a painting you’d love her to make for you.",
      contactAbout: "What is it about?", topic_question: "A question", topic_idea: "A painting for me", topic_hello: "Just saying hello",
      ideaShow: "What should it show?", ideaShowHint: "Your dog on the beach, your village, a sunset you remember…",
      ideaSize: "Size you imagine", size_small: "Small (about 30 cm)", size_medium: "Medium (about 50 cm)", size_large: "Large (80 cm or more)", size_unsure: "Not sure yet",
      ideaMood: "Colours or mood", ideaMoodHint: "Warm and sunny, calm blues…", msgHint: "Write anything you like…",
      yourName: "Your name", yourReach: "How can she reach you?", yourReachHint: "Phone, email or Instagram",
      send: "Send", sending: "Sending…", sentThanks: "Sent! Ivelina will write back to you soon.",
      sendFailed: "It didn’t send. Check your connection and try again.", needMessage: "Write a few words first.", needReach: "Add how she can reach you.",
      byEmail: "Send by email", copyThenSend: "Here is your message. Copy it and send it to Ivelina:",
      roomTitle: "See it on your wall", roomLead: "Drag the painting where you’d hang it, and change its size.",
      roomPhoto: "Use a photo of your room", roomPrivate: "Your photo stays on your device.",
      roomSize: "Size", roomFrame: "Frame", frameNone: "None", frameBlack: "Black", frameGold: "Gold",
      roomSave: "Save picture", roomSaved: "Saved",
      look: "See it up close", soldTag: "Sold", ask: "Ask for the price",
      ideaTitle: "Your idea here", ideaText: "A painting made just for you, of anything you love.", ideaBtn: "Commission a painting",
      filters: "Show paintings",
      enquire: "Enquire about this painting", even: "Even gallery light", dragPic: "Drag moves the picture",
      person: "Beside a person", fit: "Fit to view", prev: "Previous", next: "Next", preparing: "Preparing the canvas",
      hintTouch: "Drag to move the light. Pinch to zoom.", hintMouse: "Move across the surface to rake the light. Scroll to zoom.",
      missing: "This painting's image could not be found.", scaleNote: "{s} beside a 170 cm figure", cm: "cm", sold: "(sold)",
      journalTitle: "Studio Journal", journalSub: "A logbook of what is happening in the studio.",
      start: "Start a conversation", studio: "The Studio", exhibitions: "Exhibitions", find: "Find me",
      offTitle: "An empty wall", offSub: "There is nothing hanging here.", enter: "Enter",
      draft: "Draft: titles, sizes and prices still to confirm", other: "BG", otherName: "Превключи на български",
      panelTitle: "Message Ivelina", panelLead: "Copy this message, then send it to her wherever suits you.",
      copy: "Copy message", copied: "Copied", close: "Close", shipping: "Shipping is paid by the receiver.",
      messageLabel: "Your message", noLinks: "Add her Instagram, TikTok and Facebook links in js/content.js.",
      msgWork: "Hello Ivelina! I'm interested in your painting “{t}”.", msgIdea: "Hello Ivelina! I have an idea for a commission: ",
    },
    bg: {
      map: "Галерия", journal: "Дневник", commissions: "Поръчки", about: "Ателие",
      wallTitle: "стена с картини", back: "Към галерията", sail: "Следваща зала",
      all: "Всички", available: "Налични", surprise: "Изненадай ме", openRoom: "Влез в залата",
      hintWall: "Плъзни във всяка посока, за да разгледаш. Натисни ↓ за ателието и още.",
      hintWallMouse: "Плъзни, за да разгледаш стената. Скролни надолу за ателието, поръчките и дневника.",
      ringWord: "Избери", ringKicker: "Твоят избор", ringTitle: "Завърти и избери",
      ringSub: "Завърти кръга, докосни картина, за да я доближиш, или натисни „Завърти“ и остави някоя да избере теб.",
      ringSpin: "Завърти", ringChosen: "Тази избра теб", ringPrev: "Предишна картина", ringNext: "Следваща картина",
      c_sunset: "залез", c_gold: "злато", c_rose: "роза", c_lavender: "лавандула", c_sky: "небе", c_sea: "море", c_meadow: "ливада", c_night: "нощ",
      moreBelow: "Още отдолу", fromJournal: "От ателието", readJournal: "Целият дневник",
      meet: "Запознай се с Ивелина", moreAbout: "Повече за ателието",
      share: "Сподели", linkCopied: "Връзката е копирана", moreFrom: "Още от „{s}“", noPhoto: "Снимката идва скоро",
      availableAsk: "Налична · попитай за цената", onWall: "Виж я на твоята стена", inStudio: "Ивелина в ателието си",
      cueMouse: "Превърти или кликни, за да влезеш", cueTouch: "Плъзни нагоре или докосни, за да влезеш",
      tryWall: "Пробвай на твоята стена", enterRoom: "Пробвай картина на твоята стена", seePainting: "Виж картината", choosePainting: "Избери картина",
      talk: "Свържи се", contactLead: "Попитай каквото искаш или ѝ разкажи за картина, която би искал да нарисува за теб.",
      contactAbout: "За какво става дума?", topic_question: "Въпрос", topic_idea: "Картина за мен", topic_hello: "Просто здравей",
      ideaShow: "Какво да изобразява?", ideaShowHint: "Кучето ти на плажа, родното ти село, залез, който помниш…",
      ideaSize: "Какъв размер си представяш", size_small: "Малка (около 30 см)", size_medium: "Средна (около 50 см)", size_large: "Голяма (80 см или повече)", size_unsure: "Още не знам",
      ideaMood: "Цветове или настроение", ideaMoodHint: "Топло и слънчево, спокойни сини…", msgHint: "Напиши каквото искаш…",
      yourName: "Твоето име", yourReach: "Как да се свърже с теб?", yourReachHint: "Телефон, имейл или Instagram",
      send: "Изпрати", sending: "Изпраща се…", sentThanks: "Изпратено! Ивелина скоро ще ти отговори.",
      sendFailed: "Не се изпрати. Провери връзката и опитай пак.", needMessage: "Първо напиши няколко думи.", needReach: "Добави как да се свърже с теб.",
      byEmail: "Изпрати по имейл", copyThenSend: "Ето съобщението ти. Копирай го и го изпрати на Ивелина:",
      roomTitle: "Виж я на твоята стена", roomLead: "Премести картината там, където би я окачил, и промени размера ѝ.",
      roomPhoto: "Снимка на твоята стая", roomPrivate: "Снимката остава на твоето устройство.",
      roomSize: "Размер", roomFrame: "Рамка", frameNone: "Без", frameBlack: "Черна", frameGold: "Златна",
      roomSave: "Запази снимката", roomSaved: "Запазено",
      look: "Виж отблизо", soldTag: "Продадена", ask: "Попитай за цената",
      ideaTitle: "Твоята идея тук", ideaText: "Картина, нарисувана само за теб, с каквото обичаш.", ideaBtn: "Поръчай картина",
      filters: "Покажи картини",
      enquire: "Попитай за тази картина", even: "Равномерна светлина", dragPic: "Плъзгането мести картината",
      person: "До човек", fit: "Побери в екрана", prev: "Предишна", next: "Следваща", preparing: "Подготвям платното",
      hintTouch: "Плъзни, за да местиш светлината. Щипни за увеличение.", hintMouse: "Движи мишката, за да местиш светлината. Скролни за увеличение.",
      missing: "Изображението на тази картина не е намерено.", scaleNote: "{s} до фигура от 170 см", cm: "см", sold: "(продадена)",
      journalTitle: "Дневник на ателието", journalSub: "Какво се случва в ателието.",
      start: "Започни разговор", studio: "Ателието", exhibitions: "Изложби", find: "Намери ме",
      offTitle: "Празна стена", offSub: "Тук не виси нищо.", enter: "Влез",
      draft: "Чернова: имената, размерите и цените предстоят", other: "EN", otherName: "Switch to English",
      panelTitle: "Пиши на Ивелина", panelLead: "Копирай съобщението и ѝ го изпрати там, където ти е удобно.",
      copy: "Копирай съобщението", copied: "Копирано", close: "Затвори", shipping: "Доставката се заплаща от получателя.",
      messageLabel: "Твоето съобщение", noLinks: "Добави връзките към Instagram, TikTok и Facebook в js/content.js.",
      msgWork: "Здравей, Ивелина! Интересувам се от картината „{t}“.", msgIdea: "Здравей, Ивелина! Имам идея за картина по поръчка: ",
    },
  };

  var LANG = "bg";
  try {
    var saved = localStorage.getItem("lang");
    LANG = saved === "en" || saved === "bg" ? saved : /^bg/i.test(navigator.language || "") ? "bg" : "en";
  } catch (e) {
    LANG = /^bg/i.test(navigator.language || "") ? "bg" : "en";
  }
  function t(key) { return UI[LANG][key]; }
  function tr(value) { return value && typeof value === "object" ? value[LANG] || value.en : value; }

  var allWorks = [];
  SITE.series.forEach(function (s) {
    s.works.forEach(function (w) { w.series = s; allWorks.push(w); });
  });
  function findWork(slug) { return allWorks.filter(function (w) { return w.slug === slug; })[0]; }
  function findSeries(slug) { return SITE.series.filter(function (s) { return s.slug === slug; })[0]; }

  function hue(s) { return esc(s.color || "#f18154"); }

  function mix(a, b, k) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    function ch(s) { return Math.round(((x >> s) & 255) * (1 - k) + ((y >> s) & 255) * k); }
    return "rgb(" + ch(16) + "," + ch(8) + "," + ch(0) + ")";
  }
  function hexMix(a, b, k) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    function ch(s) { return Math.round(((x >> s) & 255) * (1 - k) + ((y >> s) & 255) * k).toString(16).padStart(2, "0"); }
    return "#" + ch(16) + ch(8) + ch(0);
  }
  function paintsFor(tint) { return [tint, mix(tint, "#ffffff", 0.28), mix(tint, "#0f1318", 0.34)]; }

  /* A clicked painting lifts off the wall and travels to its place in the painting view. */
  function fly(w) {
    var from = flight;
    flight = null;
    var stage = document.getElementById("stage").getBoundingClientRect();
    var pad = Math.min(stage.width, stage.height) * 0.09;
    var a = w.w / w.h, aw = stage.width - pad * 2, ah = stage.height - pad * 2;
    var tw = aw / ah < a ? aw : ah * a, th = tw / a;
    var left = stage.left + (stage.width - tw) / 2, top = stage.top + (stage.height - th) / 2;
    var clone = new Image();
    clone.src = from.src;
    clone.alt = "";
    clone.className = "flying";
    clone.style.cssText = "left:" + left + "px;top:" + top + "px;width:" + tw + "px;height:" + th + "px";
    document.body.appendChild(clone);
    var sx = from.rect.width / tw, sy = from.rect.height / th;
    var dx = from.rect.left - left, dy = from.rect.top - top;
    var trip = clone.animate([
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")" },
      { transform: "none" },
    ], { duration: 560, easing: "cubic-bezier(.77,0,.175,1)", fill: "both" });
    return {
      land: function () {
        trip.finished.then(function () {
          return clone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease", fill: "forwards" }).finished;
        }).then(function () { clone.remove(); }, function () { clone.remove(); });
      },
      abort: function () { clone.remove(); },
    };
  }

  /* Paintings lean toward the pointer on the wall, with a sheen that follows it. */
  function tiltPaintings(root) {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    root.querySelectorAll(".art").forEach(function (art) {
      var sheen = art.querySelector(".sheen"), raf = 0, x = 0, y = 0, tx = 0, ty = 0;
      function step() {
        raf = 0;
        x += (tx - x) * 0.16; y += (ty - y) * 0.16;
        art.style.transform = "perspective(1100px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) scale(" + (1 + (Math.abs(tx) + Math.abs(ty) > 0 ? 0.018 : 0)) + ")";
        sheen.style.backgroundPosition = (50 - x * 50).toFixed(1) + "% " + (50 - y * 50).toFixed(1) + "%";
        if (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) raf = requestAnimationFrame(step);
      }
      art.addEventListener("pointermove", function (e) {
        var r = art.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        art.classList.add("tilting");
        if (!raf) raf = requestAnimationFrame(step);
      });
      art.addEventListener("pointerleave", function () {
        tx = ty = 0;
        art.classList.remove("tilting");
        if (!raf) raf = requestAnimationFrame(step);
      });
    });
  }

  /* A soft lamp follows the pointer through the rooms. */
  function roomLamp() {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var el = document.createElement("div"), x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    el.className = "room-lamp";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    function step() {
      raf = 0;
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(step);
    }
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      el.classList.add("on");
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }

  /* Paintings further down the wall settle into place as they arrive. */
  function hangOnScroll(root) {
    // Browsers with scroll-linked animation handle this in CSS, tied directly to the scrollbar.
    if (window.CSS && CSS.supports("animation-timeline: view()")) return;
    if (reduced || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.remove("waiting"); io.unobserve(i.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    root.querySelectorAll(".hang").forEach(function (h) {
      if (h.getBoundingClientRect().top > innerHeight * 0.9) { h.classList.add("waiting"); io.observe(h); }
    });
    var stop = cleanup;
    cleanup = function () { io.disconnect(); if (stop) stop(); };
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // Size, material and year are optional: a painting added before they are known shows none of them.
  // w and h are then only its proportions (cm: false), and nothing claims real centimetres.
  function size(w) { return w.cm === false ? "" : w.w + " × " + w.h + " " + t("cm"); }
  function mediumOf(w) { return w.medium ? tr(w.medium).toLowerCase() : ""; }
  function altFor(w) { return [tr(w.title), mediumOf(w), size(w)].filter(Boolean).join(", "); }
  function priceOf(w) {
    if (!w.price || w.status === "sold") return "";
    // "€12,500" in English, "12 500 €" in Bulgarian: separators make big prices readable.
    return new Intl.NumberFormat(LANG === "bg" ? "bg-BG" : "en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(w.price);
  }
  function label(w) {
    var facts = [size(w), mediumOf(w), w.year].filter(Boolean).map(esc).join(", ");
    var sold = w.status === "sold" ? '<span class="sold">' + t("sold") + "</span>" : "";
    var price = priceOf(w) ? esc(priceOf(w)) : w.status === "sold" ? "" : t("availableAsk");
    return (facts || sold ? '<p class="caption">' + facts + (facts && sold ? " " : "") + sold + "</p>" : "") +
      (price ? '<p class="price">' + price + "</p>" : "");
  }
  function channels() {
    var a = SITE.artist;
    return [["Instagram", a.instagram], ["TikTok", a.tiktok], ["Facebook", a.facebook]].filter(function (c) { return c[1]; });
  }

  function openEnquiry(work) { openContact(work ? { work: work, topic: "question" } : { topic: "idea" }); }

  /* "Get in touch": the visitor writes anything to Ivelina, or describes a painting they would
     love her to make for them. With a form address set in content.js the message is sent to her
     straight away; until then the site writes it out to copy into her email or social media. */
  function openContact(o) {
    o = o || {};
    var topic = o.topic || "question", contact = SITE.contact || {};
    var box = document.createElement("dialog");
    box.className = "enquiry contact";
    box.setAttribute("aria-labelledby", "contactTitle");
    var topics = ["question", "idea", "hello"].map(function (k) {
      return '<button class="chip" type="button" data-topic="' + k + '" aria-pressed="' + (k === topic) + '">' + t("topic_" + k) + "</button>";
    }).join("");
    var sizes = ["small", "medium", "large", "unsure"].map(function (k) {
      return '<button class="chip" type="button" data-size="' + k + '" aria-pressed="false">' + t("size_" + k) + "</button>";
    }).join("");
    var start = o.work ? t("msgWork").replace("{t}", tr(o.work.title)) + " " : "";
    box.innerHTML =
      '<form method="dialog" novalidate>' +
      '<h2 id="contactTitle">' + t("panelTitle") + "</h2><p>" + t("contactLead") + "</p>" +
      '<div class="contact-topics" role="group" aria-label="' + t("contactAbout") + '">' + topics + "</div>" +
      '<div class="contact-idea"' + (topic === "idea" ? "" : " hidden") + ">" +
      '<label for="cIdea">' + t("ideaShow") + '</label><textarea id="cIdea" rows="3" placeholder="' + t("ideaShowHint") + '"></textarea>' +
      '<p class="contact-label">' + t("ideaSize") + '</p><div class="contact-sizes" role="group" aria-label="' + t("ideaSize") + '">' + sizes + "</div>" +
      '<label for="cMood">' + t("ideaMood") + '</label><input id="cMood" type="text" placeholder="' + t("ideaMoodHint") + '" value="' + esc(o.mood || "") + '">' +
      "</div>" +
      '<label for="cMsg">' + t("messageLabel") + '</label><textarea id="cMsg" rows="4" placeholder="' + t("msgHint") + '">' + esc(start) + "</textarea>" +
      '<div class="contact-row"><div><label for="cName">' + t("yourName") + '</label><input id="cName" type="text" autocomplete="name"></div>' +
      '<div><label for="cReach">' + t("yourReach") + '</label><input id="cReach" type="text" autocomplete="email" placeholder="' + t("yourReachHint") + '"></div></div>' +
      '<p class="contact-error" id="cError" hidden></p>' +
      '<div class="contact-send"><button class="button" id="cSend" type="submit">' + t("send") + "</button>" +
      '<button class="panel-close" id="cClose" type="button">' + t("close") + "</button></div>" +
      '<div class="contact-after" id="cAfter" hidden></div>' +
      '<p class="panel-note">' + t("shipping") + "</p></form>";
    document.body.appendChild(box);

    var $ = function (s) { return box.querySelector(s); };
    var size = "";
    box.querySelectorAll("[data-topic]").forEach(function (b) {
      b.addEventListener("click", function () {
        topic = b.dataset.topic;
        box.querySelectorAll("[data-topic]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        $(".contact-idea").hidden = topic !== "idea";
      });
    });
    box.querySelectorAll("[data-size]").forEach(function (b) {
      b.addEventListener("click", function () {
        size = b.getAttribute("aria-pressed") === "true" ? "" : b.dataset.size;
        box.querySelectorAll("[data-size]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.size === size); });
      });
    });

    // Everything they wrote, as one readable message.
    function compose() {
      var lines = [], q = function (k) { return t(k).replace(/\?$/, ""); };
      lines.push(t("topic_" + topic));
      if (topic === "idea") {
        if ($("#cIdea").value.trim()) lines.push(q("ideaShow") + ": " + $("#cIdea").value.trim());
        if (size) lines.push(q("ideaSize") + ": " + t("size_" + size));
        if ($("#cMood").value.trim()) lines.push(q("ideaMood") + ": " + $("#cMood").value.trim());
      }
      if ($("#cMsg").value.trim()) lines.push("", $("#cMsg").value.trim());
      lines.push("", ($("#cName").value.trim() || "—") + " · " + ($("#cReach").value.trim() || "—"));
      if (o.work) lines.push(location.href);
      return lines.join("\n");
    }

    function after(html) {
      $(".contact-send").hidden = true;
      var a = $("#cAfter");
      a.innerHTML = html;
      a.hidden = false;
    }

    $("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("#cError");
      var said = $("#cMsg").value.trim() || (topic === "idea" && $("#cIdea").value.trim());
      if (!said) { err.textContent = t("needMessage"); err.hidden = false; $(topic === "idea" ? "#cIdea" : "#cMsg").focus(); return; }
      if (!$("#cReach").value.trim()) { err.textContent = t("needReach"); err.hidden = false; $("#cReach").focus(); return; }
      err.hidden = true;
      var text = compose();
      if (contact.formEndpoint) {
        var btn = $("#cSend");
        btn.disabled = true; btn.textContent = t("sending");
        fetch(contact.formEndpoint, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ topic: t("topic_" + topic), name: $("#cName").value, contact: $("#cReach").value, message: text, painting: o.work ? tr(o.work.title) : "" }),
        }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          after('<p class="contact-done">' + t("sentThanks") + "</p>");
        }).catch(function () {
          btn.disabled = false; btn.textContent = t("send");
          err.textContent = t("sendFailed"); err.hidden = false;
        });
        return;
      }
      // No form address yet: hand them the message to send where Ivelina will see it.
      var links = channels().map(function (c) {
        return '<a class="button ghost" href="' + esc(c[1]) + '" target="_blank" rel="noopener">' + esc(c[0]) + "</a>";
      }).join("");
      if (SITE.artist.email) {
        links = '<a class="button ghost" href="mailto:' + esc(SITE.artist.email) + "?subject=" + encodeURIComponent("IV Art: " + t("topic_" + topic)) + "&body=" + encodeURIComponent(text) + '">' + t("byEmail") + "</a>" + links;
      }
      after('<p>' + t("copyThenSend") + '</p><textarea id="cOut" rows="6" readonly>' + esc(text) + "</textarea>" +
        '<div class="panel-links"><button class="button" id="cCopy" type="button">' + t("copy") + "</button>" + links + "</div>" +
        (!links && SITE.draft ? '<p class="panel-note">' + t("noLinks") + "</p>" : ""));
      var copy = $("#cCopy"), out = $("#cOut");
      copy.addEventListener("click", function () {
        function done() { copy.textContent = t("copied"); }
        function select() { out.focus(); out.select(); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value).then(done, select);
        else select();
      });
    });

    $("#cClose").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
    box.addEventListener("close", function () { box.remove(); });
    box.showModal();
    (topic === "idea" ? $("#cIdea") : $("#cMsg")).focus();
  }

  /* "See it on your wall": a buyer places the painting on a photo of their own room
     (or on a plain wall), sizes it, picks a frame and can save the picture to share.
     The room photo never leaves their device. */
  function openRoom(w) {
    var box = document.createElement("dialog");
    box.className = "roomview";
    box.setAttribute("aria-labelledby", "roomTitle");
    box.innerHTML =
      '<div class="room-top"><div><h2 id="roomTitle">' + t("roomTitle") + "</h2><p>" + t("roomLead") + "</p></div>" +
      '<button class="panel-close" id="roomClose" type="button">' + t("close") + "</button></div>" +
      '<div class="room-stage" id="roomStage"><img class="room-bg" id="roomBg" alt="" hidden>' +
      '<div class="room-art frame-black" id="roomArt" style="background:' + Paint.tint(w) + '"><img id="roomImg" alt="' + esc(altFor(w)) + '" draggable="false"></div></div>' +
      // Every painting, to swap onto the wall and compare
      '<div class="room-now"><span id="roomNow"></span><a class="room-open" id="roomOpen" href="#work-' + w.slug + '">' + t("seePainting") + "</a></div>" +
      '<div class="room-picker" id="roomPicker" role="group" aria-label="' + t("choosePainting") + '">' +
      allWorks.filter(function (x) { return x.image; }).map(function (x) {
        return '<button type="button" class="pick" data-slug="' + esc(x.slug) + '" aria-pressed="' + (x === w) + '" aria-label="' + esc(tr(x.title)) + '" title="' + esc(tr(x.title)) + '"' +
          ' style="aspect-ratio:' + x.w + "/" + x.h + ";background:" + Paint.tint(x) + '"><img src="' + esc(x.thumb || x.image) + '" alt="" loading="lazy" draggable="false"></button>';
      }).join("") + "</div>" +
      '<div class="room-controls">' +
      '<label class="button ghost room-file">' + t("roomPhoto") + '<input id="roomFile" type="file" accept="image/*"></label>' +
      '<label class="room-size">' + t("roomSize") + ' <input id="roomRange" type="range" min="8" max="85" value="34"></label>' +
      '<div class="room-frames" role="group" aria-label="' + t("roomFrame") + '">' +
      ["none", "black", "gold"].map(function (f) {
        return '<button class="chip" type="button" data-frame="' + f + '" aria-pressed="' + (f === "black") + '">' + t("frame" + f.charAt(0).toUpperCase() + f.slice(1)) + "</button>";
      }).join("") + "</div>" +
      '<button class="button" id="roomSave" type="button">' + t("roomSave") + "</button></div>" +
      '<p class="panel-note">' + t("roomPrivate") + "</p>";
    document.body.appendChild(box);

    var stage = box.querySelector("#roomStage"), art = box.querySelector("#roomArt"), img = box.querySelector("#roomImg");
    var bg = box.querySelector("#roomBg"), range = box.querySelector("#roomRange"), saveBtn = box.querySelector("#roomSave");
    var cur = w, ratio = w.w / w.h, frame = "black", photoUrl = null;
    var pos = { x: 0.5, y: 0.4 }; // the painting's centre, as a share of the stage
    var picker = box.querySelector("#roomPicker"), nowEl = box.querySelector("#roomNow"), openEl = box.querySelector("#roomOpen");
    img.addEventListener("load", function () { img.classList.add("ready"); });

    // Put a painting on the wall. Swapping keeps it about the same height, in the same place.
    function setWork(nw, first) {
      var oldH = art.clientHeight;
      cur = nw; ratio = nw.w / nw.h;
      img.classList.remove("ready");
      img.alt = altFor(nw);
      art.style.background = Paint.tint(nw);
      img.src = nw.image || "";
      nowEl.textContent = tr(nw.title);
      openEl.href = "#work-" + nw.slug;
      picker.querySelectorAll(".pick").forEach(function (p) {
        var on = p.dataset.slug === nw.slug;
        p.setAttribute("aria-pressed", on);
        if (on) picker.scrollTo({ left: p.offsetLeft - (picker.clientWidth - p.offsetWidth) / 2, behavior: first || reduced ? "auto" : "smooth" });
      });
      if (!first && oldH) {
        range.value = Math.round(Math.max(8, Math.min(85, oldH * ratio / stage.clientWidth * 100)));
        place();
      }
    }
    picker.addEventListener("click", function (e) {
      var p = e.target.closest(".pick");
      if (p) setWork(findWork(p.dataset.slug));
    });
    openEl.addEventListener("click", function () { box.close(); });
    setWork(w, true);

    function place() {
      var sw = stage.clientWidth, sh = stage.clientHeight;
      var pw = sw * range.value / 100, ph = pw / ratio;
      if (ph > sh * 0.92) { ph = sh * 0.92; pw = ph * ratio; }
      pos.x = Math.min(1 - pw / 2 / sw, Math.max(pw / 2 / sw, pos.x));
      pos.y = Math.min(1 - ph / 2 / sh, Math.max(ph / 2 / sh, pos.y));
      art.style.width = pw + "px"; art.style.height = ph + "px";
      art.style.setProperty("--fw", Math.max(4, pw * 0.035).toFixed(1) + "px"); // frame width, as in the saved picture
      art.style.transform = "translate(" + (pos.x * sw - pw / 2) + "px," + (pos.y * sh - ph / 2) + "px)";
    }

    // Drag the painting around the wall. One pointer at a time.
    var drag = null;
    art.addEventListener("pointerdown", function (e) {
      if (drag) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
      art.setPointerCapture(e.pointerId);
      art.classList.add("lifted");
    });
    art.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      pos.x = drag.px + (e.clientX - drag.x) / stage.clientWidth;
      pos.y = drag.py + (e.clientY - drag.y) / stage.clientHeight;
      place();
    });
    function drop(e) { if (drag && e.pointerId === drag.id) { drag = null; art.classList.remove("lifted"); } }
    art.addEventListener("pointerup", drop);
    art.addEventListener("pointercancel", drop);
    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      range.value = Math.max(8, Math.min(85, +range.value - Math.sign(e.deltaY) * 2));
      place();
    }, { passive: false });
    range.addEventListener("input", place);

    box.querySelectorAll("[data-frame]").forEach(function (b) {
      b.addEventListener("click", function () {
        frame = b.dataset.frame;
        art.className = "room-art frame-" + frame;
        box.querySelectorAll("[data-frame]").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      });
    });

    // Their own room: the stage takes the photo's shape so the picture they save matches what they see.
    box.querySelector("#roomFile").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = URL.createObjectURL(file);
      bg.onload = function () {
        stage.style.setProperty("--r", (bg.naturalWidth / bg.naturalHeight).toFixed(4));
        stage.classList.add("has-photo");
        bg.hidden = false;
        requestAnimationFrame(place);
      };
      bg.src = photoUrl;
    });

    // Save the scene as a picture: the room (or plain wall), the painting, its frame and a soft shadow.
    saveBtn.addEventListener("click", function () {
      var sw = stage.clientWidth, sh = stage.clientHeight, k = Math.max(1, Math.min(3, 1600 / sw));
      var c = document.createElement("canvas"), x = c.getContext("2d");
      c.width = Math.round(sw * k); c.height = Math.round(sh * k);
      if (!bg.hidden) x.drawImage(bg, 0, 0, c.width, c.height);
      else {
        var g = x.createLinearGradient(0, 0, 0, c.height);
        g.addColorStop(0, "#ddd3c4"); g.addColorStop(0.74, "#cdc0ae"); g.addColorStop(0.74, "#7a5c43"); g.addColorStop(1, "#5e4532");
        x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
      }
      var r = art.getBoundingClientRect(), s = stage.getBoundingClientRect();
      var ax = (r.left - s.left) * k, ay = (r.top - s.top) * k, aw = r.width * k, ah = r.height * k;
      var fw = frame === "none" ? 0 : Math.max(4, aw * 0.035);
      x.save();
      x.shadowColor = "rgba(0,0,0,0.45)"; x.shadowBlur = 24 * k; x.shadowOffsetY = 10 * k;
      x.fillStyle = frame === "gold" ? "#b8923e" : "#1d1916";
      x.fillRect(ax - fw, ay - fw, aw + fw * 2, ah + fw * 2);
      x.restore();
      if (img.complete && img.naturalWidth) x.drawImage(img, ax, ay, aw, ah);
      c.toBlob(function (blob) {
        if (!blob) return;
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "IV-Art-" + cur.slug + "-on-my-wall.jpg";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        saveBtn.textContent = t("roomSaved");
        setTimeout(function () { saveBtn.textContent = t("roomSave"); }, 1800);
      }, "image/jpeg", 0.9);
    });

    function resized() { place(); }
    window.addEventListener("resize", resized);
    box.querySelector("#roomClose").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
    box.addEventListener("close", function () {
      window.removeEventListener("resize", resized);
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      box.remove();
    });
    box.showModal();
    // Start at a natural size: about half the wall's height, whatever the painting's shape.
    requestAnimationFrame(function () {
      var start = (stage.clientHeight * 0.5 * ratio) / stage.clientWidth * 100;
      range.value = Math.round(Math.max(12, Math.min(48, start)));
      place();
    });
  }

  /* Fill any image that asks for a painting. */
  function hydrate(root) {
    root.querySelectorAll("img[data-work]").forEach(function (img) {
      function missing() {
        // A photo that hasn't been added yet: say so, rather than showing an empty frame.
        var box = img.parentNode;
        if (img.classList.contains("art-glow") || !box) return;
        box.classList.add("no-photo");
        box.setAttribute("data-missing", t("noPhoto"));
      }
      Paint.url(findWork(img.dataset.work)).then(function (u) {
        img.addEventListener("load", function () { img.classList.add("ready"); }, { once: true });
        img.addEventListener("error", missing, { once: true });
        img.src = u;
      }, missing);
    });
  }

  /* One painting on the salon wall: a nail, a string, the frame, and a tag with its name. */
  function wallSlot(w, width, height, first) {
    var a = document.createElement("a");
    a.className = "slot" + (w.idea ? " idea" : "");
    a.href = w.idea ? "#commissions" : "#work-" + w.slug;
    a.draggable = false;
    a.style.width = width + "px";
    if (w.series) a.style.setProperty("--c", w.series.color || "#f18154");
    if (!first) { a.tabIndex = -1; a.setAttribute("aria-hidden", "true"); }
    var tag, face;
    if (w.idea) {
      face = '<span class="frame blank" style="height:' + height + 'px"><span class="idea-title">' + t("ideaTitle") + "</span>" +
        '<span class="idea-text">' + t("ideaText") + "</span></span>";
      tag = "<b>" + t("ideaBtn") + "</b><em>" + t("look") + "</em>";
    } else {
      // The wall shows only the painting and its name; the price is asked for on its own page.
      var price = w.status === "sold" ? '<em class="is-sold">' + t("soldTag") + "</em>" : "";
      face = '<span class="frame" style="height:' + height + "px;background:" + Paint.tint(w) + '">' +
        '<img class="art-glow" data-work="' + w.slug + '" alt="" draggable="false">' +
        '<img class="art-main" data-work="' + w.slug + '" alt="' + esc(altFor(w)) + '" draggable="false">' +
        '<span class="sheen" aria-hidden="true"></span><span class="peek">' + t("look") + "</span></span>";
      tag = '<b title="' + esc(tr(w.title)) + '">' + esc(tr(w.title)) + "</b>" + price;
    }
    a.innerHTML =
      '<span class="swing"><svg class="string" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="M3 30 50 2 97 30"/></svg>' +
      '<span class="nail" aria-hidden="true"></span>' + face + '<span class="tag">' + tag + "</span></span>";
    if (!w.idea) {
      a.addEventListener("click", function (e) {
        var im = a.querySelector(".art-main");
        if (reduced || !e.detail || !im.src || !im.complete || e.defaultPrevented) return;
        flight = { src: im.src, rect: im.getBoundingClientRect() };
      });
    }
    return a;
  }

  function wallPage() {
    var works = allWorks.slice();
    // A blank canvas hangs among the paintings, inviting a commission.
    works.splice(Math.min(works.length, 4), 0, { slug: "idea", idea: true, w: 60, h: 50 });
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    main.innerHTML =
      '<section class="salon" aria-label="' + esc(SITE.artist.name) + ": " + t("wallTitle") + '">' +
      '<h1 class="sr-only">' + esc(SITE.artist.name) + ": " + t("wallTitle") + "</h1>" +
      '<div class="salon-hero" aria-hidden="true"><span class="hero-name">' + esc(SITE.artist.name) + '</span><span class="hero-sub">' + esc(tr(SITE.artist.medium)) + "</span></div>" +
      '<div class="salon-field"></div><div class="salon-dim" aria-hidden="true"></div>' +
      '<div class="salon-ui">' +
      '<p class="salon-hint"><span class="hand" aria-hidden="true"></span>' + (fine ? t("hintWallMouse") : t("hintWall")) + "</p>" +
      '<div class="salon-bar"><div class="bar-actions"><button class="tryroom" type="button" id="tryRoomBtn" aria-label="' + t("tryWall") + '"><span class="frame-icon" aria-hidden="true"></span><span class="label">' + t("tryWall") + '</span><span class="new-dot" aria-hidden="true"></span></button>' +
      '<button class="talk" type="button" id="talkBtn"><span class="bubble" aria-hidden="true"></span>' + t("talk") + "</button>" +
      '<button class="surprise" type="button" id="surpriseBtn" aria-label="' + t("surprise") + '"><span class="die" aria-hidden="true"></span><span class="label">' + t("surprise") + "</span></button>" +
      '<button class="down" type="button" id="downBtn" aria-label="' + t("moreBelow") + '" title="' + t("moreBelow") + '"><span aria-hidden="true"></span></button></div></div>' +
      "</div></section>" + homeMore();
    var root = main.querySelector(".salon");
    var more = main.querySelector(".home-more");
    hydrate(more);
    var startBtn = document.getElementById("homeStart");
    if (startBtn) startBtn.addEventListener("click", function () { openEnquiry(null); });
    document.getElementById("downBtn").addEventListener("click", function () {
      // window.scrollTo rather than scrollIntoView, which can scroll the page that embeds this one.
      window.scrollTo({ top: more.getBoundingClientRect().top + scrollY, behavior: reduced ? "auto" : "smooth" });
    });
    var stopReveal = reveal(more), stopScroll = scrollScene(root, more), stopColour = ringPlay(more);
    salon = Salon.mount(root, { works: works, slot: wallSlot, hydrate: hydrate });
    document.getElementById("surpriseBtn").addEventListener("click", function () { salon.surprise(); });
    document.getElementById("talkBtn").addEventListener("click", function () { openContact({ topic: "question" }); });
    // "Try it on your wall" starts with the painting in the middle of the screen.
    document.getElementById("tryRoomBtn").addEventListener("click", function () {
      var w = salon && salon.current();
      if (!w || !w.image) w = allWorks.filter(function (x) { return x.image; })[0];
      if (w) openRoom(w);
    });
    if (!entranceOpen) salon.arrive();
    cleanup = function () { stopReveal(); stopScroll(); stopColour(); if (salon) salon.destroy(); salon = null; };
    return SITE.artist.name + ", " + tr(SITE.artist.medium);
  }

  /* Below the wall: the studio, a spinning circle of paintings, commissions and the journal, which rise over it as you scroll. */
  function homeMore() {
    var c = SITE.commissions, a = SITE.artist;
    function head(kicker, title, sub) {
      return '<header class="more-head reveal"><p class="kicker">' + kicker + "</p><h2>" + title + "</h2>" + (sub ? "<p>" + sub + "</p>" : "") + "</header>";
    }
    function word(w) { return '<span class="more-word" aria-hidden="true">' + w + "</span>"; }
    var entries = journalItems(SITE.journal.slice(0, 3)).replace(/<article class="entry/g, '<article class="reveal entry');
    var steps = c.steps.map(function (s) { return '<li class="reveal"><h3>' + esc(tr(s[0])) + "</h3><p>" + esc(tr(s[1])) + "</p></li>"; }).join("");
    var links = channels().map(function (ch) { return '<a href="' + esc(ch[1]) + '" target="_blank" rel="noopener">' + esc(ch[0]) + "</a>"; }).join(" · ");
    var ring = ringWorks().map(function (w, i) {
      return '<a class="ring-item" href="#work-' + w.slug + '" data-i="' + i + '" draggable="false" tabindex="-1">' +
        '<img src="' + esc(w.thumb) + '" alt="' + esc(tr(w.title)) + '" draggable="false" loading="lazy"></a>';
    }).join("");
    return (
      '<div class="home-more">' +
      '<section class="more" id="more-studio" style="--c:#ee9caf">' + word(t("about")) +
      head(t("studio"), t("meet"), "") +
      '<div class="studio-grid">' + portrait("reveal") + "<div>" +
      '<div class="prose more-prose">' + SITE.statement.map(function (p) { return '<p class="reveal">' + esc(tr(p)) + "</p>"; }).join("") + "</div>" +
      '<p class="more-contact reveal">' + esc(tr(a.location)) + (links ? "<br>" + links : "") + "</p>" +
      '<a class="more-link reveal" href="#about">' + t("moreAbout") + "</a></div></div></section>" +
      '<section class="more ring-sec" id="more-ring" style="--c:#d9d3c7">' + word(t("ringWord")) +
      head(t("ringKicker"), t("ringTitle"), t("ringSub")) +
      '<div class="ring-stage reveal" id="ringStage" role="group" aria-roledescription="carousel" aria-label="' + t("ringTitle") + '">' +
      '<div class="ring" id="ring">' + ring + "</div></div>" +
      '<div class="ring-bar reveal"><button class="ring-arrow" id="ringPrev" type="button" aria-label="' + t("ringPrev") + '"><span aria-hidden="true">‹</span></button>' +
      '<p class="ring-caption" id="ringCaption" aria-live="polite"></p>' +
      '<button class="ring-arrow" id="ringNext" type="button" aria-label="' + t("ringNext") + '"><span aria-hidden="true">›</span></button></div>' +
      '<div class="ring-actions reveal"><button class="button ring-spin" id="ringSpin" type="button"><span class="spin-icon" aria-hidden="true">↻</span>' + t("ringSpin") + "</button>" +
      '<a class="more-link" id="ringOpen" href="#">' + t("seePainting") + "</a></div></section>" +
      '<section class="more" id="more-commissions" style="--c:#dcaf61">' + word(t("commissions")) +
      head(t("commissions"), esc(tr(c.title)), esc(tr(c.intro))) +
      '<ol class="steps more-steps">' + steps + "</ol>" +
      '<button class="button reveal" id="homeStart" type="button">' + t("start") + "</button></section>" +
      '<section class="more" id="more-journal" style="--c:#7fbef3">' + word(t("journal")) +
      head(t("fromJournal"), t("journalTitle"), t("journalSub")) +
      '<div class="more-entries">' + entries + "</div>" +
      '<a class="more-link reveal" href="#journal">' + t("readJournal") + "</a></section>" +
      "</div>"
    );
  }

  /* "Spin and choose": a dozen of her paintings hang on a slowly turning circle, like a carousel
     in a gallery. Drag or swipe to turn it, tap a painting to bring it to the front, tap the front
     one to open it, or press Spin and let the circle choose. */
  var ringList = [];
  function ringWorks() {
    // Taken in turn from each series, at random within it, so the circle shows her whole range.
    var pools = SITE.series.map(function (s) { return s.works.filter(function (w) { return w.thumb; }); })
      .map(function (p) { return p.slice(); });
    var out = [], i = 0;
    while (out.length < 12 && pools.some(function (p) { return p.length; })) {
      var p = pools[i++ % pools.length];
      if (p.length) out.push(p.splice(Math.floor(Math.random() * p.length), 1)[0]);
    }
    ringList = out;
    return out;
  }
  function ringPlay(root) {
    var sec = root.querySelector("#more-ring");
    if (!sec || !ringList.length) return function () {};
    var stage = sec.querySelector("#ringStage"), ring = sec.querySelector("#ring");
    var items = [].slice.call(ring.children), n = items.length, step = 360 / n;
    var caption = sec.querySelector("#ringCaption"), open = sec.querySelector("#ringOpen");
    var angle = 0, vel = 0, target = null, drag = null, dragged = false, spinning = false, chosen = false;
    var raf = 0, visible = false, idleUntil = 0, front = -1, radius = 0, perPx = 0.1;
    var AUTO = reduced ? 0 : -0.045; // degrees per frame while nobody is touching it

    function norm(a) { a %= 360; return a < 0 ? a + 360 : a; }
    function rel(i) { var r = norm(i * step + angle); return r > 180 ? r - 360 : r; } // 0 = facing you
    function layout() {
      var w = items[0].offsetWidth || 240;
      radius = Math.round((w / 2 + w * 0.12) / Math.tan(Math.PI / n));
      perPx = step / (w * 1.15); // dragging one painting's width turns the circle by one painting
      items.forEach(function (it, i) { it.style.transform = "rotateY(" + (i * step) + "deg) translateZ(" + radius + "px)"; });
      paint();
    }
    function show() {
      var w = ringList[front];
      caption.innerHTML = (chosen ? '<span class="ring-chosen">' + t("ringChosen") + "</span>" : "") +
        "<b>" + esc(tr(w.title)) + "</b><span>" + esc(tr(w.series.name)) + "</span>";
      open.href = "#work-" + w.slug;
    }
    function paint() {
      ring.style.transform = "translateZ(" + -radius + "px) rotateY(" + angle.toFixed(3) + "deg)";
      items.forEach(function (it, i) {
        var k = Math.cos(rel(i) * Math.PI / 180); // 1 at the front, 0 at the sides
        it.style.opacity = k <= 0.05 ? "0" : (0.18 + 0.82 * k * k * k).toFixed(3);
      });
      var f = Math.round(norm(-angle) / step) % n;
      if (f !== front) {
        front = f; chosen = false;
        items.forEach(function (it, i) {
          it.classList.toggle("front", i === f);
          it.tabIndex = i === f ? 0 : -1;
          it.setAttribute("aria-hidden", i === f ? "false" : "true");
        });
        show();
      }
    }
    function goTo(a) { target = a; kick(); }
    function snap() { goTo(Math.round(angle / step) * step); }
    function tick() {
      raf = 0;
      var now = performance.now();
      if (drag) {
        // the pointer sets the angle
      } else if (target != null) {
        var d = target - angle;
        angle += reduced ? d : d * 0.11;
        if (Math.abs(d) < 0.04) {
          angle = target; target = null;
          idleUntil = now + (spinning ? 5000 : 2600);
          if (spinning) { spinning = false; paint(); chosen = true; show(); }
        }
      } else if (Math.abs(vel) > 0.12) {
        angle += vel; vel *= spinning ? 0.982 : 0.95;
        if (Math.abs(vel) <= 0.12) snap();
      } else if (now > idleUntil) {
        angle += AUTO;
      }
      paint();
      if (visible && (AUTO || drag || target != null || Math.abs(vel) > 0.12)) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(tick); }

    // Drag or swipe sideways to turn it. Vertical swipes still scroll the page.
    stage.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      drag = { x: e.clientX, y: e.clientY, a: angle, last: e.clientX, t: performance.now(), v: 0, moved: false, id: e.pointerId };
      dragged = false;
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
        drag.moved = true; target = null; vel = 0; spinning = false;
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        stage.classList.add("dragging");
      }
      var now = performance.now();
      drag.v = drag.v * 0.6 + ((e.clientX - drag.last) / Math.max(1, now - drag.t)) * 0.4;
      drag.last = e.clientX; drag.t = now;
      angle = drag.a + dx * perPx;
      kick();
    });
    function release() {
      if (!drag) return;
      if (drag.moved) {
        dragged = true;
        vel = Math.max(-14, Math.min(14, drag.v * 16 * perPx)); // px/ms into degrees per frame
        if (Math.abs(vel) <= 0.12) snap();
        idleUntil = performance.now() + 2600;
        kick();
      }
      drag = null;
      stage.classList.remove("dragging");
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
    // A tap on a side painting brings it forward; a tap on the front one opens it.
    ring.addEventListener("click", function (e) {
      var it = e.target.closest(".ring-item");
      if (!it) return;
      if (dragged) { e.preventDefault(); dragged = false; return; }
      var i = +it.dataset.i;
      if (i !== front) { e.preventDefault(); spinning = false; goTo(angle - rel(i)); }
    });
    function nudge(dir) {
      spinning = false; vel = 0;
      var base = target != null ? target : Math.round(angle / step) * step;
      goTo(base - dir * step);
    }
    sec.querySelector("#ringPrev").addEventListener("click", function () { nudge(-1); });
    sec.querySelector("#ringNext").addEventListener("click", function () { nudge(1); });
    sec.querySelector("#ringSpin").addEventListener("click", function () {
      target = null; spinning = true;
      if (reduced) { goTo(Math.round(angle / step) * step - (1 + Math.floor(Math.random() * (n - 1))) * step); return; }
      vel = -(13 + Math.random() * 9); // two to three turns, then it slows and settles on one
      kick();
    });

    layout();
    window.addEventListener("resize", layout);
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (list) {
      visible = list[0].isIntersecting;
      if (visible) kick();
    }) : null;
    if (io) io.observe(stage); else { visible = true; kick(); }
    return function () {
      visible = false; cancelAnimationFrame(raf);
      if (io) io.disconnect();
      window.removeEventListener("resize", layout);
    };
  }

  /* Things below the wall arrive as they come into view. */
  function reveal(root) {
    var items = root.querySelectorAll(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return function () {};
    }
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add("in"); io.unobserve(i.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    return function () { io.disconnect(); };
  }

  /* As the page scrolls, the wall steps back and dims, and each section's big word drifts past. */
  function scrollScene(wall, more) {
    // Transforms and opacity are set on each element directly. A CSS variable on the wall
    // would make the browser restyle every painting on every scroll frame.
    var sections = more.querySelectorAll(".more"), raf = 0;
    var dim = wall.querySelector(".salon-dim"), ui = wall.querySelector(".salon-ui");
    function update() {
      raf = 0;
      var h = innerHeight, p = Math.max(0, Math.min(1, scrollY / h));
      if (!reduced) wall.style.transform = p ? "scale(" + (1 - p * 0.1).toFixed(4) + ")" : "";
      dim.style.opacity = (p * 0.75).toFixed(3);
      ui.style.opacity = Math.max(0, 1 - p * 2.5).toFixed(3);
      ui.style.visibility = p > 0.4 ? "hidden" : "";
      wall.classList.toggle("behind", p > 0.02);
      if (reduced) return;
      sections.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.bottom < -h || r.top > h * 2) return;
        var q = Math.max(0, Math.min(1, (h - r.top) / (h + r.height)));
        s.firstChild.style.transform = "translate3d(" + (35 - q * 70).toFixed(2) + "vw,0,0)";
      });
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }

  function seriesPage(s) {
    var maxW = Math.max.apply(null, s.works.map(function (w) { return w.w; }));
    var maxH = Math.max.apply(null, s.works.map(function (w) { return w.h; }));
    var i = SITE.series.indexOf(s), next = SITE.series[(i + 1) % SITE.series.length];
    var hung = s.works.map(function (w) {
      return (
        '<article class="hang">' +
        '<a class="art" href="#work-' + w.slug + '" style="--w:' + w.w + ";--h:" + w.h + ";background:" + Paint.tint(w) + '">' +
        '<img class="art-glow" data-work="' + w.slug + '" alt="" aria-hidden="true">' +
        '<img class="art-main" data-work="' + w.slug + '" alt="' + esc(altFor(w)) + '"><span class="sheen" aria-hidden="true"></span></a>' +
        '<div class="wall-label"><h2><a href="#work-' + w.slug + '">' + esc(tr(w.title)) + "</a></h2>" + label(w) + "</div>" +
        "</article>"
      );
    }).join("");
    main.innerHTML =
      '<section class="room" data-name="' + esc(tr(s.name)) + '" style="--c:' + hue(s) + ";--maxw:" + maxW + ";--maxh:" + maxH + '">' +
      '<header class="room-head"><a class="back" href="#">' + t("back") + "</a><h1>" + esc(tr(s.name)) + "</h1><p>" + esc(tr(s.note)) + "</p></header>" +
      '<div class="wall">' + hung + "</div>" +
      '<a class="onward" href="#series-' + next.slug + '"><span>' + t("sail") + "</span>" + esc(tr(next.name)) + "</a>" +
      "</section>";
    hydrate(main);
    hangOnScroll(main);
    tiltPaintings(main);
    main.querySelectorAll(".art").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var im = a.querySelector(".art-main");
        if (reduced || !e.detail || !im.src || !im.complete) return;
        a.style.transform = "none"; // measure the painting flat, without its hover tilt
        flight = { src: im.src, rect: a.getBoundingClientRect() };
      });
    });
    return tr(s.name) + ", " + SITE.artist.name;
  }

  function workPage(w) {
    var list = w.series.works, i = list.indexOf(w);
    var prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
    var coarse = window.matchMedia("(pointer: coarse)").matches;
    var enquire = '<div class="placard-actions">' +
      (w.status === "sold" ? "" : '<button class="button" id="enquireBtn" type="button">' + t("enquire") + "</button>") +
      '<button class="button ghost" id="shareBtn" type="button">' + t("share") + "</button>" +
      (w.image ? '<button class="button ghost" id="roomBtn" type="button">' + t("onWall") + "</button>" : "") + "</div>";
    var others = list.filter(function (x) { return x !== w; });
    var siblings = others.length
      ? '<nav class="siblings" aria-label="' + esc(t("moreFrom").replace("{s}", tr(w.series.name))) + '"><h2 class="sub">' + esc(t("moreFrom").replace("{s}", tr(w.series.name))) + '</h2><div class="sib-row">' +
        others.map(function (x) {
          return '<a class="sib" href="#work-' + x.slug + '" style="background:' + Paint.tint(x) + ";aspect-ratio:" + x.w + "/" + x.h + '"><img data-work="' + x.slug + '" alt="' + esc(tr(x.title)) + '"></a>';
        }).join("") + "</div></nav>"
      : "";
    main.innerHTML =
      '<section class="work" style="--c:' + hue(w.series) + '">' +
      '<div class="stage" id="stage" role="img" aria-label="' + esc(altFor(w)) + '">' +
      '<div class="stage-canvas" id="stageCanvas"></div>' +
      '<div class="scale-view" id="scaleView" hidden></div>' +
      '<p class="hint" id="hint" aria-live="polite">' + t("preparing") + "</p>" +
      "</div>" +
      '<aside class="placard">' +
      '<a class="back" href="#series-' + w.series.slug + '">' + esc(tr(w.series.name)) + "</a>" +
      // Long titles get a smaller size, and the buttons come before the story so they're always in view.
      "<h1" + (tr(w.title).length > 26 ? ' class="long"' : "") + ">" + esc(tr(w.title)) + "</h1>" + label(w) + enquire +
      (w.story ? "<p class=\"story\">" + esc(tr(w.story)) + "</p>" : "") + siblings +
      '<div class="tools" id="tools">' +
      '<button class="tool" id="evenBtn" aria-pressed="false">' + t("even") + "</button>" +
      (coarse ? '<button class="tool" id="dragBtn" aria-pressed="false">' + t("dragPic") + "</button>" : "") +
      (w.cm === false ? "" : '<button class="tool" id="scaleBtn" aria-pressed="false">' + t("person") + "</button>") +
      '<button class="tool" id="fitBtn" hidden>' + t("fit") + "</button>" +
      "</div>" +
      '<nav class="pager" aria-label="' + esc(tr(w.series.name)) + '">' +
      '<a href="#work-' + prev.slug + '" rel="prev">' + t("prev") + '</a><a href="#work-' + next.slug + '" rel="next">' + t("next") + "</a></nav>" +
      "</aside></section>";
    var enquireBtn = document.getElementById("enquireBtn");
    if (enquireBtn) enquireBtn.addEventListener("click", function () { openEnquiry(w); });
    var roomBtn = document.getElementById("roomBtn");
    if (roomBtn) roomBtn.addEventListener("click", function () { openRoom(w); });
    var shareBtn = document.getElementById("shareBtn");
    shareBtn.addEventListener("click", function () {
      var data = { title: tr(w.title) + " · " + SITE.artist.name, text: tr(w.title) + ", " + tr(SITE.artist.medium), url: location.href };
      function copied() {
        shareBtn.textContent = t("linkCopied");
        setTimeout(function () { shareBtn.textContent = t("share"); }, 1800);
      }
      // Phones open their own share sheet (Instagram, Viber, Messenger...). Elsewhere the link is copied.
      if (navigator.share) navigator.share(data).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(copied, function () {});
    });
    hydrate(main.querySelector(".placard"));

    var token = renderToken, host = document.getElementById("stageCanvas"), hint = document.getElementById("hint");
    var trip = flight ? fly(w) : null;
    var tools = document.getElementById("tools"), fitBtn = document.getElementById("fitBtn");
    var hinted = false;

    function fallback(painting) {
      // No WebGL, or a photo opened from disk: show a plain, well-hung image instead.
      if (viewer) { viewer.destroy(); viewer = null; }
      tools.querySelectorAll("#evenBtn,#dragBtn,#fitBtn").forEach(function (b) { b.remove(); });
      hint.textContent = "";
      var img = new Image();
      img.alt = altFor(w); img.className = "plain ready";
      Paint.url(w).then(function (u) { img.src = u; });
      host.appendChild(img);
    }

    try {
      viewer = new LitCanvas(host, {
        // A near-neutral wall behind the painting (a strongly tinted wall shifts its colours).
        tint: hexMix("#c4c8ce", w.series.color || "#c4c8ce", 0.2),
        onLight: function () {
          if (hinted) return;
          hinted = true;
          hint.classList.add("gone");
        },
        onZoom: function (s) { fitBtn.hidden = s <= 1.01; },
      });
    } catch (e) { viewer = null; }

    Paint.get(w, 1900).then(function (p) {
      if (token !== renderToken) return;
      if (trip) { trip.land(); trip = null; }
      if (!viewer) return fallback(p);
      try {
        viewer.setPainting(Object.assign({}, p, { relief: w.relief }));
        hint.textContent = coarse ? t("hintTouch") : t("hintMouse");
      } catch (e) { fallback(p); }
    }).catch(function () { hint.textContent = t("missing"); });

    var evenBtn = document.getElementById("evenBtn"), dragBtn = document.getElementById("dragBtn");
    var scaleBtn = document.getElementById("scaleBtn"), scaleView = document.getElementById("scaleView");
    evenBtn && evenBtn.addEventListener("click", function () {
      var on = evenBtn.getAttribute("aria-pressed") !== "true";
      evenBtn.setAttribute("aria-pressed", on);
      if (viewer) viewer.setEven(on);
    });
    dragBtn && dragBtn.addEventListener("click", function () {
      var on = dragBtn.getAttribute("aria-pressed") !== "true";
      dragBtn.setAttribute("aria-pressed", on);
      if (viewer) viewer.setDragMode(on ? "pan" : "light");
    });
    fitBtn.addEventListener("click", function () { if (viewer) viewer.reset(); });

    function layoutScale() {
      var st = document.getElementById("stage").getBoundingClientRect();
      var person = 170, gap = 34, hangCentre = 150;
      var bottom = Math.max(30, hangCentre - w.h / 2), top = bottom + w.h;
      var room = Math.max(top + 12, 205), wide = w.w + gap + 62;
      var px = Math.min((st.height * 0.84) / room, (st.width * 0.86) / wide);
      var left = (st.width - wide * px) / 2, floor = st.height * 0.92;
      scaleView.innerHTML =
        '<div class="floor" style="top:' + floor + 'px"></div>' +
        '<svg class="person" viewBox="0 0 62 170" aria-hidden="true" style="left:' + left + "px;top:" + (floor - person * px) + "px;height:" + person * px + 'px"><circle cx="31" cy="11" r="10.5"/><path d="M31 24c-10 0-17 4-18 13L9 82c0 3 5 4 6 1l5-36 2 41-3 79c0 4 9 4 10 0l2-69 2 69c1 4 10 4 10 0l-3-79 2-41 5 36c1 3 6 2 6-1l-4-45C48 28 41 24 31 24z"/></svg>' +
        '<img class="scaled" alt="" data-work="' + w.slug + '" style="background:' + Paint.tint(w) + ";left:" + (left + (62 + gap) * px) + "px;top:" + (floor - top * px) + "px;width:" + w.w * px + "px;height:" + w.h * px + 'px">' +
        '<p class="scale-note">' + esc(t("scaleNote").replace("{s}", size(w))) + "</p>";
      hydrate(scaleView);
    }
    if (scaleBtn) scaleBtn.addEventListener("click", function () {
      var on = scaleBtn.getAttribute("aria-pressed") !== "true";
      scaleBtn.setAttribute("aria-pressed", on);
      scaleView.hidden = !on;
      hint.hidden = on;
      if (on) layoutScale();
    });

    function keys(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector("dialog[open]")) return;
      instant = e.key === "Escape" || (!e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight"));
      if (e.key === "Escape") location.hash = "#series-" + w.series.slug;
      else if (e.shiftKey && viewer && /^Arrow/.test(e.key)) {
        var step = 80;
        viewer.nudge(e.key === "ArrowLeft" ? step : e.key === "ArrowRight" ? -step : 0, e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0);
      }
      else if (e.key === "ArrowLeft") location.hash = "#work-" + prev.slug;
      else if (e.key === "ArrowRight") location.hash = "#work-" + next.slug;
      else if (viewer && (e.key === "+" || e.key === "=")) viewer.zoomBy(1.4);
      else if (viewer && e.key === "-") viewer.zoomBy(1 / 1.4);
      else if (viewer && e.key === "0") viewer.reset();
    }
    function resized() { if (!scaleView.hidden) layoutScale(); }
    window.addEventListener("keydown", keys);
    window.addEventListener("resize", resized);
    cleanup = function () {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("resize", resized);
      if (trip) trip.abort();
    };
    return tr(w.title) + ", " + SITE.artist.name;
  }

  function journalItems(list) {
    var fmt = new Intl.DateTimeFormat(LANG === "bg" ? "bg-BG" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    return list.map(function (j) {
      var w = j.work ? findWork(j.work) : null;
      return (
        '<article class="entry' + (w ? " has-art" : "") + '"' + (w ? ' style="--c:' + hue(w.series) + '"' : "") + ">" +
        '<time datetime="' + esc(j.date) + '">' + fmt.format(new Date(j.date + "T00:00:00Z")) + "</time>" +
        "<div><h2>" + esc(tr(j.title)) + "</h2><p>" + esc(tr(j.body)) + "</p></div>" +
        (w ? '<a class="entry-art" href="#work-' + w.slug + '" style="background:' + Paint.tint(w) + ';aspect-ratio:' + w.w + "/" + w.h + '"><img data-work="' + w.slug + '" alt="' + esc(altFor(w)) + '"></a>' : "") +
        "</article>"
      );
    }).join("");
  }

  function journalPage() {
    var items = journalItems(SITE.journal);
    main.innerHTML = '<section class="page"><header class="page-head"><h1>' + t("journalTitle") + "</h1><p>" + t("journalSub") + "</p></header>" + items + "</section>";
    hydrate(main);
    return t("journalTitle") + ", " + SITE.artist.name;
  }

  function commissionsPage() {
    var c = SITE.commissions;
    var steps = c.steps.map(function (s) { return "<li><h2>" + esc(tr(s[0])) + "</h2><p>" + esc(tr(s[1])) + "</p></li>"; }).join("");
    main.innerHTML =
      '<section class="page"><header class="page-head"><h1>' + esc(tr(c.title)) + "</h1><p>" + esc(tr(c.intro)) + "</p></header>" +
      '<ol class="steps">' + steps + "</ol>" +
      '<button class="button" id="startBtn" type="button">' + t("start") + "</button></section>";
    document.getElementById("startBtn").addEventListener("click", function () { openEnquiry(null); });
    return t("commissions") + ", " + SITE.artist.name;
  }

  /* Ivelina's photo, hung like one of her paintings: a frame, a slow reveal and a warm lamp. */
  function portrait(extra) {
    var a = SITE.artist;
    if (!a.portrait) return "";
    return '<figure class="portrait ' + (extra || "") + '">' +
      '<div class="portrait-frame"><img src="' + esc(a.portrait) + '" alt="' + esc(tr(a.portraitAlt)) + '" loading="lazy"></div>' +
      '<figcaption>' + t("inStudio") + "</figcaption></figure>";
  }

  function aboutPage() {
    var a = SITE.artist;
    var shows = SITE.exhibitions.length
      ? '<h2 class="sub">' + t("exhibitions") + '</h2><ul class="shows">' + SITE.exhibitions.map(function (e) { return "<li><span>" + esc(e.year) + "</span>" + esc(tr(e.text)) + "</li>"; }).join("") + "</ul>"
      : "";
    var links = channels().map(function (c) { return '<a href="' + esc(c[1]) + '" target="_blank" rel="noopener">' + esc(c[0]) + "</a><br>"; }).join("");
    main.innerHTML =
      '<section class="page"><header class="page-head"><h1>' + t("studio") + "</h1></header>" + portrait("on-page") + '<div class="prose">' +
      SITE.statement.map(function (p) { return "<p>" + esc(tr(p)) + "</p>"; }).join("") + "</div>" + shows +
      '<h2 class="sub">' + t("find") + '</h2><p class="contact">' + links + (a.email ? esc(a.email) + "<br>" : "") + esc(tr(a.location)) + "</p></section>";
    return t("studio") + ", " + SITE.artist.name;
  }

  function notFound() {
    main.innerHTML = '<section class="page"><header class="page-head"><h1>' + t("offTitle") + "</h1><p>" + t("offSub") + '</p></header><a class="button" href="#">' + t("back") + "</a></section>";
    return t("offTitle") + ", " + SITE.artist.name;
  }

  function resolve() {
    var page = location.hash.replace(/^#/, "");
    var w, s;
    // tint is the colour of that page's wall.
    if (!page) return { key: "wall", tint: "#7fbef3", draw: wallPage };
    if (page.indexOf("series-") === 0 && (s = findSeries(page.slice(7)))) return { key: "series", tint: s.color, draw: function () { return seriesPage(s); } };
    if (page.indexOf("work-") === 0 && (w = findWork(page.slice(5)))) return { key: "work", tint: w.series.color, draw: function () { return workPage(w); } };
    if (page === "journal") return { key: "journal", tint: "#7fbef3", draw: journalPage };
    if (page === "commissions") return { key: "commissions", tint: "#dcaf61", draw: commissionsPage };
    if (page === "about") return { key: "about", tint: "#ee9caf", draw: aboutPage };
    return { key: "none", tint: "#f18154", draw: notFound };
  }

  function render() {
    function swap() {
      // Read the address now, not when the click happened, so quick clicks always land on the latest page.
      var route = resolve();
      if (render.hash === location.hash && render.ready) return;
      render.hash = location.hash;
      level = DEPTH[route.key];
      currentKey = route.key;
      document.documentElement.style.setProperty("--tint", route.tint || "#f18154");
      renderToken++;
      if (cleanup) { cleanup(); cleanup = null; }
      if (viewer) { viewer.destroy(); viewer = null; }
      document.body.dataset.view = route.key;
      document.title = route.draw();
      window.scrollTo(0, 0);
      nav.querySelectorAll("a").forEach(function (a) {
        var target = a.getAttribute("href").replace("#", "") || "wall";
        var here = target === route.key;
        if (here) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
    }
    var next = resolve();
    var betweenRooms = render.ready && !instant && !flight && currentKey !== "work" && next.key !== "work";
    if (flight) {
      swap(); // the painting itself carries the eye, so the page changes at once
    } else if (betweenRooms && PaintWipe.available) {
      PaintWipe.run(paintsFor(next.tint || "#f18154"), swap);
    } else if (document.startViewTransition && !reduced && render.ready && !instant) {
      // Deeper pages rise into view and shallower ones settle back, so the site has a sense of place.
      var root = document.documentElement, depth = DEPTH[next.key];
      root.dataset.nav = depth > level ? "in" : depth < level ? "out" : "side";
      var vt = document.startViewTransition(swap);
      var clear = function () { delete root.dataset.nav; };
      // Quick page changes skip the transition, which is fine. Don't report that as an error.
      vt.ready.catch(function () {});
      vt.finished.then(clear, clear);
    } else swap();
    instant = false;
    render.ready = true;
  }

  function buildChrome() {
    var a = SITE.artist;
    document.documentElement.lang = LANG;
    document.getElementById("brand").textContent = a.name;
    nav.querySelectorAll("a").forEach(function (link) {
      link.textContent = t(link.dataset.label);
    });
    document.querySelectorAll(".lang").forEach(function (b) {
      b.textContent = t("other");
      b.setAttribute("aria-label", t("otherName"));
    });
    document.getElementById("foot").innerHTML =
      "<span>© " + new Date().getFullYear() + " " + esc(a.name) + " · " + esc(tr(a.location)) + "</span>" +
      channels().map(function (c) { return '<a href="' + esc(c[1]) + '" target="_blank" rel="noopener">' + esc(c[0]) + "</a>"; }).join("") +
      (SITE.draft ? '<span class="draft">' + t("draft") + "</span>" : "");
    // "Get in touch" floats in the corner of the text pages and rooms (the wall has its own in the bar).
    var talk = document.getElementById("talkFloat");
    if (!talk) {
      talk = document.createElement("button");
      talk.id = "talkFloat"; talk.type = "button"; talk.className = "talk talk-float";
      talk.addEventListener("click", function () { openContact({ topic: currentKey === "commissions" ? "idea" : "question" }); });
      app.appendChild(talk);
    }
    talk.innerHTML = '<span class="bubble" aria-hidden="true"></span>' + t("talk");
  }

  function entranceWords() {
    var name = document.getElementById("enterName");
    if (!name) return;
    name.textContent = SITE.artist.name;
    document.getElementById("enterMedium").textContent = tr(SITE.artist.medium);
    var place = document.getElementById("enterPlace");
    if (place) place.textContent = SITE.artist.location ? tr(SITE.artist.location) : "";
    document.getElementById("enterBtn").textContent = t("enter");
    document.getElementById("enterCue").textContent = window.matchMedia("(pointer: coarse)").matches ? t("cueTouch") : t("cueMouse");
  }

  function switchLanguage() {
    LANG = LANG === "bg" ? "en" : "bg";
    try { localStorage.setItem("lang", LANG); } catch (e) {}
    buildChrome();
    entranceWords();
    render.hash = null; // force the current page to redraw in the new language
    instant = true;
    render();
  }

  function entrance() {
    var el = document.getElementById("entrance");
    var seen = false;
    try { seen = sessionStorage.getItem("entered") === "1"; } catch (e) {}
    var deepLink = location.hash.replace(/^#/, "") !== "";
    if (seen || deepLink) { el.remove(); return; }

    entranceOpen = true;
    app.inert = true;
    document.body.classList.add("locked");
    entranceWords();
    el.hidden = false;
    /* The opening: the brand alone. A brush stroke paints itself, the name writes in, then the
       tagline and the place. Soft glows in the paintings' colours drift behind, and the gallery
       lamp leans toward the mouse or the phone's tilt. Scroll, swipe up or tap anywhere to enter. */
    var lit = null;
    requestAnimationFrame(function () { el.classList.add("revealed"); });
    var lamp = el.querySelector(".enter-canvas"), lx = 0, ly = 0, tx = 0, ty = 0, lampRaf = 0;
    function lean() {
      lx += (tx - lx) * 0.06; ly += (ty - ly) * 0.06;
      lamp.style.transform = "translate3d(" + (lx * 3).toFixed(2) + "%," + (ly * 2).toFixed(2) + "%,0)";
      lampRaf = Math.abs(tx - lx) + Math.abs(ty - ly) > 0.002 ? requestAnimationFrame(lean) : 0;
    }
    function aim(x, y) {
      if (reduced) return;
      tx = Math.max(-1, Math.min(1, x)); ty = Math.max(-1, Math.min(1, y));
      if (!lampRaf) lampRaf = requestAnimationFrame(lean);
    }
    function onMouse(e) {
      if (e.pointerType !== "mouse") return;
      aim((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
    }
    function onTilt(e) { if (e.gamma != null) aim(e.gamma / 25, (e.beta - 45) / 25); }
    // Touch and click: a tap or an upward swipe enters.
    var press = null;
    function onDown(e) { press = { x: e.clientX, y: e.clientY, type: e.pointerType }; }
    function onMove() {}
    function onUp(e) {
      if (!press) return;
      var dx = e.clientX - press.x, dy = e.clientY - press.y;
      press = null;
      if (dy < -50 || (Math.abs(dx) < 12 && Math.abs(dy) < 12)) enter();
    }
    function onWheel(e) { if (e.deltaY > 4) enter(); }
    el.addEventListener("pointermove", onMouse);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("deviceorientation", onTilt);

    function enter(after) {
      try { sessionStorage.setItem("entered", "1"); } catch (e) {}
      if (typeof after !== "function") after = null; // key and hashchange pass events
      if (!entranceOpen) return;
      entranceOpen = false;
      window.removeEventListener("keydown", key);
      window.removeEventListener("deviceorientation", onTilt);
      cancelAnimationFrame(lampRaf);
      el.classList.add("leaving");
      // The name lifts away, then paint sweeps the room clear and the paintings are hung.
      PaintWipe.run(paintsFor("#7fbef3").concat(["#f18154", "#e8be62"]), function () {
        app.inert = false;
        document.body.classList.remove("locked");
        if (lit) lit.destroy();
        el.remove();
        if (salon) salon.arrive();
        if (after) after();
      });
    }
    function key(e) { if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); enter(); } }
    document.getElementById("enterBtn").addEventListener("click", function () { enter(); });
    window.addEventListener("keydown", key);
    window.addEventListener("hashchange", enter, { once: true });
  }

  document.querySelectorAll(".lang").forEach(function (b) { b.addEventListener("click", switchLanguage); });
  buildChrome();
  roomLamp();
  entrance();
  render();
  window.addEventListener("hashchange", render);
})();
