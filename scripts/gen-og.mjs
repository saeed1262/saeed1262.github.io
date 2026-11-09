// Generates the social share image and the favicons in the Isfahan look.
//   node scripts/gen-og.mjs
// The share image is rendered by headless Chrome so it uses the site's own
// fonts. Set CHROME to the browser binary if it isn't in the default place.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const font = (file) =>
  `data:font/woff2;base64,${readFileSync(`src/styles/fonts/${file}`).toString('base64')}`;

const girih = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='white' stroke-width='1.2'><path d='M30 14 L46 30 L30 46 L14 30 Z'/><path d='M19 19 H41 V41 H19 Z'/><path d='M30 0 V14 M46 30 H60 M30 46 V60 M0 30 H14'/><path d='M8 0 L0 8 M52 0 L60 8 M0 52 L8 60 M60 52 L52 60'/><circle cx='30' cy='30' r='4'/></g></svg>",
);

const petals = Array.from({ length: 16 }, (_, i) =>
  `<path d="M200 200 C214 168, 214 128, 200 96 C186 128, 186 168, 200 200 Z" transform="rotate(${i * 22.5} 200 200)" stroke="${i % 2 ? '#e7b85a' : '#3cc8c2'}"/>`,
).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: C; src: url(${font('cormorant-garamond-latin-600-normal.woff2')}); font-weight: 600; }
@font-face { font-family: L; src: url(${font('literata-latin-wght-normal.woff2')}); font-weight: 200 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; position: relative;
  background: #111733; color: #e7e9f4; font-family: L, serif; }
.wash { position: absolute; inset: 0;
  background: linear-gradient(120deg, rgba(60,80,170,.35), rgba(24,33,63,0) 55%, rgba(19,90,110,.3)); }
.tiles { position: absolute; inset: 0; background: #7f93e6; opacity: .22;
  -webkit-mask: url("data:image/svg+xml;utf8,${girih}") 0 0 / 64px 64px,
    linear-gradient(90deg, transparent 35%, #000 85%);
  -webkit-mask-composite: source-in; }
svg.rosette { position: absolute; right: -150px; top: 50%; width: 560px; translate: 0 -50%; opacity: .45; }
.text { position: absolute; left: 88px; top: 50%; translate: 0 -50%; width: 760px; }
.role { color: #e7b85a; font-variant: small-caps; letter-spacing: .2em; font-size: 26px; }
h1 { font-family: C, serif; font-weight: 600; font-size: 116px; line-height: 1; margin-top: 18px; }
.rule { width: 72px; height: 3px; background: #e7b85a; border-radius: 2px; margin: 30px 0 26px; }
p { color: #99a2c3; font-size: 27px; line-height: 1.5; }
</style></head><body>
<div class="wash"></div><div class="tiles"></div>
<svg class="rosette" viewBox="0 0 400 400"><g fill="none" stroke="#3cc8c2" stroke-width="1.4">
  <circle cx="200" cy="200" r="190"/><circle cx="200" cy="200" r="178" stroke-dasharray="2 6"/>
  <path d="M200 40 L360 200 L200 360 L40 200 Z"/><path d="M87 87 H313 V313 H87 Z"/>${petals}
  <circle cx="200" cy="200" r="110"/><circle cx="200" cy="200" r="22" stroke="#e7b85a"/></g></svg>
<div class="text">
  <div class="role">Machine Learning Engineer &amp; Scientist</div>
  <h1>Saeed Ghorbani</h1>
  <div class="rule"></div>
  <p>Agentic AI at Roper Technologies. Research in generative models, computer vision and human motion.</p>
</div></body></html>`;

mkdirSync('public/images', { recursive: true });
const dir = mkdtempSync(join(tmpdir(), 'og-'));
const page = join(dir, 'og.html');
writeFileSync(page, html);
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--window-size=1200,630',
  `--screenshot=${join(dir, 'og.png')}`, `file://${page}`,
], { stdio: 'ignore' });
await sharp(join(dir, 'og.png')).png({ compressionLevel: 9 }).toFile('public/images/og-default.png');
rmSync(dir, { recursive: true, force: true });
console.log('wrote public/images/og-default.png');

// Favicons from favicon.svg: a 96px PNG, and a .ico holding 16/32/48px PNGs.
const svg = readFileSync('public/favicon.svg');
await sharp(svg, { density: 384 }).resize(96, 96).png().toFile('public/favicon.png');
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()),
);
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...pngs]));
console.log('wrote public/favicon.png and public/favicon.ico');
