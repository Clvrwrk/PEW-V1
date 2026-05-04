/**
 * src/lib/schema/Article.ts
 */
import { z } from 'zod';

const ArticleDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  datePublished: z.string(),
  dateModified: z.string().optional(),
  author: z.string(),
  image: z.string().optional(),
  url: z.string(),
});

export function articleSchema(articleData: any) {
  const article = ArticleDataSchema.parse(articleData);

  return {
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image || "https://pc-demo.cleverwork.io/Logos/pro-exteriors-logo-light.webp",
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pro Exteriors",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pc-demo.cleverwork.io/Logos/pro-exteriors-logo-light.webp"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
}
