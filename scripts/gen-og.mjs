import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="35%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.30"/>
      <stop offset="55%" stop-color="#818cf8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0a0b0f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0b0f"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="300" font-family="Helvetica, Arial, sans-serif" font-size="84" font-weight="700" fill="#f4f4f5">Saeed Ghorbani</text>
  <text x="84" y="370" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="400" fill="#9ca3af">Machine Learning Engineer</text>
</svg>`;

mkdirSync('public/images', { recursive: true });
await sharp(Buffer.from(svg)).png().toFile('public/images/og-default.png');
console.log('wrote public/images/og-default.png');
