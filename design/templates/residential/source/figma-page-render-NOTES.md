# Figma page render — descriptive backup

**Source:** Inline screenshot pasted by Chris on 2026-05-03 with the page-build request. Was NOT uploaded as a separate PNG file, only rendered in chat. Layout skill in Phase 3 should ideally consume the actual PNG; if not available, this descriptive notes file is the fallback.

**Figma node:** `https://www.figma.com/design/n8EC2AgOcubGyfEq7YJoiW/Pro-Exteriors---Design-Build?node-id=9-4674&m=dev`

**Original render:** 477×2600 (display dims), implied artboard 1280px wide.

## Section-by-section visual description (top → bottom)

1. **Sticky top nav** (slate-50 background, 1280×~64). Left: "Pro Exteriors" wordmark in deep navy. Center: Residential (active, red underline) · Commercial · Service Area · About · Reviews. Right: red "Get a Quote" pill button.

2. **Hero** (1280×~870, deep navy `blue-950` background with darkened residential photograph overlay, gradient from solid navy on left fading right). Left-aligned 768px content column:
   - H1 "Residential Roofing DFW: Quality You Can Trust, Response When You Need It." in white, ~72px, font-black. **NEUTRALIZE — drop "DFW".**
   - Subhead in slate-400, 24px, normal weight: "From emergency storm repairs to planned premium replacements, we protect what matters most."
   - Two CTAs: red `Emergency Roof Repair` (red-700 fill, white text) + outline `Plan Your New Roof` (white outline, white text).

3. **Trust strip** (gray-200 band, ~80 tall). Centered row of four credentials: ★ Google 4.9/5 (240+ Reviews) · BBB A+ ACCREDITED · GAF MASTER ELITE® · CERTIFIED OWENS CORNING. Inter bold 16px slate-900.

4. **Dual feature cards** (1216 wide, two stacked tiles each ~500 tall in the Figma — likely a 2-up grid in production). Each tile: full-bleed photo with left-darkening gradient, content bottom-left.
   - Card 1 (red badge "URGENT RESPONSE"): "Roof Damage? We're on it in 48 hours" + "Immediate tarping and expert damage assessment for storm-hit DFW homes." → "Request Inspection →". **NEUTRALIZE — drop "DFW homes".**
   - Card 2 (slate-900 badge "PREMIUM UPGRADE"): "Planning Your Dream Roof" + "Consultative approach to material selection and long-term exterior protection." → "View Materials →".

5. **Specialized Residential Services band** (`stone-100` background, py-24). Centered title "Specialized Residential Services" + subhead "Expert installation of premium materials tailored to the North Texas climate." **NEUTRALIZE subhead — drop "North Texas climate".** 6 service cards in a 3×2 (presumably) grid: Asphalt Shingles · Metal Roofing · Tile & Clay · Natural Slate · Gutters · Siding. Each card: 192-tall image, 24px padded white tile with bold name + small slate-600 description. (One Texas-specific phrase: "popular choice for DFW homes" → drop. "maximum Texas storm runoff" → broaden to "heavy storm runoff in any climate.")

6. **Local Experts proof block** (1216 wide, white background presumably). H2 "Local Experts, Not 'Storm Chasers'" + body "We live and work in the DFW Metroplex. While out-of-state 'storm chasers' flood the area after a hail storm, we've been here for over 15 years, providing permanent warranties and reliable local service." → **REWRITE** to "Local across five states — Texas, Colorado, Kansas, Missouri, and Georgia. Out-of-state 'storm chasers' chase hail; we stay where we live, with crews based in every market we serve." Two stat callouts in red-700 font-black: 15+ YEARS / 2,500+ HOMES PROTECTED. To the right: testimonial card on `blue-950` rounded-xl: 5 yellow stars, paragraph quote in white 20px, avatar + "Michael S., Frisco, TX Resident". → **REPLACE testimonial city** with cross-market mix; keep the quote framing but use a real testimonial.

7. **Our Seamless Process strip** (full-bleed `slate-900`, py-24, white text). Centered title + subhead. Below: 4-column horizontal connector with red-700 circle (icon) + slate-800 circles (icons) on a horizontal line. Steps: Free Inspection · Detailed Proposal · Expert Installation · Warranty & Follow-Up. Subtitle each. National-friendly copy already.

8. **Residential Case Studies** (white section, py-24). Title left + "View Project Gallery" link top-right with red underline. Three project tiles each ~384 tall: red eyebrow city · bold project title · italic quote.
   - Currently: PLANO TX "Storm Restoration Project" / SOUTHLAKE TX "Modern Metal Upgrade" / MCKINNEY TX "Custom Tile Replacement". → **REPLACE all three** with one project per region (pick three of TX/CO/KS/MO/GA), keep the project-type variety (storm restoration · metal upgrade · tile/slate).

9. **Transparent Pricing & Easy Financing** (gray-200 band, py-24). Left: ~514×514 rounded image (presumably a desk/blueprint photo). Right column: H2 "Transparent Pricing & Easy Financing" + paragraph + 3 emerald checkmark bullets (0% Interest Financing Options · Insurance Deductible Assistance · Detailed Line-Item Estimates) + slate-900 CTA "Learn About Financing". Already national-friendly.

10. **Residential Roofing FAQ** (768 wide centered column, py-24). Title + subhead "Answers to common questions from North Texas homeowners." → **NEUTRALIZE subhead.** Four collapsed accordion rows: roof replacement timing · insurance after hail · warranty · repair vs. replace.

11. **Final CTA** (full-bleed `blue-950`, py-24, ghost residential photo at 10% opacity). Centered 896-wide content column. H2 "Your roof protects everything underneath it. Let's make sure it's right." + slate-400 subhead + two large CTAs: red "Schedule My Free Inspection" + white "Call (214) 555-0199". → **REPLACE phone number** with the right routing number per geo, OR use a routing form / national tracking number.

12. **Footer** (`blue-950`, py-16). Stacked columns: Pro Exteriors brand block + "DFW's most trusted name in residential and commercial roofing since 2009." → **REWRITE** as multi-state. Three column groups: OUR SERVICES (Roofing Repair · Siding Installation · Window Replacement · Emergency Tarps) · RESOURCES · LEGAL. "DFW SERVICE CENTER · 1200 Commerce St, Dallas, TX 75202" → **REPLACE** with HQ + branch list (Richardson TX, Euless TX, Greenwood Village CO, Wichita KS, Kansas City MO, Atlanta GA satellite). Bottom bar: © 2024 Pro Exteriors — note: should be © 2026 in production.

## Layout-skill instruction summary

- **Preserve:** structural composition, section order, dual-CTA hero pattern, 6-card service grid, 4-step process strip with horizontal connector, 3-card case study triptych, financing band layout, accordion FAQ, full-bleed final CTA pattern, footer column structure.
- **Replace:** every literal DFW / North Texas / Frisco / Plano / Southlake / McKinney / Texas-only phrasing. Source of truth for new strings is the copywriter manifest (`copy.yaml`), NOT this Figma.
- **Recompose:** case study triptych geo-mix; testimonial city; footer address block (HQ + branches).
- **Rebuild from token canon:** every Tailwind color literal in the Figma dump (e.g. `blue-950`, `red-700`, `stone-100`) must map back to the semantic role tokens in `/tech/DESIGN.md`. Layout skill is forbidden from emitting raw Tailwind color literals in component files.
