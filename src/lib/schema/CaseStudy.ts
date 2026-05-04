/**
 * src/lib/schema/CaseStudy.ts
 */
import { z } from 'zod';

const CaseStudyDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  city: z.string(),
  service: z.string(),
  image: z.string().optional(),
  url: z.string(),
});

export function caseStudySchema(data: any) {
  const caseStudy = CaseStudyDataSchema.parse(data);

  return {
    "@type": "CreativeWork",
    "name": caseStudy.title,
    "description": caseStudy.description,
    "image": caseStudy.image || "https://pc-demo.cleverwork.io/Logos/pro-exteriors-logo-light.webp",
    "contentLocation": {
      "@type": "City",
      "name": caseStudy.city
    },
    "about": {
      "@type": "Service",
      "name": caseStudy.service
    },
    "author": {
      "@type": "Organization",
      "name": "Pro Exteriors"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": caseStudy.url
    }
  };
}
