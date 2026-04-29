import { defineCollection, z } from 'astro:content';

// ─── Shared schemas ───────────────────────────────────────────────────────────

const seoFields = z.object({
  title: z.string().min(10).max(60),
  description: z.string().min(70).max(160),
  canonicalPath: z.string(),
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
});

const faqItem = z.object({
  question: z.string(),
  answer: z.string(),
});

// ─── Content Collections ──────────────────────────────────────────────────────

/** Commercial and residential services */
const services = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    vertical: z.enum(['commercial', 'residential']),
    slug: z.string(),
    name: z.string(),
    h1: z.string(),
    heroImage: z.string().optional(),   // public/ path or placeholder
    faqs: z.array(faqItem).optional(),
    relatedServices: z.array(z.string()).optional(), // slugs within same vertical
    // Path C — partner-fulfilled services
    partnerFulfilled: z.boolean().default(false),
  }),
});

/** City pages — one per vertical × city */
const cities = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    vertical: z.enum(['commercial', 'residential']),
    name: z.string(),
    slug: z.string(),
    state: z.string().length(2),
    h1: z.string(),
    description: z.string(),
    nearestOffice: z.string(), // office slug
    faqs: z.array(faqItem).optional(),
    projectGallery: z.array(z.string()).optional(),
    testimonials: z.array(z.string()).optional(),
  }),
});

/** Subdivision pages — Property First treatment */
const subdivisions = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    name: z.string(),
    slug: z.string(),
    parentCity: z.string(), // city slug
    state: z.string().length(2),
    h1: z.string(),
    hoaRules: z.string().optional(),
    hailHistory: z.string().optional(),
    servedJobs: z.number().default(0),
    faqs: z.array(faqItem).optional(),
  }),
});

/** Office location pages — GBP destinations */
const offices = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    name: z.string(),
    slug: z.string(),
    metro: z.string(),
    type: z.enum(['headquarters', 'branch', 'satellite']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string().length(2),
      zip: z.string(),
    }),
    phone: z.string(),
    hours: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    servicesOffered: z.array(z.string()).optional(), // service slugs
  }),
});

/** Case studies */
const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    projectName: z.string(),
    slug: z.string(),
    industryCategory: z.enum(['commercial', 'residential', 'proplan']),
    scope: z.string(),
    timeline: z.string().optional(),
    testimonial: z.string().optional(),
  }),
});

/** Blog posts (silo supporters) */
const blogPosts = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    slug: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    pillar: z.enum([
      'commercial-roofing',
      'residential-roofing',
      'roof-repair',
      'storm-damage',
      'proplan',
      'total-home-shield',
      'property-card',
    ]),
    // Kyle Roof Reverse Silo fields — required for audit-silo.mjs
    silo_target: z.string(), // URL of money page this post links UP to
    silo_siblings: z.array(z.string()).min(1).max(2), // URLs of 1-2 sibling supporters
    targetAnchorText: z.string(), // keyword-rich anchor to use when linking to silo_target
    faqs: z.array(faqItem).optional(),
  }),
});

/** Blog pillar pages */
const pillars = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    name: z.string(),
    slug: z.string(),
    vertical: z.enum(['commercial', 'residential', 'brand']),
    intro: z.string(),
  }),
});

/** Legal / utility pages (MDX only) */
const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lastUpdated: z.coerce.date().optional(),
    noindex: z.boolean().default(false),
  }),
});

/** Leadership profiles */
// const leadership = defineCollection({ ... }) — Phase 2

export const collections = {
  services,
  cities,
  subdivisions,
  offices,
  caseStudies,
  blogPosts,
  pillars,
  legal,
};
