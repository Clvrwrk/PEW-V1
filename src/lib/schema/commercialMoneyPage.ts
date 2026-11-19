/**
 * JSON-LD @graph builder for commercial buyer (money) pages.
 */
import { organizationSchema } from './Organization';
import { personSchema } from './Person';
import { breadcrumbSchema } from './BreadcrumbList';
import { faqPageSchema } from './FAQPage';
import { serviceSchema, type AreaServedPlace } from './Service';
import { webPageSchema } from './WebPage';
import { localBusinessSchema } from './LocalBusiness';
import { CHRIS_HUSSEY } from '../people/chris-hussey';

const SITE = 'https://proexteriorsus.com';

export function chrisHusseySchema() {
  return {
    ...personSchema({
      name: CHRIS_HUSSEY.name,
      jobTitle: CHRIS_HUSSEY.jobTitle,
      sameAs: [`${SITE}${CHRIS_HUSSEY.profilePath}`],
    }),
    '@id': `${SITE}/#chris-hussey`,
  };
}

export function imageObjectSchema(
  contentUrl: string,
  caption: string,
  options?: { dateCreated?: string; name?: string },
) {
  const url = contentUrl.startsWith('http') ? contentUrl : `${SITE}${contentUrl}`;
  return {
    '@type': 'ImageObject',
    contentUrl: url,
    url,
    caption,
    ...(options?.name ? { name: options.name } : {}),
    ...(options?.dateCreated ? { dateCreated: options.dateCreated } : {}),
    creator: { '@id': `${SITE}/#organization` },
  };
}

export type CommercialMoneyPageGraphInput = {
  service: { name: string; description: string; url: string };
  breadcrumbs: { label: string; href: string }[];
  faqs?: { question: string; answer: string }[];
  areaServed: AreaServedPlace[];
  dateModified?: string;
  /** Optional office NAP block for EEAT (city or market-specific contact). */
  localBusiness?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    url: string;
    lat?: number;
    lng?: number;
  };
  caseStudyImages?: { src: string; caption: string; dateCreated?: string; name?: string }[];
};

export function buildCommercialMoneyPageGraph(input: CommercialMoneyPageGraphInput) {
  const absolute = input.service.url.startsWith('http')
    ? input.service.url
    : `${SITE}${input.service.url}`;
  const serviceId = `${absolute}#service`;

  const graph: Record<string, unknown>[] = [
    organizationSchema(),
    chrisHusseySchema(),
    serviceSchema(
      {
        name: input.service.name,
        description: input.service.description,
        url: input.service.url,
      },
      { areaServed: input.areaServed, serviceId },
    ),
    webPageSchema({
      name: input.service.name,
      description: input.service.description,
      url: input.service.url,
      dateModified: input.dateModified,
      serviceId,
    }),
    breadcrumbSchema(input.breadcrumbs),
  ];

  if (input.faqs?.length) {
    graph.push(faqPageSchema(input.faqs));
  }

  if (input.localBusiness) {
    graph.push(localBusinessSchema(input.localBusiness));
  }

  for (const img of input.caseStudyImages ?? []) {
    graph.push(
      imageObjectSchema(img.src, img.caption, {
        dateCreated: img.dateCreated,
        name: img.name,
      }),
    );
  }

  return graph;
}

/** National repair pillar + system pages */
export const PE_COMMERCIAL_MARKETS: AreaServedPlace[] = [
  { type: 'City', name: 'Dallas', region: 'TX' },
  { type: 'City', name: 'Fort Worth', region: 'TX' },
  { type: 'City', name: 'Atlanta', region: 'GA' },
  { type: 'City', name: 'Denver', region: 'CO' },
  { type: 'City', name: 'Wichita', region: 'KS' },
  { type: 'City', name: 'Kansas City', region: 'MO' },
  { type: 'City', name: 'Pensacola', region: 'FL' },
];

export const DFW_MARKETS: AreaServedPlace[] = [
  { type: 'City', name: 'Dallas', region: 'TX' },
  { type: 'City', name: 'Fort Worth', region: 'TX' },
  { type: 'City', name: 'Richardson', region: 'TX' },
];

export const ATLANTA_MARKETS: AreaServedPlace[] = [
  { type: 'City', name: 'Atlanta', region: 'GA' },
  { type: 'City', name: 'Jonesboro', region: 'GA' },
];