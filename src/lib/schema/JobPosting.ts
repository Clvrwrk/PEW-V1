/**
 * src/lib/schema/JobPosting.ts
 */
import { z } from 'zod';

const JobPostingDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  datePosted: z.string(),
  validThrough: z.string(),
  city: z.string(),
  region: z.string(),
});

export function jobPostingSchema(data: any) {
  const job = JobPostingDataSchema.parse(data);

  return {
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.datePosted,
    "validThrough": job.validThrough,
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Pro Exteriors",
      "sameAs": "https://proexteriorsus.com",
      "logo": "https://proexteriorsus.com/Logos/pro-exteriors-logo-light.webp"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.city,
        "addressRegion": job.region,
        "addressCountry": "US"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "unitText": "YEAR"
      }
    }
  };
}
