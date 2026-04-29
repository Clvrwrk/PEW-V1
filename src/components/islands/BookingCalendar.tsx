import React, { useEffect, useState } from 'react';

export default function BookingCalendar() {
  const [mounted, setMounted] = useState(false);
  const calendarUrl = import.meta.env.PUBLIC_BOOKING_CALENDAR_EMBED_URL || 'https://calendly.com/pro-exteriors/inspection';

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR Fallback (No JS)
  if (!mounted) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule Your Inspection</h3>
        <p className="text-gray-600 mb-8">Please click the button below to open our secure booking portal.</p>
        <a 
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-primary hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
        >
          Open Booking Portal
        </a>
      </div>
    );
  }

  // Client-side render (iframe embedded)
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden" style={{ minHeight: '650px' }}>
      <iframe
        src={calendarUrl}
        width="100%"
        height="650"
        frameBorder="0"
        title="Pro Exteriors Booking Calendar"
        className="w-full h-full"
        allow="camera; microphone; fullscreen; display-capture; geolocation"
      />
    </div>
  );
}
