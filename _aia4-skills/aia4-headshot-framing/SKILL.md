---
name: aia4-headshot-framing
description: >
  Validate and conform Pro Exteriors team headshots to the canonical framing
  standard. Use whenever a new or replacement team/leadership headshot is added,
  when a headshot "looks off" in the team grid (head cut off, too much/little
  headroom, off-center), or when the user asks to check, fix, reframe, or
  standardize headshots. Detects the face, checks it against the tolerance in
  DESIGN.md, and — when a shot has too little headroom to crop — extends the
  canvas via the image connector before reframing.
---

# AIA4 Headshot Framing

Keeps every team headshot on one consistent frame. The standard lives in
`/tech/DESIGN.md` → **Team Headshots**; this skill enforces it.

## The standard (mirrors DESIGN.md)

Measured by OpenCV frontal-face box (brow-to-chin) as a fraction of frame height:

| Metric | Target | Tolerance |
|---|---|---|
| Aspect ratio | 600×448 (4:3) | fixed |
| Face-top headroom | 0.13 | 0.08–0.24 |
| Face height | 0.32 | 0.26–0.44 |
| Face center x | 0.50 | 0.46–0.54 |

Output: `600×448` webp, quality 85, saved into `public/images/team/` using the
exact `Name - Title.webp` convention already in use.

## Workflow

1. **Check.** Run the validator over the headshots in question:
   ```
   python3 _aia4-skills/aia4-headshot-framing/scripts/frame_headshot.py check "public/images/team/"*.webp
   ```
   It prints PASS/FAIL per image with the failing metric (headroom / face-scale / off-center).

2. **Decide the fix per failure.**
   - **Off-center or face-scale only, with room to crop** → go straight to `reframe`; the source has enough pixels.
   - **Headroom too tight** (head jammed against the top edge, `top` below the
     0.08 floor) → the source has nothing to crop into above the head. **Extend
     first** (step 3), then reframe.

3. **Extend the canvas (only when headroom is too tight).** Use the image
   connector to outpaint matching background above the head:
   - `media_upload` the original (prefer the highest-res source in
     `content/Client Docs/Company Headshots/`), PUT the bytes, `media_confirm`.
   - `generate_image` with `nano_banana_pro`, the uploaded image as a `medias`
     reference, `aspect_ratio: "3:4"`, and a prompt that **locks identity**:
     keep face, hair, beard, expression, shirt, and pose identical; add empty
     space and the same blurred office background above the head; photorealistic;
     do not alter the person. Download the result.
   - Always eyeball the extended image for likeness drift before using it.

4. **Reframe** the (extended or original) image to the canonical frame:
   ```
   python3 .../frame_headshot.py reframe <src_image> "public/images/team/<Name - Title>.webp"
   ```
   The script positions the face at headroom 0.13, scales it to ~0.32, centers
   it horizontally, crops to 4:3, resizes to 600×448, and re-reports the
   resulting metrics with a PASS/CHECK verdict.

5. **Verify.** Re-run `check` on the output and view it next to a peer headshot.
   If it's a new team member, add the `{ name, title, file }` row to
   `src/pages/team/index.astro`.

## Requirements

- Python with `opencv-python` (cv2) and `Pillow` — both available in the build VM.
- The image connector (Higgsfield-style `generate_image`) only for the extend step.

## Notes

- The Haar box is brow-to-chin, not the full head; that's fine — every image is
  measured identically, so the framing stays internally consistent.
- Never substitute or invent a headshot. If no usable source exists, flag the
  gap (per CLAUDE.md §9) rather than generating a fictional person.
- Originals in `content/Client Docs/Company Headshots/` are never edited in
  place — the script reads a source and writes a new webp into `public/`.
