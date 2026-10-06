#!/usr/bin/env node
//
// Manual, on-demand tool — NOT wired into npm test or CI, and never will be
// without also adding a stored GCP credential to CI, which this project
// deliberately avoids (see SECURITY_ASSESSMENT.md's "zero secrets
// referenced" point). Run this yourself, locally, before adding a new npm
// dependency.
//
// Queries OpenSSF's public Package Analysis BigQuery dataset for raw
// observed install/import behavior of a package — file writes, network
// connections, commands run, DNS lookups. This does NOT produce a safety
// verdict: the dataset has no "malicious: true/false" field, only raw
// behavioral observations. A package with no results has simply not been
// analyzed yet by OpenSSF — that is not the same claim as "confirmed safe",
// and this tool will not tell you it is. You are the one making the call;
// this just shows you the same raw signal OpenSSF collected.
//
// Requires the `bq` CLI, authenticated once with your own Google account
// (`gcloud auth login`) — never a repo secret. A single package lookup
// stays well within BigQuery's free tier (1 TiB of query processing/month).
//
// Usage: node scripts/check-package-supply-chain.mjs <package-name>

import { execFileSync } from "node:child_process";

const packageName = process.argv[2];

if (!packageName) {
  console.error(
    "Usage: node scripts/check-package-supply-chain.mjs <package-name>",
  );
  process.exit(1);
}

// SELECT * deliberately, not named columns: the exact nested field layout
// of this public dataset isn't something we've verified column-by-column,
// and a hardcoded field path that's subtly wrong is a worse failure mode
// for a security tool than a slightly less pretty raw dump — it could
// silently show nothing when there's real data. Print whatever the schema
// actually is.
const query = `
  SELECT *
  FROM \`ossf-malware-analysis.packages\`.analysis_for_phase("import")
  WHERE Package.Ecosystem = 'npm' AND Package.Name = @package_name
  ORDER BY Package.Version DESC
  LIMIT 20
`;

console.log(
  `Querying OpenSSF's public Package Analysis dataset for npm package "${packageName}"...\n`,
);

let output;
try {
  output = execFileSync(
    "bq",
    [
      "query",
      "--use_legacy_sql=false",
      "--format=json",
      `--parameter=package_name:STRING:${packageName}`,
      query,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
} catch {
  console.error("\nFailed to query BigQuery via the `bq` CLI.");
  console.error("Make sure it's installed and authenticated:");
  console.error("  https://cloud.google.com/sdk/docs/install");
  console.error("  gcloud auth login");
  process.exit(1);
}

const rows = JSON.parse(output || "[]");

if (rows.length === 0) {
  console.log(`No results — OpenSSF has not analyzed "${packageName}".`);
  console.log(
    "This is not a safety signal either way: absence of data, not evidence of safety.",
  );
  process.exit(0);
}

console.log(
  `Found ${rows.length} analyzed version(s) for "${packageName}". Raw observed install/import behavior — review it yourself, this tool makes no safety judgment:\n`,
);
console.log(JSON.stringify(rows, null, 2));
