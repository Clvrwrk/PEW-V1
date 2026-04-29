import type { APIRoute } from 'astro';
import { z } from 'zod';

const leadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional(),
  projectDetails: z.string().optional(),
  vertical: z.string().optional(),
  formType: z.string().optional(),
  campaign: z.string().optional(),
});

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    let payload;
    
    // Check if the request is JSON or FormData (for SSR fallback)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported Content-Type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate against schema
    const parsedData = leadFormSchema.safeParse(payload);
    
    if (!parsedData.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: parsedData.error.issues,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: In Phase 2, integrate with GoHighLevel API here
    console.log('[LEAD SUBMISSION] Received valid lead:', parsedData.data);

    // If it was a standard form POST (no JS), redirect
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      return redirect('/thank-you/', 302);
    }

    // Otherwise, return success JSON for client-side routing
    return new Response(JSON.stringify({ success: true, message: 'Lead submitted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[LEAD SUBMISSION] Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
