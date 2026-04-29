/**
 * src/lib/schema/Person.ts
 */
import { z } from 'zod';

const PersonDataSchema = z.object({
  name: z.string(),
  jobTitle: z.string().optional(),
  image: z.string().optional(),
  sameAs: z.array(z.string()).optional(),
});

export function personSchema(data: any) {
  const person = PersonDataSchema.parse(data);

  return {
    "@type": "Person",
    "name": person.name,
    "jobTitle": person.jobTitle,
    "image": person.image,
    "sameAs": person.sameAs,
    "worksFor": {
      "@type": "Organization",
      "name": "Pro Exteriors"
    }
  };
}
