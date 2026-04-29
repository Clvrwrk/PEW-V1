/**
 * src/lib/schema/ContactPage.ts
 */
export function contactPageSchema() {
  return {
    "@type": "ContactPage",
    "name": "Contact Pro Exteriors",
    "description": "Get in touch with Pro Exteriors for roofing inspections, repairs, and maintenance.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Pro Exteriors",
      "telephone": "+1-469-535-1708"
    }
  };
}
