# Build-generated webfonts

The production build downloads and self-hosts the webfont resources used by the Videha Literary Atlas so readers do not need a runtime request to Google Fonts.

Families used:

- Noto Sans Devanagari — SIL Open Font License 1.1 — https://github.com/notofonts/devanagari
- Noto Serif Devanagari — SIL Open Font License 1.1 — https://github.com/notofonts/devanagari
- Space Grotesk — SIL Open Font License 1.1 — https://github.com/floriankarsten/space-grotesk

`npm run build` runs `scripts/localize-fonts.mjs`, which writes hashed WOFF2 files into this directory and generates `app/local-fonts.css`. The binary font files are build products rather than source assets committed to the repository.
