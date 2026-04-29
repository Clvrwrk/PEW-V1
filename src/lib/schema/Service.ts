/**
 * src/lib/schema/Service.ts
 */
import { z } from 'zod';

const ServiceDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
});

export function serviceSchema(serviceData: any, officeName?: string) {
  const service = ServiceDataSchema.parse(serviceData);

  return {
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "RoofingContractor",
      "name": officeName ? `Pro Exteriors - ${officeName}` : "Pro Exteriors"
    },
    "url": service.url,
    "areaServed": {
      "@type": "Country",
      "name": "US"
    }
  };
}
