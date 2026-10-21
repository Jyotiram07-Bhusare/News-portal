#!/usr/bin/env node
/*
 * AWS Amplify build step: writes frontend/js/env-config.js from the Amplify environment variables.
 *
 *   LOKMANGAL_API_BASE   https://api.lokmangal.in            the backend on EC2 (https only, no trailing slash needed)
 *   LOKMANGAL_PDF_BASE   https://media.lokmangal.in/pdf/     where the weekly PDFs are (the CloudFront address of the S3 bucket + /pdf/)
 *
 * An address that is not https:// stops the build (a typo must not go live). Missing values are allowed - the site then runs from its
 * built-in data / reads the PDFs from assets/pdf/ - but a warning is printed.
 */
const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "..", "frontend", "js", "env-config.js");
const env = {};
let failed = false;

function address(variable, key, { trailingSlash }) {
  const raw = (process.env[variable] || "").trim();
  if (!raw) {
    console.warn(`[env-config] WARNING: ${variable} is not set.`);
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

address("LOKMANGAL_API_BASE", "API_BASE", { trailingSlash: false });
address("LOKMANGAL_PDF_BASE", "PDF_BASE", { trailingSlash: true });

if (failed) process.exit(1);

const text =
  "/* Written by the AWS Amplify build (deploy/amplify/write-env-config.js) from the Amplify environment variables. Public values only. */\n" +
  "window.LOKMANGAL_ENV = " + JSON.stringify(env) + ";\n";
fs.writeFileSync(target, text, "utf8");
console.log("[env-config] wrote " + path.relative(process.cwd(), target) + ": " + JSON.stringify(env));
