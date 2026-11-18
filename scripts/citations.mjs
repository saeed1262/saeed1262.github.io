// Refresh citation counts from Semantic Scholar into src/data/citations.json.
// Runs before each deploy (and weekly, see .github/workflows/deploy.yml).
// Papers are matched by the `semanticScholar` id in src/data/publications.yaml.
// If the API is unreachable or rate-limited, the committed snapshot is kept,
// so a failed refresh never breaks the build or blanks a count.
import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'yaml';

const OUT = new URL('../src/data/citations.json', import.meta.url);
const PUBS = new URL('../src/data/publications.yaml', import.meta.url);
const API = 'https://api.semanticscholar.org/graph/v1/paper/batch?fields=citationCount';

const pubs = parse(await readFile(PUBS, 'utf8')).filter((p) => p.semanticScholar);
const old = JSON.parse(await readFile(OUT, 'utf8').catch(() => '{"counts":{}}'));

async function fetchCounts() {
  for (const wait of [0, 5000, 15000]) {
    if (wait) await new Promise((r) => setTimeout(r, wait));
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: pubs.map((p) => p.semanticScholar) }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) return await res.json();
      console.warn(`citations: Semantic Scholar answered ${res.status}`);
    } catch (err) {
      console.warn(`citations: ${err.message}`);
    }
  }
  return null;
}

const data = await fetchCounts();
if (!data) {
  console.warn('citations: keeping the existing snapshot');
  process.exit(0);
}

// Keep an old count for any paper the API skipped, rather than dropping it.
const counts = { ...old.counts };
pubs.forEach((p, i) => {
  const n = data[i]?.citationCount;
  if (typeof n === 'number') counts[p.id] = n;
});
const total = Object.values(counts).reduce((a, b) => a + b, 0);
const updated = new Date().toISOString().slice(0, 10);
await writeFile(OUT, `${JSON.stringify({ source: 'Semantic Scholar', updated, total, counts }, null, 2)}\n`);
console.log(`citations: ${Object.keys(counts).length} papers, ${total} citations (updated ${updated})`);
