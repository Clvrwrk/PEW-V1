/**
 * src/lib/schema/CollectionPage.ts
 */
import { z } from 'zod';

const CollectionItemSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string().optional(),
});

export function collectionPageSchema(items: any[], title: string, description: string) {
  const validatedItems = z.array(CollectionItemSchema).parse(items);

  return {
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": validatedItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "url": item.url,
        "description": item.description
      }))
    }
  };
}
