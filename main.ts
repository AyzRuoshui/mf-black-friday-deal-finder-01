// Entrypoint for black-friday-deal-finder-01 (Node 22+, standard library only).
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appSrc = join(repoRoot, 'app');

if (!existsSync(join(appSrc, 'index.html'))) {
  throw new Error(`Missing required site entrypoint: ${join(appSrc, 'index.html')}`);
}

mkdirSync(outDir, { recursive: true });
cpSync(appSrc, join(outDir, 'app'), { recursive: true });

const screenshotsSrc = join(repoRoot, 'screenshots');
const screenshotsOut = join(outDir, 'screenshots');
mkdirSync(screenshotsOut, { recursive: true });
if (existsSync(screenshotsSrc)) {
  cpSync(screenshotsSrc, screenshotsOut, { recursive: true });
}

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

const dossierJson = buildDossier(outDir, DOSSIER_LIMITS);
const dossierBytes = Buffer.byteLength(dossierJson, 'utf8');
if (dossierBytes > 1572864) {
  throw new Error(`dossier.json exceeds 1.5 MiB cap (${dossierBytes} bytes)`);
}

writeFileSync(join(outDir, 'dossier.json'), dossierJson);
