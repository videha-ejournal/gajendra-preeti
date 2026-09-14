import fs from 'node:fs';

const targets = [
  ['dist/client/gajendra-preeti/isbn/index.html', 'ISBN सूची तालिका'],
  ['dist/client/gajendra-preeti/en/isbn/index.html', 'ISBN registry table'],
];

for (const [file, label] of targets) {
  if (!fs.existsSync(file)) throw new Error(`Missing built ISBN page: ${file}`);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(
    '<div class="tablewrap">',
    `<div class="tablewrap" tabindex="0" role="region" aria-label="${label}">`,
  );
  if (!html.includes('tabindex="0" role="region"')) {
    throw new Error(`Scrollable ISBN table was not made keyboard-focusable: ${file}`);
  }
  if (!html.includes('.tablewrap:focus-visible')) {
    html = html.replace(
      '</style>',
      '.tablewrap:focus-visible{outline:3px solid #9c182f;outline-offset:3px}</style>',
    );
  }
  fs.writeFileSync(file, html);
}

console.log('ISBN mobile accessibility PASS: scrollable tables are keyboard-focusable labelled regions.');
