/**
 * WebPage schema for commercial money pages.
 */
const SITE = 'https://proexteriorsus.com';

export function webPageSchema(params: {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
  serviceId?: string;
}) {
  const absolute = params.url.startsWith('http') ? params.url : `${SITE}${params.url}`;

  return {
    '@type': 'WebPage',
    '@id': `${absolute}#webpage`,
    name: params.name,
    description: params.description,
    url: absolute,
    isPartOf: { '@id': `${SITE}/#website` },
    ...(params.serviceId ? { about: { '@id': params.serviceId } } : {}),
    ...(params.dateModified ? { dateModified: params.dateModified } : {}),
    author: { '@id': `${SITE}/#chris-hussey` },
    reviewedBy: { '@id': `${SITE}/#chris-hussey` },
  };
}