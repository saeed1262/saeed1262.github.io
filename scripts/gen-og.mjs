import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="32%" cy="34%" r="80%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.32"/>
      <stop offset="50%" stop-color="#818cf8" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#0a0b0f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0b0f"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="80" y="232" width="120" height="6" rx="3" fill="url(#bar)"/>
  <text x="80" y="340" font-family="Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="#f4f4f5">Saeed Ghorbani</text>
  <text x="82" y="408" font-family="Helvetica, Arial, sans-serif" font-size="42" font-weight="400" fill="#9ca3af">Senior Machine Learning Engineer</text>
</svg>`;

mkdirSync('public/images', { recursive: true });
await sharp(Buffer.from(svg)).png().toFile('public/images/og-default.png');
console.log('wrote public/images/og-default.png');
