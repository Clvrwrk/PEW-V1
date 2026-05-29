#!/usr/bin/env python3
"""
frame_headshot.py — Pro Exteriors team-headshot framing tool.

Two modes:
  check    Detect the face and report whether a headshot is within the
           Pro Exteriors framing tolerance (see DESIGN.md "Team Headshots").
  reframe  Crop/resize a (already high-enough) source image to the canonical
           4:3 frame with the target head-top headroom and face scale.

The canonical standard is derived from the compliant team headshots:
  - Aspect ratio : 600 x 448  (4:3, ratio 1.339)
  - Face top      : 0.13 of frame height   (tolerance 0.08 - 0.24)
  - Face height   : 0.32 of frame height   (tolerance 0.26 - 0.44)
  - Face center x : 0.50                    (tolerance 0.46 - 0.54)

"Face" here is the OpenCV Haar frontal-face box (brow-to-chin), not the full
head. The numbers are internally consistent because every headshot is measured
the same way.

If `check` reports a head-top above tolerance (too little headroom) and the
source has no room to crop, the head must be EXTENDED first via the image
connector (outpaint additional background above the head), then `reframe` is
run on the extended image. See SKILL.md for the full workflow.

Usage:
  python3 frame_headshot.py check   <image> [<image> ...]
  python3 frame_headshot.py reframe <src_image> <dest.webp>
"""
import sys, os, cv2

# ── Canonical standard ─────────────────────────────────────────────────────
OUT_W, OUT_H = 600, 448
ASPECT       = OUT_W / OUT_H          # 1.339
TARGET_TOP   = 0.13                   # face-box top as fraction of frame height
TARGET_FACEH = 0.32                   # face-box height as fraction of frame height
TARGET_CX    = 0.50
TOL_TOP      = (0.08, 0.24)
TOL_FACEH    = (0.26, 0.44)
TOL_CX       = (0.46, 0.54)

_casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def detect_face(path):
    img = cv2.imread(path)
    if img is None:
        raise SystemExit(f"cannot read {path}")
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = _casc.detectMultiScale(gray, 1.1, 5, minSize=(int(w * 0.15), int(h * 0.15)))
    if len(faces) == 0:
        return img, w, h, None
    x, y, fw, fh = sorted(faces, key=lambda b: b[2] * b[3])[-1]
    return img, w, h, (int(x), int(y), int(fw), int(fh))


def metrics(w, h, face):
    x, y, fw, fh = face
    return dict(top=y / h, faceH=fh / h, cx=(x + fw / 2) / w)


def in_tol(m):
    return (TOL_TOP[0] <= m["top"] <= TOL_TOP[1]
            and TOL_FACEH[0] <= m["faceH"] <= TOL_FACEH[1]
            and TOL_CX[0] <= m["cx"] <= TOL_CX[1])


def cmd_check(paths):
    bad = 0
    for p in paths:
        _, w, h, face = detect_face(p)
        name = os.path.basename(p)
        if face is None:
            print(f"NO-FACE   {name}"); bad += 1; continue
        m = metrics(w, h, face)
        ok = in_tol(m)
        flags = []
        if not (TOL_TOP[0] <= m["top"] <= TOL_TOP[1]):
            flags.append("headroom" + ("(too tight)" if m["top"] < TOL_TOP[0] else "(too loose)"))
        if not (TOL_FACEH[0] <= m["faceH"] <= TOL_FACEH[1]): flags.append("face-scale")
        if not (TOL_CX[0] <= m["cx"] <= TOL_CX[1]): flags.append("off-center")
        print(f"{'PASS ' if ok else 'FAIL '} {name:55} top={m['top']:.3f} faceH={m['faceH']:.3f} cx={m['cx']:.3f} {' '.join(flags)}")
        bad += 0 if ok else 1
    print(f"\n{len(paths)-bad}/{len(paths)} within tolerance")
    return 1 if bad else 0


def cmd_reframe(src, dest):
    from PIL import Image
    img, w, h, face = detect_face(src)
    if face is None:
        raise SystemExit("no face detected — cannot reframe")
    x, y, fw, fh = face
    face_cx = x + fw / 2
    # crop height so the face fills TARGET_FACEH of the frame
    Hc = fh / TARGET_FACEH
    Wc = Hc * ASPECT
    if Wc > w:                      # not enough width — cap to width
        Wc = w; Hc = Wc / ASPECT
    # prefer centering the face horizontally: limit width so the face can sit
    # at the crop's center rather than being shoved against an edge
    center_max_w = 2 * min(face_cx, w - face_cx)
    if Wc > center_max_w:
        Wc = center_max_w; Hc = Wc / ASPECT
    if Hc > h:                      # not enough height — cap to height
        Hc = h; Wc = Hc * ASPECT
    left = face_cx - Wc / 2
    top = y - TARGET_TOP * Hc
    left = max(0, min(left, w - Wc))
    top = max(0, min(top, h - Hc))
    box = (int(round(left)), int(round(top)), int(round(left + Wc)), int(round(top + Hc)))
    from PIL import ImageOps
    pim = ImageOps.exif_transpose(Image.open(src)).convert("RGB").crop(box).resize((OUT_W, OUT_H))
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    pim.save(dest, "WEBP", quality=85, method=6)
    # report resulting framing
    _, rw, rh, rface = detect_face(dest)
    if rface:
        m = metrics(rw, rh, rface)
        print(f"wrote {dest}  -> top={m['top']:.3f} faceH={m['faceH']:.3f} cx={m['cx']:.3f}  {'PASS' if in_tol(m) else 'CHECK'}")
    else:
        print(f"wrote {dest} (face not re-detected at output size — verify visually)")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__); raise SystemExit(2)
    mode = sys.argv[1]
    if mode == "check":
        raise SystemExit(cmd_check(sys.argv[2:]))
    elif mode == "reframe":
        cmd_reframe(sys.argv[2], sys.argv[3]); raise SystemExit(0)
    else:
        print(__doc__); raise SystemExit(2)
