#!/usr/bin/env node
/*
 * Writes js/env-config.js (the addresses the pages need) from environment variables. Used by the GitHub Actions deploy for the website
 * AND for the admin panel (they are two separate sites on two addresses), and by amplify.yml.
 *
 *   node deploy/amplify/write-env-config.js [output file]        (default: frontend/js/env-config.js)
 *
 *   LOKMANGAL_API_BASE    https://api.lokmangal.info          the backend API (https only, no trailing slash needed)
 *   LOKMANGAL_PDF_BASE    https://media.lokmangal.info/pdf/   where the weekly PDFs are (the CloudFront address of the S3 bucket + /pdf/)
 *   LOKMANGAL_SITE_BASE   https://www.lokmangal.info          the public website (only the admin panel needs it: it reads the site's pictures)
 *
 * An address that is not https:// stops the build (a typo must not go live). Missing values are allowed - the site then runs from its
 * built-in data / reads the PDFs from assets/pdf/ - but a warning is printed (not for the optional SITE_BASE).
 */
const fs = require("fs");
const path = require("path");

const target = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "..", "..", "frontend", "js", "env-config.js");
const env = {};
let failed = false;

function address(variable, key, { trailingSlash = false, optional = false } = {}) {
  const raw = (process.env[variable] || "").trim();
  if (!raw) {
    if (!optional) console.warn(`[env-config] WARNING: ${variable} is not set.`);
    return;
  }
  let url;
  try { url = new URL(raw); } catch (e) { url = null; }
  if (!url || url.protocol !== "https:" || /["'<>\s\\]/.test(raw)) {
    console.error(`[env-config] ERROR: ${variable} must be a full https:// address (it is "${raw}").`);
    failed = true;
    return;
  }
  const clean = raw.replace(/\/+$/, "");
  env[key] = trailingSlash ? clean + "/" : clean;
}

address("LOKMANGAL_API_BASE", "API_BASE");
address("LOKMANGAL_PDF_BASE", "PDF_BASE", { trailingSlash: true });
address("LOKMANGAL_SITE_BASE", "SITE_BASE", { optional: true });

if (failed) process.exit(1);

const text =
  "/* Written by the deploy (deploy/amplify/write-env-config.js) from environment variables. Public values only. */\n" +
  "window.LOKMANGAL_ENV = " + JSON.stringify(env) + ";\n";
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, text, "utf8");
console.log("[env-config] wrote " + path.relative(process.cwd(), target) + ": " + JSON.stringify(env));
