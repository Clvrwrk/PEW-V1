/* eslint-disable no-console */
/**
 * build.js
 *
 * Produces dist/ bundles for @proexteriors/office-locations-map.
 *
 * Outputs:
 *   dist/office-locations-map.esm.js (+ sourcemap)
 *   dist/office-locations-map.cjs.js (+ sourcemap)
 *   dist/OfficeLocationsMap.jsx       (raw source — exposed via the "./source" subpath)
 *
 * Externals: react, react-dom, d3-geo, topojson-client — consumers supply these
 * via their own peer-dep install, so we never double-bundle them.
 */

const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const root       = __dirname;
const srcFile    = path.join(root, "src", "OfficeLocationsMap.jsx");
const distDir    = path.join(root, "dist");
const sourceCopy = path.join(distDir, "OfficeLocationsMap.jsx");

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "d3-geo",
  "topojson-client",
];

const banner = {
  js:
`/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} AIA4 — Pro Exteriors engagement.
 * Built: ${new Date().toISOString()}
 */`,
};

// Ensure dist exists and is clean of prior JS artifacts
fs.mkdirSync(distDir, { recursive: true });
for (const f of fs.readdirSync(distDir)) {
  if (/\.(js|map|d\.ts|jsx)$/.test(f)) {
    fs.rmSync(path.join(distDir, f), { force: true });
  }
}

async function main() {
  const shared = {
    entryPoints: [srcFile],
    bundle: true,
    sourcemap: true,
    target: ["es2019"],
    jsx: "automatic",
    loader: { ".jsx": "jsx" },
    external,
    banner,
    legalComments: "none",
    logLevel: "info",
  };

  await esbuild.build({
    ...shared,
    format: "esm",
    outfile: path.join(distDir, "office-locations-map.esm.js"),
  });

  await esbuild.build({
    ...shared,
    format: "cjs",
    outfile: path.join(distDir, "office-locations-map.cjs.js"),
  });

  // Copy raw JSX source so the "./source" subpath resolves to the un-transpiled file
  fs.copyFileSync(srcFile, sourceCopy);

  // Minimal hand-written .d.ts so consumers get basic IntelliSense on props
  const dts = `/**
 * Type stubs for @proexteriors/office-locations-map
 */
import * as React from "react";

export interface OfficeAccreditation {
  label: string;
  number: string;
}

export interface Office {
  id: string;
  type: "brick" | "satellite";
  name: string;
  company?: string;
  state: string;
  address: string;
  phone?: string | null;
  phoneHref?: string;
  email?: string;
  hours?: string;
  manager?: string;
  managerTitle?: string;
  services?: string[];
  accreditation?: OfficeAccreditation[];
  lat: number;
  lng: number;
}

export interface OfficeLocationsMapProps {
  /** Office data. Defaults to the bundled Pro Exteriors roster. */
  offices?: Office[];
  /** USPS abbreviations of states with an active office. */
  activeStates?: Set<string> | string[];
  /** USPS abbreviations of states licensed but without a physical office. */
  licensedStates?: Set<string> | string[];
  /** Override the us-atlas states TopoJSON URL. */
  atlasUrl?: string;
  /** SVG viewBox width. */
  width?: number;
  /** SVG viewBox height. */
  height?: number;
  /** Header title. */
  title?: string;
  /** Header subtitle. */
  subtitle?: string;
}

declare const OfficeLocationsMap: React.FC<OfficeLocationsMapProps>;
export default OfficeLocationsMap;
`;
  fs.writeFileSync(path.join(distDir, "index.d.ts"), dts, "utf8");

  // Report sizes
  const files = fs.readdirSync(distDir).sort();
  console.log("");
  console.log("dist/ contents:");
  for (const f of files) {
    const bytes = fs.statSync(path.join(distDir, f)).size;
    const kb = (bytes / 1024).toFixed(2);
    console.log(`  ${f.padEnd(40)} ${kb.padStart(7)} KB`);
  }
  console.log("");
  console.log("✓ build complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
