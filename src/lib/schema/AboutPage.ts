/**
 * src/lib/schema/AboutPage.ts
 */
export function aboutPageSchema() {
  return {
    "@type": "AboutPage",
    "name": "About Pro Exteriors",
    "description": "Learn about Pro Exteriors, our mission, our leadership, and our commitment to roofing excellence.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Pro Exteriors",
      "foundingDate": "2011"
    }
  };
}
