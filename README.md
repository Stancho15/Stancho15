# IV Art

Original oil and acrylic paintings by Ivelina, Stara Zagora, Bulgaria, in English and Bulgarian.

A plain HTML, CSS and JavaScript site: nothing to install or build. It is published with
GitHub Pages straight from this repository.

## Changing the content

Everything visitors read is in [js/content.js](js/content.js): her details, statement,
commissions, the five series and every painting, and the journal. Instructions are at the
top of that file. Painting photos live in `art/` (about 1600px) with small copies in
`art/thumbs/` (about 720px) for the gallery wall.

Before launching for real, confirm with Ivelina:

- the painting titles (they are working titles)
- sizes, materials, years and prices, where she wants them shown
- her Instagram, TikTok and Facebook links, and a `formEndpoint` for "Get in touch"
- then set `draft: false` to remove the draft note in the footer

## Seeing it on your computer

In this folder, run:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:4173. Press Ctrl+C to stop.

`js/worst-case.js` adds a "Demo data / Worst case" test switch, but only on localhost and
only while `draft` is true, so visitors never see it.
