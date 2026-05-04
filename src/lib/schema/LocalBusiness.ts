/**
 * src/lib/schema/LocalBusiness.ts
 */
import { z } from 'zod';

const OfficeSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  email: z.string(),
  url: z.string(),
  image: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export function localBusinessSchema(officeData: any) {
  const office = OfficeSchema.parse(officeData);

  return {
    "@type": "RoofingContractor",
    "name": `Pro Exteriors - ${office.name}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": office.address,
      "addressLocality": office.name.split(',')[0].trim(),
      "addressRegion": office.name.split(',')[1]?.trim() || "TX",
      "addressCountry": "US"
    },
    "geo": office.lat && office.lng ? {
      "@type": "GeoCoordinates",
      "latitude": office.lat,
      "longitude": office.lng
    } : undefined,
    "url": office.url,
    "telephone": office.phone,
    "email": office.email,
    "image": office.image || "https://pc-demo.cleverwork.io/Logos/pro-exteriors-logo-light.webp"
  };
}

export function localBusinessAreaSchema(city: string, region: string = "TX") {
  return {
    "@type": "RoofingContractor",
    "name": `Pro Exteriors - ${city} Roofing Services`,
    "areaServed": {
      "@type": "City",
      "name": city,
      "containsPlace": {
        "@type": "State",
        "name": region
      }
    }
  };
}
