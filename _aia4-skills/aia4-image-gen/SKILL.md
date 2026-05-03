---
name: aia4-image-gen
description: Generate visual assets for an AIA4 page build — heroes, supporting shots, photo galleries, case-study heroes, diagrams. Use whenever the user asks to "generate the hero image", "create the gallery shots", "make a hero", "render the case-study image", "generate images for [page-slug]", "produce the visuals", "image the page", or any other request to produce static visual assets for a page going through PageBuilder. This skill is part of Phase 3 (parallel with `aia4-layout`) — it takes the copy manifest, picks the right Higgsfield model per slot (Nano Banana Pro for typography-overlay heroes, GPT Image 2 for editorial supporting, Cinema Studio Image 2.5 for cinematic stills), uses Fal.ai (`/tech/scripts/fal.sh`) for Flux/Recraft when needed, and returns an image manifest. Do NOT use for video (use Higgsfield's `cinematic_studio_video_v2` or `veo3_1` directly), for photo retouching of existing client photos (handle in a separate pass), or for client-supplied imagery (those live in `/brand-assets/client/`).
---

# AIA4 Image-Gen

This skill produces every AI-generated visual on the page. It does not pick layout slots — those come from the Figma blueprint and the layout skill — and it does not write alt text from scratch — alt text is informed by the section copy. Its job is the *render*: pick the right model, write the right prompt, generate, save, and return a manifest.

## When to use this skill

- PageBuilder Phase 3 — generates all images for a page in one batch.
- A QC failure has flagged a missing or off-brand image and only that slot needs re-running.
- The user wants to A/B image directions on an existing page (run twice with different prompt directions).

## When not to use this skill

- The user wants video (use Higgsfield's video models directly: `veo3_1`, `cinematic_studio_3_0`, `seedance_2_0`).
- The user wants to retouch a client-supplied photo (handle in a dedicated photo-edit pass).
- The user wants logo or brand-mark generation (those live in `/brand-assets/`).

## Inputs

Standard specialist input shape (see `references/orchestration-model.md`). Plus:

- **Copy manifest** from `aia4-copywriter` (so the prompt knows what the section is about)
- **Layout slot manifest** from `aia4-layout` (so the prompt knows aspect ratio + size + composition role)
- **Brand photography direction** from `references/brand-photography-direction.md` (real-feel, not stock; on-brand color palette in environmental tones)
- **Client photo inventory** from `/brand-assets/client/_INVENTORY.md` (so we don't AI-generate when a real Pro Exteriors photo exists)

## Workflow

1. **Read inventory first.** Check `/brand-assets/client/_INVENTORY.md` for any real Pro Exteriors photos that match the slot. **CLAUDE.md §9: never use stock photography of "diverse smiling team in hard hats" — every image is real Pro Exteriors work or it doesn't ship.** The corollary: prefer a real photo over an AI-generated one any time we have one. Only generate when no real asset exists.
2. **Map slot to model.** See `references/model-routing.md` for the full table. Defaults:
   - **Hero with text overlay** → `nano_banana_2` (Nano Banana Pro) — best text rendering
   - **Editorial supporting** → `gpt_image_2` — strong on photographic realism + composition
   - **Cinematic stills** (case study heroes, gallery main) → `cinematic_studio_2_5` — film-grade lighting
   - **Diagrams or schema visuals** → `flux_2` with `model: flex`
   - **Marketing-style product cuts** → `marketing_studio_image`
3. **Compose prompt from the recipe.** Pull the right recipe from `references/prompt-library.md` (hero / supporting / gallery / case-study / diagram). Inject section-specific details from copy. Include brand-photography direction (color palette, lighting, environmental fidelity).
4. **Pick aspect ratio.** From the layout slot manifest (16:9 hero, 1:1 bento square, 4:3 case study, 21:9 banner, etc.).
5. **Generate.** Via the Higgsfield MCP for `nano_banana_2` / `gpt_image_2` / `cinematic_studio_2_5` / `flux_2`. Via `/tech/scripts/fal.sh` for Flux variants not in Higgsfield. Save to `design/templates/{slug}/assets/{slot}.{ext}`.
6. **Write alt text.** Descriptive (what's in the image), not promotional. 8–15 words. Reference the section heading where the image lives if it adds context.
7. **Return image manifest.** Each entry: slot id, file path, model used, prompt, alt text, generation timestamp.

## Outputs

An image manifest at `design/templates/{slug}/image-manifest.yaml`. Plus the image files in `design/templates/{slug}/assets/`. The layout skill reads the manifest in Phase 3 to wire `<img>` and `<picture>` elements.

## Brand photography direction (excerpt — full doc in `references/brand-photography-direction.md`)

- **Real-feel always.** Never glossy stock-photo aesthetic. Slightly imperfect — natural shadows, real wear, lived-in surfaces.
- **Environmental color palette.** Mid-day Texas light, deep shadows, natural ground tones. Brand colors appear as accents (a flag-red truck panel, a hunter-green canopy in the background) — never tinted overlays.
- **Real Pro Exteriors crews** when generating people. Working uniforms, safety gear, real expressions. No stock-portrait energy.
- **Commercial-vertical bias** (80% of the engagement). Industrial parks, shopping centers, distribution warehouses, multi-family roofs. Residential is the secondary focus.

## References

- `references/prompt-library.md` — recipes for hero, supporting, gallery, case-study, diagram
- `references/brand-photography-direction.md` — visual brief for AI photo generation
- `references/model-routing.md` — slot-to-model decision tree
- `references/alt-text-guide.md` — accessible alt text patterns

## What this skill does NOT do

- Pick or change layout slots
- Write copy or headlines
- Edit existing client photos
- Generate video (separate concern)
- Generate logos or brand marks
