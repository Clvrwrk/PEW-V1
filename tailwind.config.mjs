/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand tokens — all mapped through CSS variables so Phase 2 swap is a token change, not a class change
        'brand-primary':        'var(--color-brand-primary)',
        'brand-accent':         'var(--color-brand-accent)',
        'brand-bg':             'var(--color-brand-bg)',
        'brand-bg-alt':         'var(--color-brand-bg-alt)',
        'brand-text':           'var(--color-brand-text)',
        'brand-text-muted':     'var(--color-brand-text-muted)',
        'brand-text-secondary': 'var(--color-brand-text-secondary)',
        // Semantic
        success:                'var(--color-success)',
        warning:                'var(--color-warning)',
        error:                  'var(--color-error)',
        info:                   'var(--color-info)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',  { lineHeight: '2rem' }],
        '3xl': ['1.875rem',{ lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem',    { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms'),
  ],
};
