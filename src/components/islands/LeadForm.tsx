import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Shared Schema
const leadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional(),
  projectDetails: z.string().optional(),
  // Internal/Hidden fields
  vertical: z.string().optional(),
  formType: z.string().optional(),
  campaign: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export interface LeadFormProps {
  vertical: 'residential' | 'commercial' | 'emergency' | 'property-card';
  formType: string;
  defaultFields?: Partial<LeadFormData>;
  redirectTo?: string;
  campaign?: string;
}

export default function LeadForm({
  vertical,
  formType,
  defaultFields = {},
  redirectTo = '/thank-you/',
  campaign = 'organic',
}: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      vertical,
      formType,
      campaign,
      ...defaultFields,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Fire attempt event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'form_submit_attempt',
        formId: formType,
        vertical: vertical,
      });
    }

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Fire success event
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'form_submit_success',
          formId: formType,
          vertical: vertical,
        });
      }

      window.location.href = redirectTo;
    } catch (err) {
      console.error(err);
      setSubmitError('There was an issue submitting your request. Please try calling us instead.');
      
      // Fire error event
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'form_submit_error',
          formId: formType,
          vertical: vertical,
          errorMessage: (err as Error).message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmergency = vertical === 'emergency';
  const isCommercial = vertical === 'commercial';

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-6 max-w-xl"
      method="POST" 
      action="/api/lead" // SSR fallback action
    >
      <input type="hidden" {...register('vertical')} />
      <input type="hidden" {...register('formType')} />
      <input type="hidden" {...register('campaign')} />

      {submitError && (
        <div className="rounded-md bg-danger-surface p-4" role="alert">
          <p className="text-sm text-danger-text">{submitError}</p>
        </div>
      )}

      {/* Errors Summary for Accessibility */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-md bg-danger-surface p-4" role="alert" aria-live="assertive">
          <h3 className="text-sm font-medium text-danger-text">There were errors with your submission:</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-danger-text">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err?.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary">First Name <span className="text-danger">*</span></label>
          <div className="mt-1">
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.firstName ? 'border-danger-border focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'
              }`}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary">Last Name <span className="text-danger">*</span></label>
          <div className="mt-1">
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.lastName ? 'border-danger-border focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'
              }`}
              aria-invalid={!!errors.lastName}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email <span className="text-danger">*</span></label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.email ? 'border-danger-border focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'
              }`}
              aria-invalid={!!errors.email}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Phone <span className="text-danger">*</span></label>
          <div className="mt-1">
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.phone ? 'border-danger-border focus:border-danger focus:ring-danger' : 'border-border focus:border-accent focus:ring-accent'
              }`}
              aria-invalid={!!errors.phone}
            />
          </div>
        </div>
      </div>

      {(!isEmergency || isCommercial) && (
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-text-secondary">
            {isCommercial ? 'Property Address' : 'Home Address'}
          </label>
          <div className="mt-1">
            <input
              id="address"
              type="text"
              {...register('address')}
              className="block w-full rounded-md border-border shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="projectDetails" className="block text-sm font-medium text-text-secondary">
          {isEmergency ? 'Describe the Damage/Emergency' : 'Project Details'}
        </label>
        <div className="mt-1">
          <textarea
            id="projectDetails"
            rows={4}
            {...register('projectDetails')}
            className="block w-full rounded-md border-border shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center rounded-md border border-transparent py-3 px-4 text-sm font-medium text-text-on-brand shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isEmergency 
              ? 'bg-danger hover:bg-danger-hover focus:ring-danger'
              : 'bg-brand-primary hover:bg-brand-accent-hover focus:ring-accent'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : (isEmergency ? 'Request Emergency Service' : 'Submit Request')}
        </button>
      </div>
    </form>
  );
}
