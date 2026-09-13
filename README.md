# प्रीति ठाकुर आ गजेन्द्र ठाकुर

A bilingual Maithili and English literary atlas, published at **https://videha-ejournal.github.io/gajendra-preeti/**. English: **https://videha-ejournal.github.io/gajendra-preeti/en/**. Criticism: **https://videha-ejournal.github.io/gajendra-preeti/criticism/**.

An editorial introduction to two bodies of work: illustrated children's literature, translation, creative writing, manuscript preservation, scholarship and Videha's digital archive.

- Paired writer introductions with identified archival photographs.
- Three themed reading paths and a 36-work curated catalogue with author, genre, year, destination and text filters.
- Twelve dated literary milestones from 2002 to 2026.
- Manuscript preservation and Braille resources; direct paths into Videha's journal, library and complete works.
- Maithili document language, semantic landmarks, keyboard accessible controls, skip link, mobile breakpoints, browser zoom support and reduced-motion behavior.
- Sources and image attribution are visible on the site. No analytics, accounts, tracking, invented biographies or server APIs.
- English homepage with translated navigation, writer introductions, searchable catalogue, reading paths and timeline; language switches on both editions.
- A searchable bilingual Reading Room with 59 standalone critical assessments.
- Critical pages provide a reading, a discussion question, source links, evidence scope, related readings, previous/next navigation, adjustable text size, print styles and reduced-motion support.

## Complete scholarly bibliography

The homepage catalogue is intentionally curated. It is **not** the complete Gajendra Thakur bibliography.

The complete scholarly layer is generated at build time from the authoritative **“00 मुख्य समग्र / Core collected works & resources”** data block on:

- https://videha-ejournal.github.io/videha/gajendra-thakur-samagra.htm
- source repository: `videha-ejournal/videha`, file `gajendra-thakur-samagra.htm`

Published bibliography routes:

- Maithili: https://videha-ejournal.github.io/gajendra-preeti/bibliography/
- English: https://videha-ejournal.github.io/gajendra-preeti/en/bibliography/
- Gajendra Thakur authority record: https://videha-ejournal.github.io/gajendra-preeti/author/gajendra-thakur/
- English authority record: https://videha-ejournal.github.io/gajendra-preeti/en/author/gajendra-thakur/

`scripts/build-scholarly-bibliography.mjs` fetches the current authoritative Samagra source during production builds, parses the `00 मुख्य समग्र` array, fingerprints the source with SHA-256, and generates a permanent bilingual scholarly record for every synchronized entry. The full canonical title is preserved even when a compact stable URL slug is required.

Each scholarly work record includes, where the authoritative sources supply it:

- canonical Devanagari title and Roman transliteration;
- verified English title/gloss already recorded by the atlas;
- creator credit and role;
- work type and language;
- publication/edition year;
- ISBN;
- all recorded manifestations/access routes such as PDF, hardback, paperback, Google Play, Kindle and audiobook;
- provenance, source position, stable internal record identifier and verification date;
- Schema.org `Book` + breadcrumb structured data and scholarly citation meta tags;
- Chicago, MLA and APA display citations;
- BibTeX, RIS and CSL-JSON exports;
- links to chapter/section reading routes for major long-form works where an existing Videha guide is available.

The bibliography also publishes collection-level BibTeX, RIS and CSL-JSON files and `crossref-ready.json`. **No DOI is invented or claimed.** DOI fields remain `null` until a DOI is formally registered with a DOI registration agency. Likewise, no ORCID is asserted unless it is verified in an authoritative source.

The generator leaves missing bibliographic facts blank rather than guessing. The curated 36-work atlas and the synchronized complete bibliography therefore have different purposes: the former is an editorial reading selection; the latter is the scholarly discovery/citation layer.

`scripts/validate-scholarly-bibliography.mjs` verifies every generated record, bilingual work page, citation export, sitemap URL, source fingerprint, DOI-null rule and authority page on every production build.

## Criticism: scope and maintenance

`public/sitemap.xml` is generated with the criticism and scholarly bibliography pages before each build. It lists the Maithili and English homepages, criticism routes, contributor routes, long-form readers, the bilingual complete bibliography, authority records and all generated scholarly work records. The domain-root repository advertises this sitemap in its sitemap index and robots.txt.

`content/catalogue-snapshot.json` preserves the consulted public catalogue entry titles and links. `content/readings.txt` contains the editorial notes: each blank-line-separated entry has metadata, a critical lens, two paragraphs and a question. `scripts/build-criticism.mjs` validates one-to-one coverage and generates `public/criticism/` before a production build. The stylesheet and reader script in that folder are maintained directly.

The English notes were prepared with AI assistance, a fact stated on every page. They are not presented as reviews by the featured writers or an external reviewer. Direct sampled text and visual readings, whole short-book visual readings, publisher/catalogue-based critical introductions and interface assessments have distinct evidence labels. PDF references count physical PDF pages including front matter. Neither translation fidelity nor historical claims are certified by these notes.

Coverage is per catalogue entry, not a separate complete review of every constituent story, novel or volume. Full multi-volume links are retained. In particular, the thirty-seven-novel collections and the large combined teaching course receive transparently limited introductions. The Preeti archive receives an archival assessment, not an invented literary plot. English display titles may be descriptive translations rather than official English edition titles. Original titles remain visible.

## Sources and editorial maintenance

The factual selection is based on public Videha sources, with current verification dates exposed in `content/site-meta.json` and on the generated pages:

- https://www.videha.co.in/pothi.htm — titles, editions, translation roles and Panji catalogue.
- https://www.videha.co.in/kids.htm — children's literature.
- https://videha-ejournal.github.io/videha/gajendra-thakur-samagra.htm — authoritative `00 मुख्य समग्र` source for the complete Gajendra Thakur bibliography.
- https://gajendrathakur.blogspot.com/2026/08/blog-post.html — digital publication chronology.
- https://books.google.com/books?id=SvntEAAAQBAJ — author bibliography, including the 2009 Braille edition.

`app/works.json` is the curated atlas catalogue, not a claim of completeness. Years are edition dates; null years are displayed as an em dash. Each curated record retains a source URL. External resources remain with their original publishers and may change independently of this site.

Photographs: Preeti Thakur from https://www.videha.co.in/ratna.htm (original https://www.videha.co.in/prity.jpg). Gajendra Thakur by Umeshberma (2009), https://commons.wikimedia.org/wiki/File:GajendraThakur.jpg, CC BY 3.0 https://creativecommons.org/licenses/by/3.0/. Images are displayed without alteration; no license is asserted over third-party works.

## Development and publication

Use Node 22 LTS and npm. Run `npm ci`, then `npm run dev`; open `/gajendra-preeti/`. Run `npx tsc --noEmit`, `npm run build` and `node scripts/validate-static.mjs` to check the source and exported site. The production build additionally runs the site-wide bilingual, provenance and scholarly-bibliography validators.

GitHub Actions builds on Linux/Node 22 and publishes only `dist/client/gajendra-preeti` to GitHub Pages. The repository base path is configured in `next.config.ts`; change asset URLs and canonical metadata together if renaming the repository. Pushes to `main` automatically build, validate and publish. No runtime server or secret is included in the deployed artifact.

Built with React, Vinext, Tailwind and the scaffold's Base UI/Shadcn primitives. Production builds localize the required Noto Sans Devanagari, Noto Serif Devanagari and Space Grotesk WOFF2 resources so deployed pages do not depend on Google Fonts at runtime. The inherited development toolchain includes Cloudflare packages that are unused by this static deployment; their audit findings do not imply a Cloudflare server is deployed.

## Reading access and preservation

Every primary atlas page includes browser-based listening, a 41-language Google Translate selector, reading preferences and a citation tool. Voice availability depends on the device; Maithili voice fallback is disclosed. Machine translations are not reviewed editions. Native Maithili and English editions remain separately accessible.

All 36 curated works are initially visible, with writer, genre, year, source/destination and text filters. Stable work and timeline anchors support citation. The complete bibliography is separately searchable/sortable and supplies permanent scholarly work records and citation exports. Reading-room badges distinguish evidence tiers; each essay states its scope and the absence of a recorded named human review. Catalogue identifiers retain their original positions, including gaps in the Preeti sequence.

Nine PDFs are preserved in `public/books/`; `content/book-mirrors.json` records their original URLs, byte sizes, SHA-256 hashes and preparation date. Original links remain available. These are GitHub-hosted copies, not new Archive.org uploads. The existing Archive.org combined Panji PDF is linked separately; it has not been compared in full with every Drive volume. Keep provenance records when replacing files and verify hashes before publication.

The Maithili and English routes use separate root layouts in `app/(maithili)` and `app/(english)`, sharing `app/site-layout.tsx`. Homepage work totals derive from `works.json`; reading-room totals and evidence counts derive from the generated manifest; complete Gajendra bibliography totals derive from the authoritative `00 मुख्य समग्र` at build time.

The present GitHub Pages deployment path remains `/gajendra-preeti`. A move to another path or domain still requires a coordinated migration of canonical URLs, static assets, stored book URLs and navigation; changing only `next.config.ts` is not sufficient.
