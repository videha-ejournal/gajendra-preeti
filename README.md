# प्रीति ठाकुर आ गजेन्द्र ठाकुर

A bilingual Maithili and English literary atlas, published at **https://videha-ejournal.github.io/gajendra-preeti/**. English: **https://videha-ejournal.github.io/gajendra-preeti/en/**. Criticism: **https://videha-ejournal.github.io/gajendra-preeti/criticism/**.

An editorial introduction to two bodies of work: illustrated children's literature, translation, creative writing, manuscript preservation, scholarship and Videha's digital archive.

- Paired writer introductions with identified archival photographs.
- Three themed reading paths; 26 source-linked catalogue entries with author filters and search, including Devanagari year normalization.
- Eight dated literary milestones from 2002 to 2026.
- Manuscript preservation and Braille resources; direct paths into Videha's journal, library and complete works.
- Maithili document language, semantic landmarks, keyboard accessible controls, skip link, mobile breakpoints, browser zoom support and reduced-motion behavior.
- Sources and image attribution are visible on the site. No analytics, accounts, tracking, invented biographies or server APIs.
- English homepage with translated navigation, writer introductions, searchable catalogue, reading paths and timeline; language switches on both editions.
- A searchable English Reading Room with 59 standalone HTML assessments: 17 Preeti catalogue entries and all 42 entries in the main “00 मुख्य समग्र” catalogue snapshot, including three digital companions.
- Critical pages provide a reading, a discussion question, source links, evidence scope, related readings, previous/next navigation, adjustable text size, print styles and reduced-motion support.

## Criticism: scope and maintenance

`public/sitemap.xml` is generated with the criticism pages before each build. It lists the Maithili homepage, English homepage, criticism index and all 59 criticism pages. The domain-root repository advertises this sitemap in its sitemap index and robots.txt.

`content/catalogue-snapshot.json` preserves the consulted public catalogue entry titles and links. `content/readings.txt` contains the editorial notes: each blank-line-separated entry has metadata, a critical lens, two paragraphs and a question. `scripts/build-criticism.mjs` validates one-to-one coverage and generates `public/criticism/` before a production build. The stylesheet and reader script in that folder are maintained directly.

The English notes were prepared with AI assistance, a fact stated on every page. They are not presented as reviews by the featured writers or an external reviewer. Direct sampled text and visual readings, whole short-book visual readings, publisher/catalogue-based critical introductions and interface assessments have distinct evidence labels. PDF references count physical PDF pages including front matter. Neither translation fidelity nor historical claims are certified by these notes.

Coverage is per catalogue entry, not a separate complete review of every constituent story, novel or volume. Full multi-volume links are retained. In particular, the thirty-seven-novel collections and the large combined teaching course receive transparently limited introductions. The Preeti archive receives an archival assessment, not an invented literary plot. English display titles may be descriptive translations rather than official English edition titles. Original titles remain visible.

## Sources and editorial maintenance

The factual selection is based on public Videha sources, checked 8 September 2026:

- https://www.videha.co.in/pothi.htm — titles, editions, translation roles and Panji catalogue.
- https://www.videha.co.in/kids.htm — children's literature.
- https://www.videha.co.in/gajendra-thakur-samagra.htm — collected works and resources.
- https://gajendrathakur.blogspot.com/2026/08/blog-post.html — digital publication chronology.
- https://books.google.com/books?id=SvntEAAAQBAJ — author bibliography, including the 2009 Braille edition.

`app/works.json` is a curated catalogue, not a claim of completeness. Years are edition dates; null years are displayed as an em dash. Each record retains a source URL. External resources remain with their original publishers and may change independently of this site.

Photographs: Preeti Thakur from https://www.videha.co.in/ratna.htm (original https://www.videha.co.in/prity.jpg). Gajendra Thakur by Umeshberma (2009), https://commons.wikimedia.org/wiki/File:GajendraThakur.jpg, CC BY 3.0 https://creativecommons.org/licenses/by/3.0/. Images are displayed without alteration; no license is asserted over third-party works.

## Development and publication

Use Node 22 LTS and npm. Run `npm ci`, then `npm run dev`; open `/gajendra-preeti/`. Run `npx tsc --noEmit`, `npm run build` and `node scripts/validate-static.mjs` to check the source and exported site. The static check covers both language editions, all 59 criticism pages, source coverage, local assets and cross-page anchors. Node 22 is recommended on Windows because Node 24 can terminate with a native shutdown assertion after Vinext has emitted its build.

GitHub Actions builds on Linux/Node 22 and publishes only `dist/client/gajendra-preeti` to GitHub Pages. The repository base path is configured in `next.config.ts`; change asset URLs and canonical metadata together if renaming the repository. Pushes to `main` automatically build, validate and publish. No runtime server or secret is included in the deployed artifact.

Built with React, Vinext, Tailwind and the scaffold's Base UI/Shadcn primitives. Fonts are loaded from Google Fonts with local system fallbacks. The inherited development toolchain includes Cloudflare packages that are unused by this static deployment; their audit findings do not imply a Cloudflare server is deployed.

## Reading access and preservation

Every page includes browser-based listening, a 41-language Google Translate selector, reading preferences and a citation tool. Voice availability depends on the device; Maithili voice fallback is disclosed. Machine translations are not reviewed editions. Native Maithili and English homepages remain separately accessible.

All 26 works are initially visible, with writer, genre, year and text filters. Stable work and timeline anchors support citation. Reading-room badges distinguish evidence tiers; each essay states its scope and the absence of a recorded named human review. Catalogue identifiers retain their original positions, including gaps in the Preeti sequence.

Nine PDFs are preserved in `public/books/`; `content/book-mirrors.json` records their original URLs, byte sizes, SHA-256 hashes and preparation date. Original links remain available. These are GitHub-hosted copies, not new Archive.org uploads. The existing Archive.org combined Panji PDF is linked separately; it has not been compared in full with every Drive volume. Keep provenance records when replacing files and verify hashes before publication.
