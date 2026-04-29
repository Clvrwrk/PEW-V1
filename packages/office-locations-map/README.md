# @proexteriors/office-locations-map

Interactive SVG map of Pro Exteriors office locations and licensed service areas. Drops into any React app and goes **US map → state tier → office pin → full contact card** with hover lift, twist-pin animation, and keyboard/screen-reader support.

Three state tiers (active / licensed / not serviced), two pin types (brick & mortar / satellite), and real `geoAlbersUsa` projection — Alaska and Hawaii included in the composite.

## Install

This package is private (Git / tarball / folder install only).

```bash
# install from a local checkout
npm install /path/to/packages/office-locations-map

# or from a tarball (produce one with `npm pack` inside this folder)
npm install /path/to/proexteriors-office-locations-map-0.1.0.tgz

# peer dependencies
npm install react react-dom d3-geo topojson-client
```

## Quick start

```jsx
import OfficeLocationsMap from "@proexteriors/office-locations-map";

export default function LocationsPage() {
  return <OfficeLocationsMap />;   // bundled Pro Exteriors roster
}
```

With custom data:

```jsx
import OfficeLocationsMap from "@proexteriors/office-locations-map";

const offices = [
  {
    id: "richardson-tx",
    type: "brick",
    name: "Richardson, TX",
    state: "TX",
    address: "1778 N Plano Rd #118, Richardson, TX",
    phone: "(469) 535-1708",
    phoneHref: "tel:+14695351708",
    email: "Office@proexteriorsus.com",
    hours: "Mon–Sat 7am–5pm · Sun Closed",
    lat: 32.9483,
    lng: -96.7299,
    accreditation: [],
  },
  // ...
];

<OfficeLocationsMap
  offices={offices}
  activeStates={["TX", "KS", "CO", "GA", "NC", "MO"]}
  licensedStates={["LA", "SC", "OK", "NE", "MN", "MS", "AL", "AR", "TN", "KY"]}
/>
```

Raw source (if you want to fork or copy/paste):

```js
import src from "@proexteriors/office-locations-map/source";
// resolves to the un-transpiled .jsx file
```

## Props

| Prop             | Type                       | Default                          | Purpose                                                  |
|------------------|----------------------------|----------------------------------|----------------------------------------------------------|
| `offices`        | `Office[]`                 | bundled Pro Exteriors roster     | Office data (see shape below).                           |
| `activeStates`   | `Set<string>` \| `string[]` | TX, KS, CO, GA, NC, MO           | USPS abbreviations of states with an active office.      |
| `licensedStates` | `Set<string>` \| `string[]` | LA, SC, OK, NE, MN, MS, AL, AR, TN, KY | USPS abbreviations of licensed service states.     |
| `atlasUrl`       | `string`                   | jsdelivr us-atlas 10m            | Override the states TopoJSON source.                     |
| `width`          | `number`                   | `1100`                           | SVG viewBox width.                                       |
| `height`         | `number`                   | `640`                            | SVG viewBox height.                                      |
| `title`          | `string`                   | `"Where We Work"`                | Header title.                                            |
| `subtitle`       | `string`                   | Service-area sentence            | Header subtitle.                                         |

Full TypeScript types ship in `dist/index.d.ts`.

## Data shape

```ts
interface Office {
  id: string;                      // stable DOM key
  type: "brick" | "satellite";     // pin glyph
  name: string;                    // modal title
  company?: string;                // modal subtitle
  state: string;                   // USPS abbr — must match an activeStates entry
  address: string;
  phone?: string | null;
  phoneHref?: string;              // e.g. "tel:+14695351708"
  email?: string;
  hours?: string;
  manager?: string;
  managerTitle?: string;
  services?: string[];
  accreditation?: { label: string; number: string }[];
  lat: number;                     // WGS84 latitude
  lng: number;                     // WGS84 longitude
}
```

## Peer dependencies

| Dep              | Range |
|------------------|-------|
| `react`          | `>=17` |
| `react-dom`      | `>=17` |
| `d3-geo`         | `^3`   |
| `topojson-client`| `^3`   |

## Geometry

`us-atlas` TopoJSON is loaded from the jsdelivr CDN on mount:

- `states-10m.json` (~160 KB) — one fetch on mount, cached by the browser

No polygon data ships with the package. Override with the `atlasUrl` prop if you prefer to self-host.

## Visual language

| Element                | Color     |
|------------------------|-----------|
| Canvas                 | `#F5F6F8` |
| Active state fill      | `#C22326` (flag red) |
| Active state stroke    | `#11133F` (dark navy) |
| Licensed state fill    | `#11133F` (dark navy) |
| Licensed state stroke  | `#C22326` (flag red)  |
| Not-serviced fill      | `#E4E6EC` |
| Not-serviced stroke    | `#AEAEAE` |
| Modal header           | `#11133F` with `#C22326` 4 px accent |

Brick-and-mortar pins are red teardrops with a white house glyph; satellite pins are navy teardrops with a satellite-dish glyph. On hover, pins twist -14° ⇄ +14° on a 700 ms loop — respected by `prefers-reduced-motion`.

## Accessibility

- WCAG 2.2 AA contrast for text and interactive strokes
- Full keyboard nav (Tab / Enter / Space / Esc) on active-state paths, pins, and the modal close
- Focus management: opening the modal focuses the close button; closing returns focus to the triggering element
- `prefers-reduced-motion` disables the twist animation, hover lift, and modal transitions
- ARIA labels on every interactive region

## Build (for maintainers)

```bash
npm install        # installs esbuild as devDep
npm run build      # writes dist/*.esm.js, *.cjs.js, sourcemaps, copies JSX, and index.d.ts
npm pack           # produces proexteriors-office-locations-map-0.1.0.tgz
```

## Notes & open items

- **Missouri**: currently treated as an active state because the bundled roster includes a Kansas City brick & mortar. The original "located in" list did not include MO — promoted to active based on the physical-office source of truth.
- **GA satellite pin**: lat/lng is an Atlanta placeholder (`33.7490, -84.3880`). Replace when the confirmed satellite address lands.
- **Geometry source**: us-atlas 10m ships state polygons only — switch to `counties-10m.json` and a second `feature()` call if county drill-down is added later.

See `CHANGELOG.md` for version history.
