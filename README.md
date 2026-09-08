# प्रीति ठाकुर आ गजेन्द्र ठाकुर

A Maithili literary atlas, published at **https://videha-ejournal.github.io/gajendra-preeti/**.

An editorial introduction to two bodies of work: illustrated children's literature, translation, creative writing, manuscript preservation, scholarship and Videha's digital archive.

- Paired writer introductions with identified archival photographs.
- Three themed reading paths; 26 source-linked catalogue entries with author filters and search, including Devanagari year normalization.
- Eight dated literary milestones from 2002 to 2026.
- Manuscript preservation and Braille resources; direct paths into Videha's journal, library and complete works.
- Maithili document language, semantic landmarks, keyboard accessible controls, skip link, mobile breakpoints, browser zoom support and reduced-motion behavior.
- Sources and image attribution are visible on the site. No analytics, accounts, tracking, invented biographies or server APIs.

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

Use Node 22 or newer and npm. Run `npm ci`, then `npm run dev`; open `/gajendra-preeti/`. Run `npx tsc --noEmit`, `npm run build` and `node scripts/validate-static.mjs` to check the source and exported site.

GitHub Actions builds on Linux/Node 22 and publishes only `dist/client/gajendra-preeti` to GitHub Pages. The repository base path is configured in `next.config.ts`; change asset URLs and canonical metadata together if renaming the repository. Pushes to `main` automatically build, validate and publish. No runtime server or secret is included in the deployed artifact.

Built with React, Vinext, Tailwind and the scaffold's Base UI/Shadcn primitives. Fonts are loaded from Google Fonts with local system fallbacks. The inherited development toolchain includes Cloudflare packages that are unused by this static deployment; their audit findings do not imply a Cloudflare server is deployed.
