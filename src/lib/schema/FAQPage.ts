/**
 * src/lib/schema/FAQPage.ts
 */
import { z } from 'zod';

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export function faqPageSchema(faqs: any[]) {
  const validatedFaqs = z.array(FaqItemSchema).parse(faqs);

  return {
    "@type": "FAQPage",
    "mainEntity": validatedFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
