/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ---- Semantic surface tokens ----
        'surface':              'var(--color-surface)',
        'surface-elevated':     'var(--color-surface-elevated)',
        'surface-inset':        'var(--color-surface-inset)',
        'surface-inverted':     'var(--color-surface-inverted)',

        // ---- Semantic text tokens ----
        'text-primary':         'var(--color-text-primary)',
        'text-secondary':       'var(--color-text-secondary)',
        'text-tertiary':        'var(--color-text-tertiary)',
        'text-on-brand':        'var(--color-text-on-brand)',
        'text-on-accent':       'var(--color-text-on-accent)',
        'text-inverted':        'var(--color-text-inverted)',
        'text-inverted-secondary': 'var(--color-text-inverted-secondary)',

        // ---- Semantic accent tokens ----
        'accent':               'var(--color-accent)',
        'accent-hover':         'var(--color-accent-hover)',

        // ---- Semantic border tokens ----
        'border':               'var(--color-border)',
        'border-subtle':        'var(--color-border-subtle)',

        // ---- Brand identity tokens (static) ----
        'brand-primary':        'var(--color-brand-primary)',
        'brand-accent':         'var(--color-brand-accent)',
        'brand-primary-hover':  'var(--color-brand-primary-hover)',
        'brand-accent-hover':   'var(--color-brand-accent-hover)',

        // ---- Legacy brand aliases (use semantic tokens for new code) ----
        'brand-bg':             'var(--color-brand-bg)',
        'brand-bg-alt':         'var(--color-brand-bg-alt)',
        'brand-text':           'var(--color-brand-text)',
        'brand-text-muted':     'var(--color-brand-text-muted)',
        'brand-text-secondary': 'var(--color-brand-text-secondary)',

        // ---- Status tokens ----
        success:                'var(--color-success)',
        warning:                'var(--color-warning)',
        error:                  'var(--color-error)',
        info:                   'var(--color-info)',
        'success-surface':      'var(--color-success-surface)',
        'success-text':         'var(--color-success-text)',
        'info-surface':         'var(--color-info-surface)',
        'info-text':            'var(--color-info-text)',
        'warning-surface':      'var(--color-warning-surface)',
        'warning-text':         'var(--color-warning-text)',
        danger:                 'var(--color-danger)',
        'danger-hover':         'var(--color-danger-hover)',
        'danger-surface':       'var(--color-danger-surface)',
        'danger-border':        'var(--color-danger-border)',
        'danger-text':          'var(--color-danger-text)',
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
