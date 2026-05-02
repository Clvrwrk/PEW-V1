import React, { useState } from 'react';

export default function AddressAutocomplete() {
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    // Phase 1 validation: just check if it loosely looks like an address
    if (address.length < 5 || !/\d/.test(address)) {
      setError('Please enter a valid street address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Simulate lookup and redirect
    setTimeout(() => {
      window.location.href = `/property-card/report/?address=${encodeURIComponent(address)}`;
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto" method="GET" action="/property-card/report/">
      <div className="relative flex items-center">
        <label htmlFor="property-address" className="sr-only">Property Address</label>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          type="text"
          id="property-address"
          name="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError(null);
          }}
          className={`block w-full pl-11 pr-32 py-4 text-base rounded-full border shadow-sm focus:ring-2 focus:outline-none transition-shadow ${
            error 
              ? 'border-danger-border focus:border-danger focus:ring-danger text-danger-text placeholder-danger-border'
              : 'border-border focus:border-accent focus:ring-accent text-text-primary placeholder-text-tertiary'
          }`}
          placeholder="Enter your property address..."
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "address-error" : undefined}
          required
        />
        <div className="absolute inset-y-1 right-1 flex items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-text-on-brand bg-brand-primary hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Searching...' : 'Get Card'}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-danger text-center" id="address-error">
          {error}
        </p>
      )}
    </form>
  );
}
