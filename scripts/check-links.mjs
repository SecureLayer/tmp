// Crawls the built dist/ output and verifies every internal link/asset
// reference resolves to a real file. External links, mailto:, tel:, and
// anchors are skipped — this checks what the build actually controls.
import { readFileSync, existsSync, statSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { globSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");

if (!existsSync(DIST)) {
  console.error(`dist/ not found at ${DIST} — run "npm run build" first.`);
  process.exit(1);
}

const htmlFiles = globSync("**/*.html", { cwd: DIST }).map((f) =>
  join(DIST, f),
);

// Path prefixes that intentionally resolve outside dist/ — this project
// deploys public/images/* and public/docs/* via a separate mechanism
// (R2/manual upload) independent of git, confirmed by checking the actual
// repo tree: nothing under these two prefixes has ever been committed,
// yet they load fine live. Real broken links elsewhere still get caught.
const KNOWN_EXTERNAL_PREFIXES = ["/images/", "/docs/"];

const ATTR_RE = /(?:href|src)="([^"]+)"/g;
let errors = 0;
let checked = 0;

function resolvesInDist(urlPath) {
  const clean = urlPath.split("#")[0].split("?")[0];
  if (clean === "" || clean === "/") return true;
  const asFile = join(DIST, clean);
  if (existsSync(asFile) && statSync(asFile).isFile()) return true;
  const asIndex = join(DIST, clean, "index.html");
  if (existsSync(asIndex)) return true;
  const withHtml = asFile.endsWith(".html") ? asFile : `${asFile}.html`;
  if (existsSync(withHtml)) return true;
  return false;
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  let match;
  while ((match = ATTR_RE.exec(html))) {
    const url = match[1];
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:") ||
      url.startsWith("data:") ||
      url.startsWith("#")
    )
      continue;
    if (!url.startsWith("/")) continue; // only check root-relative internal links
    if (KNOWN_EXTERNAL_PREFIXES.some((prefix) => url.startsWith(prefix)))
      continue;

    checked++;
    if (!resolvesInDist(url)) {
      console.error(
        `✗ Broken link: "${url}" (referenced in ${file.replace(DIST, "dist")})`,
      );
      errors++;
    }
  }
}

console.log(
  `Checked ${checked} internal link(s) across ${htmlFiles.length} page(s).`,
);
if (errors > 0) {
  console.error(`\n${errors} broken internal link(s) found.`);
  process.exit(1);
}
console.log("All internal links resolve.");
