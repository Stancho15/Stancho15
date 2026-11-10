/* Test switch, for checking the design only. Open the site with ?data=worst
   to load the hardest realistic content Ivelina might add. It does nothing once
   draft is set to false in content.js, so it never reaches visitors. */
(function () {
  var SITE = window.SITE;
  if (!SITE || !SITE.draft || !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
  var worst = /[?&]data=worst\b/.test(location.search);

  // A small switch at the top of the page.
  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.createElement("div");
    bar.setAttribute("style", "position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99;display:flex;gap:2px;padding:3px;border-radius:999px;background:#d9d9d9;font:12px system-ui,sans-serif");
    [["Demo data", false], ["Worst case", true]].forEach(function (o) {
      var a = document.createElement("a");
      a.textContent = o[0];
      a.href = (o[1] ? "?data=worst" : "?") + location.hash;
      a.setAttribute("style", "padding:4px 10px;border-radius:999px;text-decoration:none;color:#222;" + (o[1] === worst ? "background:#fff" : ""));
      bar.appendChild(a);
    });
    document.body.appendChild(bar);
  });
  if (!worst) return;

  function find(slug) {
    var hit = null;
    SITE.series.forEach(function (s) { s.works.forEach(function (w) { if (w.slug === slug) hit = w; }); });
    return hit;
  }
  // A long title (real Bulgarian place names run long) and a high price.
  Object.assign(find("quiet-canal"), {
    title: { en: "The Sea Garden in Burgas at Sunset, After the Summer Storm", bg: "Морската градина в Бургас при залез, след лятната буря" },
    price: 12500,
    story: {
      en: "I started this one the evening after a storm, when the whole sea turned silver and then orange within ten minutes. I went back three times to see the light again, and each time it was different, so the painting became a mix of all three evenings. It took most of the summer. The frame is not included; the canvas is gallery-wrapped and ready to hang. If you would like it smaller for your home, I can paint a new version as a commission.",
      bg: "Започнах тази картина вечерта след една буря, когато цялото море стана сребърно, а после оранжево само за десет минути. Връщах се три пъти, за да видя светлината отново, и всеки път беше различна, затова картината събра и трите вечери. Отне ми почти цялото лято. Рамката не е включена; платното е опънато и готово за окачване. Ако я искаш по-малка за дома си, мога да нарисувам нова версия по поръчка.",
    },
  });
  // A one-word title and a low price.
  Object.assign(find("sails"), { title: { en: "Sea", bg: "Мир" }, price: 45 });
  Object.assign(find("red-apple"), { price: 1250 });
  // A photo that failed to upload.
  Object.assign(find("zodiac"), { image: "art/missing-photo.jpg", thumb: "art/thumbs/missing-photo.jpg" });
  // A long series name.
  SITE.series[1].name = { en: "Portraits of Beloved Family Pets and Their People", bg: "Портрети на любими домашни животни и техните стопани" };
  // A series with a single painting.
  SITE.series[3].works = SITE.series[3].works.slice(0, 1);
  // A fifth and sixth series, so the filter buttons have to scroll.
  SITE.series.push({
    slug: "flowers", name: { en: "Flowers from Grandmother's Garden", bg: "Цветя от градината на баба" }, color: "#e58fa0", note: SITE.series[0].note,
    works: [{ slug: "peonies", title: { en: "Peonies", bg: "Божури" }, year: 2026, medium: SITE.series[0].works[0].medium, w: 40, h: 40, price: 180, story: SITE.series[0].works[1].story,
      paint: { kind: "bloom", seed: 131, palette: ["#2a1420", "#5a2440", "#a2416a", "#e58fa0", "#f6c9c9", "#fff1ea"] } }],
  });
  SITE.series.push({
    slug: "portraits", name: { en: "Portraits", bg: "Портрети" }, color: "#b8a1e0", note: SITE.series[0].note,
    works: [{ slug: "grandad", title: { en: "Grandad Petar", bg: "Дядо Петър" }, year: 2025, medium: SITE.series[0].works[0].medium, w: 30, h: 40, status: "sold", story: SITE.series[0].works[1].story,
      paint: { kind: "field", seed: 149, palette: ["#16121f", "#2e2547", "#5b4a86", "#9a86c8", "#d5c8ec", "#f7f1ff"] } }],
  });
  // A journal entry with no painting and a long title.
  SITE.journal.unshift({
    date: "2026-11-06",
    title: { en: "Getting ready for the Christmas market in Stara Zagora", bg: "Подготовка за коледния базар в Стара Загора" },
    body: { en: "No painting today, just packing.", bg: "Днес без картина, само опаковане." },
  });
})();
