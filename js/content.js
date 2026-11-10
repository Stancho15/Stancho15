/*
  THIS IS THE ONLY FILE YOU NEED TO EDIT.

  Everything on the site comes from here. Text that appears in both languages
  is written like this:  { en: "English", bg: "Български" }

  TO CONFIRM WITH IVELINA
  - The painting titles below are working titles, chosen from what each painting
    shows. Rename any of them.
  - Sizes, materials, years and prices are not known yet, so the site shows none
    of them and says "Ask for the price".
  - Her statement and the commissions text.

  ADDING DETAILS TO A PAINTING
  Each painting is one line:
    photo("quiet-canal", "Quiet Canal", "Тих канал", 50, 70, "#736b5d"),
  The two numbers are only its proportions. Add details in { } at the end:
    photo("quiet-canal", "Quiet Canal", "Тих канал", 50, 70, "#736b5d", { price: 350 }),
  Possible details:
    price: 350                  in euros
    status: "sold"              shows Sold and hides the price and Enquire button
    size: [50, 70]              real width and height in cm: shows the size and
                                the "Beside a person" view
    medium: OIL                 or ACRYLIC
    year: 2024
    story: { en: "…", bg: "…" } a few lines about the painting

  ADDING A NEW PAINTING
  Put its photo in art/ (straight on, 2000px on the long side) and a small copy
  in art/thumbs/ with the same name, then add a photo(...) line to a series.
  A new series gets its own filter button, room and colour automatically.
*/

var OIL = { en: "Oil on canvas", bg: "Масло върху платно" };
var ACRYLIC = { en: "Acrylic on canvas", bg: "Акрил върху платно" };

// One painting from its photo in art/ and art/thumbs/.
function photo(slug, en, bg, w, h, tint, more) {
  var work = {
    slug: slug, title: { en: en, bg: bg }, w: w, h: h, cm: false, tint: tint,
    image: "art/" + slug + ".jpg", thumb: "art/thumbs/" + slug + ".jpg", relief: 1.4,
  };
  more = more || {};
  if (more.size) { work.w = more.size[0]; work.h = more.size[1]; work.cm = true; }
  for (var k in more) if (k !== "size") work[k] = more[k];
  return work;
}

window.SITE = {
  // Shows a small "draft" note in the footer. Set to false to launch.
  draft: true,

  artist: {
    name: "IV Art",
    owner: { en: "Ivelina", bg: "Ивелина" },
    medium: { en: "Paintings by Ivelina", bg: "Картини от Ивелина" },
    location: { en: "Stara Zagora, Bulgaria", bg: "Стара Загора, България" },
    // Her photo on the Studio page and in "Meet Ivelina" on the home page.
    portrait: "art/ivelina-studio.jpg",
    portraitAlt: {
      en: "Ivelina in her studio, beside her painting of the Doge's Palace in Venice",
      bg: "Ивелина в ателието си, до картината ѝ с Двореца на дожите във Венеция",
    },
    // Paste her full page links here. Empty ones stay hidden.
    instagram: "",
    tiktok: "",
    facebook: "",
    email: "",
  },

  // "Get in touch" messages. Leave formEndpoint empty and visitors copy their message
  // into her email or social media. To have messages arrive in her email instead, make a
  // free form at https://formspree.io and paste its address here, e.g.
  //   formEndpoint: "https://formspree.io/f/abcdwxyz"
  contact: { formEndpoint: "" },

  // The painting used as the surface on the entrance screen.
  entranceWork: "gondolas-at-sunset",
  // A larger photo of it just for the opening close-up, so the brushstrokes stay sharp,
  // and the spot (across, down, from 0 to 1) the close-up starts on.
  entranceImage: "art/hero-gondolas-at-sunset.jpg",
  entranceFocus: [0.2, 0.68],

  statement: [
    {
      en: "I'm Ivelina, a painter from Stara Zagora, Bulgaria. Painting is where I feel at peace, and I love to paint anything and everything.",
      bg: "Аз съм Ивелина, художничка от Стара Загора. В рисуването намирам спокойствие и обичам да рисувам всичко.",
    },
    {
      en: "I work in oil and acrylic. My goal is simple: to make people happy and help them love art.",
      bg: "Работя с маслени и акрилни бои. Целта ми е проста: да радвам хората и да ги карам да обичат изкуството.",
    },
  ],

  // Add her shows here, e.g. { year: "2026", text: { en: "Group show, Stara Zagora", bg: "Обща изложба, Стара Загора" } }
  exhibitions: [],

  commissions: {
    title: { en: "Your story, on canvas", bg: "Твоята история върху платно" },
    intro: {
      en: "I paint anything. If you can imagine it, ask me.",
      bg: "Рисувам всичко. Ако можеш да си го представиш, попитай ме.",
    },
    steps: [
      [
        { en: "Share your idea", bg: "Сподели идеята си" },
        {
          en: "Tell me what you'd like: a person, a pet, a place, or anything at all. Photos help.",
          bg: "Разкажи ми какво искаш: човек, домашен любимец, място или нещо съвсем различно. Снимките помагат.",
        },
      ],
      [
        { en: "I review it", bg: "Разглеждам я" },
        {
          en: "I look at your idea first and approve it before any paint goes on the canvas.",
          bg: "Първо разглеждам идеята ти и я одобрявам, преди да започна да рисувам.",
        },
      ],
      [
        { en: "I paint it", bg: "Рисувам я" },
        {
          en: "Once it's approved, I begin. Most commissions take about 2 days.",
          bg: "След одобрението започвам работа. Повечето поръчки отнемат около 2 дни.",
        },
      ],
    ],
  },

  series: [
    {
      slug: "venice-and-rome",
      name: { en: "Venice & Rome", bg: "Венеция и Рим" },
      color: "#dcaf61", // this series' colour across the site
      note: { en: "Canals, bridges and old palaces from Italy's best-loved cities.", bg: "Канали, мостове и стари дворци от най-обичаните градове на Италия." },
      works: [
        photo("the-gondolier", "The Gondolier", "Гондолиерът", 44, 70, "#847d6c"),
        photo("gondolas-at-sunset", "Gondolas at Sunset", "Гондоли по залез", 70, 43, "#706345"),
        photo("quiet-canal", "Quiet Canal", "Тих канал", 50, 70, "#736b5d"),
        photo("doges-palace", "The Doge's Palace", "Дворецът на дожите", 70, 55, "#6d6a63"),
        photo("san-giorgio", "San Giorgio in the Storm", "Сан Джорджо в бурята", 70, 69, "#5a6269"),
        photo("venetian-square", "Venetian Square", "Венецианско площадче", 50, 70, "#807567"),
        photo("rome-st-peters", "Rome, St Peter's", "Рим, Свети Петър", 70, 50, "#827365"),
      ],
    },
    {
      slug: "landscapes",
      name: { en: "Landscapes", bg: "Пейзажи" },
      color: "#91c985",
      note: { en: "Mountains, rivers, forests and quiet paths.", bg: "Планини, реки, гори и тихи пътеки." },
      works: [
        photo("mountain-lake", "Mountain Lake and Poppies", "Планинско езеро с макове", 70, 53, "#6c6958"),
        photo("before-the-storm", "Before the Storm", "Преди бурята", 54, 70, "#3c4e50"),
        photo("the-waterfall", "The Waterfall", "Водопадът", 70, 51, "#6d746d"),
        photo("window-to-the-valley", "Window to the Valley", "Прозорец към долината", 55, 70, "#4e544a"),
        photo("autumn-mist", "Autumn Mist", "Есенна мъгла", 70, 50, "#62646a"),
        photo("the-little-bridge", "The Little Bridge", "Малкото мостче", 70, 69, "#637669"),
        photo("stormy-river", "Storm over the River", "Буря над реката", 70, 48, "#5a6465"),
        photo("evening-river", "Evening on the River", "Вечер на реката", 70, 56, "#5a5954"),
        photo("green-path", "The Green Path", "Зелената пътека", 70, 44, "#5e6c55"),
        photo("house-on-the-hill", "House on the Hill", "Къщата на хълма", 48, 70, "#5e655d"),
        photo("winter-tree", "Winter Tree", "Зимно дърво", 44, 70, "#a19d9c"),
      ],
    },
    {
      slug: "water-and-light",
      name: { en: "Water & Light", bg: "Вода и светлина" },
      color: "#7fbef3",
      note: { en: "The sea, the moon and the light on the water.", bg: "Морето, луната и светлината по водата." },
      works: [
        photo("moonlight", "Moonlight", "Лунна пътека", 56, 70, "#30373a"),
        photo("town-by-the-sea", "Old Town by the Sea", "Старият град край морето", 53, 70, "#7b8584"),
        photo("sunset-walk", "Sunset Walk", "Разходка по залез", 51, 70, "#63605c"),
        photo("sails", "Sails", "Платна", 46, 70, "#9c9d9c"),
        photo("sea-cave", "Sea Cave", "Морска пещера", 70, 57, "#484848"),
        photo("song-of-the-sea", "Song of the Sea", "Песента на морето", 70, 56, "#717672"),
        photo("bridge-at-dusk", "Bridge at Dusk", "Мост по здрач", 70, 54, "#3d3c3d"),
        photo("grey-bridge", "The Grey Bridge", "Сивият мост", 70, 62, "#5c5450"),
        photo("under-the-moon", "Under the Moon", "Под луната", 47, 70, "#4c5053"),
        photo("night-gull", "Night Gull", "Нощна чайка", 70, 56, "#32322a"),
      ],
    },
    {
      slug: "animals",
      name: { en: "Animals", bg: "Животни" },
      color: "#ee9caf",
      note: { en: "Cats, dogs and birds, painted with love.", bg: "Котки, кучета и птици, нарисувани с обич." },
      works: [
        photo("on-the-beach", "On the Beach", "На плажа", 70, 49, "#7e7e75"),
        photo("cranes-in-the-snow", "Cranes in the Snow", "Жерави в снега", 70, 52, "#595d63"),
        photo("afternoon-nap", "Afternoon Nap", "Следобедна дрямка", 70, 52, "#6d685f"),
        photo("little-friend", "Little Friend", "Малкият приятел", 46, 70, "#58544c"),
        photo("curious-cat", "Curious Cat", "Любопитна котка", 70, 55, "#797058"),
        photo("sleeping-cat", "Sleeping Cat", "Спяща котка", 48, 70, "#535a50"),
      ],
    },
    {
      slug: "still-life",
      name: { en: "Still Life & Imagination", bg: "Натюрморт и въображение" },
      color: "#cba6e8",
      note: { en: "Fruit, flowers and ideas from her imagination.", bg: "Плодове, цветя и идеи от въображението ѝ." },
      works: [
        photo("red-apple", "Red Apple", "Червена ябълка", 70, 53, "#6a4b3c"),
        photo("still-life-with-pears", "Still Life with Pears", "Натюрморт с круши", 70, 50, "#5b5451"),
        photo("by-the-fire", "By the Fire", "До огъня", 70, 54, "#645d53"),
        photo("zodiac", "Zodiac", "Зодиак", 70, 49, "#73766a"),
        photo("perfume", "Perfume", "Парфюм", 39, 70, "#251d10"),
        photo("silver-circles", "Silver Circles", "Сребърни кръгове", 48, 70, "#726963"),
        photo("green-grid", "Green Grid", "Зелена мрежа", 70, 54, "#5e6b2b"),
      ],
    },
  ],

  // Newest first. "work" is optional and shows that painting beside the entry.
  journal: [
    {
      date: "2026-11-08", work: "window-to-the-valley",
      title: { en: "Sample entry: the gallery is open", bg: "Примерен запис: галерията е отворена" },
      body: {
        en: "This is the studio logbook. A few lines whenever something happens: a painting started, a colour that finally worked, a show going up.",
        bg: "Това е дневникът на ателието. Няколко реда, когато се случи нещо: започната картина, сполучлив цвят, нова изложба.",
      },
    },
    {
      date: "2026-10-14", work: "cranes-in-the-snow",
      title: { en: "Sample entry: studio notes", bg: "Примерен запис: бележки от ателието" },
      body: {
        en: "Entries can be short. A dated trail of real work shows visitors the studio is alive.",
        bg: "Записите могат да са кратки. Те показват на посетителите, че ателието е живо.",
      },
    },
  ],
};
