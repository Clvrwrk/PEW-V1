/**
 * src/lib/schema/WebSite.ts
 */
export function websiteSchema() {
  const siteUrl = "https://pc-demo.cleverwork.io";

  return {
    "@type": "WebSite",
    "name": "Pro Exteriors",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}
