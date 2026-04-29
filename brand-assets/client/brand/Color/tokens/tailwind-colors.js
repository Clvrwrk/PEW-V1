/**
 * Pro Exteriors LLC — Tailwind CSS Color Config
 * Master Color System v1.0 — 2026-04-12
 *
 * PANTONE REFERENCE (for vendors / print):
 *   prussian_blue  → Pantone 2767 C / 2767 U  (ΔE 1.62 / 1.77)
 *   burnt_sienna   → Pantone 711 C  / 2349 U  (ΔE 2.62 / 3.07)
 *   golden_orange  → Pantone 7409 C / 7551 U  (ΔE 1.46 / 2.29)
 *   hunter_green   → Pantone 7734 C / 7734 U  (ΔE 4.17 / 1.73)
 *   smart_blue     → Pantone 2174 C / 300 U   (ΔE 1.14 / 2.18)
 *
 * Usage: Import into tailwind.config.js → theme.extend.colors
 */

module.exports = {
  // ── Prussian Blue — Primary Anchor ─────────────────
  // Pantone 2767 C / 2767 U
  prussian_blue: {
    DEFAULT: '#13294B',
    50:  '#E8EDF4',
    100: '#D5E2F5',
    200: '#ABC4EA',
    300: '#82A7E0',
    400: '#588AD5',
    500: '#326DC7',
    600: '#27569D',
    700: '#1D3F73',
    800: '#13294B',
    900: '#0E1E37',
    950: '#091425',
  },

  // ── Burnt Sienna — Secondary ───────────────────────
  // Pantone 711 C / 2349 U
  burnt_sienna: {
    DEFAULT: '#C22328',
    50:  '#FCF4F4',
    100: '#F7E4E4',
    200: '#F0C8C9',
    300: '#E8ACAE',
    400: '#E09194',
    500: '#D97679',
    600: '#D15A5E',
    700: '#CA3E43',
    800: '#C22328',
    900: '#921A1E',
    950: '#611214',
  },

  // ── Golden Orange — Accent / CTA ──────────────────
  // Pantone 7409 C / 7551 U
  golden_orange: {
    DEFAULT: '#EAA221',
    50:  '#FEF9ED',
    100: '#FCF4E3',
    200: '#FAE8C7',
    300: '#F7DDAB',
    400: '#F5D18F',
    500: '#F2C673',
    600: '#EFBA57',
    700: '#EDAF3B',
    800: '#EAA221',
    900: '#B67C11',
    950: '#79530B',
  },

  // ── Hunter Green — Accent Secondary ───────────────
  // Pantone 7734 C / 7734 U
  hunter_green: {
    DEFAULT: '#3B6B4C',
    50:  '#EEF5F0',
    100: '#E3F0E8',
    200: '#C8E1D1',
    300: '#ACD2B9',
    400: '#91C2A2',
    500: '#75B38B',
    600: '#5AA474',
    700: '#4B8860',
    800: '#3B6B4C',
    900: '#2D513A',
    950: '#1E3626',
  },

  // ── Smart Blue — Links / Interactive ──────────────
  // Pantone 2174 C / 300 U
  smart_blue: {
    DEFAULT: '#0066CC',
    50:  '#E5F1FF',
    100: '#D9ECFF',
    200: '#B3D9FF',
    300: '#8CC6FF',
    400: '#66B2FF',
    500: '#409FFF',
    600: '#1A8CFF',
    700: '#0079F2',
    800: '#0066CC',
    900: '#004C99',
    950: '#003366',
  },
};
