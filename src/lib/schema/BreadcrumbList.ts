/**
 * src/lib/schema/BreadcrumbList.ts
 */
import { z } from 'zod';

const BreadcrumbItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export function breadcrumbSchema(path: any[]) {
  const validatedPath = z.array(BreadcrumbItemSchema).parse(path);
  const siteUrl = "https://pc-demo.cleverwork.io";

  return {
    "@type": "BreadcrumbList",
    "itemListElement": validatedPath.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href.startsWith('http') ? item.href : `${siteUrl}${item.href}`
    }))
  };
}
