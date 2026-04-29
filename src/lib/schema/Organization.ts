/**
 * src/lib/schema/Organization.ts
 * Returns the global Pro Exteriors Organization schema.
 */

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": "https://pc-demo.cleverwork.io/#organization",
    "name": "Pro Exteriors",
    "url": "https://pc-demo.cleverwork.io/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pc-demo.cleverwork.io/logo.png",
      "width": "600",
      "height": "60"
    },
    "sameAs": [
      "https://www.facebook.com/proexteriorsus",
      "https://www.linkedin.com/company/pro-exteriors-llc-tx",
      "https://www.instagram.com/proexteriorsus"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+1-469-535-1708",
        "contactType": "customer service",
        "areaServed": "US",
        "availableLanguage": "en"
      }
    ]
  };
}
