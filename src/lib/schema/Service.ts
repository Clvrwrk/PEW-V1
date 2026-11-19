/**
 * src/lib/schema/Service.ts
 */
import { z } from 'zod';

const SITE = 'https://proexteriorsus.com';

const ServiceDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
});

export type AreaServedPlace = {
  type: 'City' | 'State' | 'Country';
  name: string;
  region?: string;
};

function toAreaServedNode(place: AreaServedPlace) {
  if (place.type === 'Country') {
    return { '@type': 'Country', name: place.name };
  }
  if (place.type === 'State') {
    return { '@type': 'State', name: place.name };
  }
  return {
    '@type': 'City',
    name: place.name,
    ...(place.region
      ? { containedInPlace: { '@type': 'State', name: place.region } }
      : {}),
  };
}

export function serviceSchema(
  serviceData: z.infer<typeof ServiceDataSchema>,
  options?: {
    areaServed?: AreaServedPlace[];
    serviceId?: string;
  },
) {
  const service = ServiceDataSchema.parse(serviceData);
  const absoluteUrl = service.url.startsWith('http') ? service.url : `${SITE}${service.url}`;
  const id = options?.serviceId ?? `${absoluteUrl}#service`;

  const areaServed = options?.areaServed?.length
    ? options.areaServed.map(toAreaServedNode)
    : [{ '@type': 'Country', name: 'United States' }];

  return {
    '@type': 'Service',
    '@id': id,
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'RoofingContractor',
      '@id': `${SITE}/#organization`,
      name: 'Pro Exteriors',
      url: SITE,
    },
    url: absoluteUrl,
    areaServed: areaServed.length === 1 ? areaServed[0] : areaServed,
  };
}