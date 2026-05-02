import { defineCollection, z } from 'astro:content';

// ─── Shared schemas ───────────────────────────────────────────────────────────

const seoFields = z.object({
  title: z.string().min(10).max(60),
  description: z.string().min(70).max(160),
  canonicalPath: z.string(),
  ogImage: z.string().optional(),
  heroImage: z.string().optional(),
  noindex: z.boolean().default(false),
});

const faqItem = z.object({
  question: z.string(),
  answer: z.string(),
});

// ─── Content Collections ──────────────────────────────────────────────────────

/** Commercial and residential services */
// `slug` cannot appear in a content-collection schema (Astro reserves it for
// route generation). The frontmatter may still define `slug`; Astro picks it
// up to override the filename-derived slug, exposed as `entry.slug` at runtime.
const services = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    vertical: z.enum(['commercial', 'residential']),
    name: z.string(),
    h1: z.string(),
    heroImage: z.string().optional(),   // public/ path or placeholder
    faqs: z.array(faqItem).optional(),
    relatedServices: z.array(z.string()).optional(), // slugs within same vertical
    // Path C — partner-fulfilled services
    partnerFulfilled: z.boolean().default(false),

    // ── Magazine-quality structured sections (all optional) ─────────────
    // When present, the service detail template renders rich visual sections.
    // When absent, the page gracefully degrades to the simpler prose layout.
    intro: z.object({
      heading: z.string(),
      body: z.string(),
      image: z.string(),
      badges: z.array(z.string()).optional(),
    }).optional(),
    benefits: z.object({
      heading: z.string(),
      subtitle: z.string().optional(),
      items: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),
    structureTypes: z.object({
      heading: z.string(),
      items: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),
    processSteps: z.object({
      heading: z.string(),
      image: z.string(),
      steps: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),
    galleryImages: z.array(z.string()).optional(),
    ctaBanner: z.object({
      heading: z.string(),
      subtitle: z.string().optional(),
      ctaText: z.string(),
      ctaHref: z.string(),
    }).optional(),
  }),
});

/** City pages — one per vertical × city */
const cities = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields.shape,
    vertical: z.enum(['commercial', 'residential']),
    name: z.string(),
    state: z.string().length(2),
    h1: z.string(),
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
    vertical: z.enum(['commercial', 'residential', 'brand']),
    intro: z.string(),
  }),
});

/** Legal / utility pages (MDX only) */
const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /**
     * Canonical URL path for the legal page (e.g. "/privacy-policy/").
     * Required so the dynamic [slug] route can map an MDX entry to its
     * production URL without depending on the entry's filename.
     */
    canonicalPath: z.string(),
    description: z.string().optional(),
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
