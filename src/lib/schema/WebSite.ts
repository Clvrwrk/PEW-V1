/**
 * src/lib/schema/WebSite.ts
 */
export function websiteSchema() {
  const siteUrl = "https://proexteriorsus.com";

  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "name": "Pro Exteriors",
    "url": siteUrl,
    // LS-010: no SearchAction - the site has no /search page (404), so the
    // markup would describe a feature that does not exist.
  };
}
