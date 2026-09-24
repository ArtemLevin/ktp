# Spatial / 3D geometry rendering layer

## Purpose

`geometry/spatial-scene.js` is the reusable zero-build rendering layer for stereometry in KTP 3.0. It supplements the existing 2D `geometry-scene.js`; it does not replace it.

The layer solves one narrow problem: **turn mathematically defined 3D scene data into a stable, accessible 2D SVG projection** for topic pages, lesson pages, print and future digital labs.

## Core separation

```text
3D geometry data
    ↓
mathematical helpers (distance / dot / cross)
    ↓
camera projection
    ↓
SVG presentation
```

The source geometry is authoritative. Screen coordinates are presentation only.

### Invariant

Never derive a mathematical length, angle, parallelism or perpendicularity from projected SVG coordinates.

A spatial drawing is generally distorted. The same 3D segment may have different projected lengths after camera changes.

## Scene contract

```js
{
  title: "Куб ABCDA₁B₁C₁D₁",
  ariaLabel: "Куб с выделенным пространственным отрезком",
  viewBox: [0, 0, 420, 290],

  camera: {
    yaw: -35,      // degrees
    pitch: 25,     // degrees
    scale: 62,
    origin: [210, 150]
  },

  points: {
    A: [0, 0, 0],
    B: [2, 0, 0],
    C: [2, 2, 0],
    D: [0, 2, 0],
    A1: [0, 0, 2]
  },

  labels: {
    A: {dx: -12, dy: 14},
    D: false
  },

  objects: [
    {type: "face", points: ["A","B","C","D"], style: "aux"},
    {type: "segment", points: ["A","B"]},
    {type: "segment", points: ["D","C"], visibility: "hidden"},
    {type: "line", points: ["A","C"], extent: 1.5, style: "emphasis"},
    {type: "ray", points: ["A","A1"], extent: 2}
  ],

  caption: "Штриховая линия означает невидимое ребро."
}
```

## Coordinates

Every named point is an array **[x, y, z]** in a right-handed Cartesian model.

The default renderer uses an orthographic/axonometric camera. Camera values change only presentation:

- `yaw` — rotation around the vertical spatial axis;
- `pitch` — elevation of the view;
- `scale` — SVG scale;
- `origin` — projection centre in the SVG viewBox.

No perspective division is used in the foundation runtime. This is deliberate: school stereometric drawings are schematic parallel projections, and orthographic projection produces predictable lines without perspective convergence.

## Primitive types

### `segment`

Finite spatial segment defined by two named 3D points.

### `line`

Visual continuation of the direction through two named points. `extent` controls only how far the line is drawn; the mathematical line remains infinite.

### `ray`

Visual ray from the first point through the second. The renderer adds an arrowhead.

### `polyline`

Ordered broken line. Set `closed:true` to close the outline.

### `face`

A polygonal face. Faces are depth-sorted for visual readability.

### `plane`

A translucent polygonal patch representing part of an infinite plane. The patch is only a visual carrier; it must never be interpreted as the whole plane.

## Visibility

Hidden-edge inference is intentionally **not automatic** in the foundation.

```js
{type:"segment", points:["D","C"], visibility:"hidden"}
```

This gives the content author explicit mathematical control and prevents projection-specific heuristics from turning a valid spatial configuration into a misleading drawing.

## Styles

Stable semantic style names:

- `main` — ordinary construction;
- `aux` — auxiliary object;
- `emphasis` — object currently discussed;
- `hidden` — produced by `visibility:"hidden"`.

Content data should describe meaning, not CSS declarations.

## Mathematical helpers

`window.KTP_SPATIAL` exposes:

- `projectPoint(point, camera)`;
- `distance3(a, b)`;
- `dot3(a, b)`;
- `cross3(a, b)`;
- `norm3(v)`;
- `unit3(v)`;
- `renderAll()`.

These helpers support later QA/labs while keeping metric logic in 3D.

Example invariant:

```js
KTP_SPATIAL.distance3([0,0,0],[1,2,2]) === 3
```

The result remains 3 for every camera.

## Topic integration

Topic content may expose:

```js
spatialScenes: {
  "cube-section": { ... }
}
```

The HTML contains:

```html
<span data-spatial-scene="cube-section"></span>
<script src="../../geometry/spatial-scene.js"></script>
```

## Lesson integration

A lesson series may expose `S.spatialScenes`.

Theory/example items use the explicit key `spatialFigure`:

```js
{
  title: "Скрещивающиеся прямые",
  html: "...",
  spatialFigure: "skew-lines"
}
```

`geometry/lesson-spatial.js` injects the slot after lesson content has rendered; `spatial-scene.js` then draws it.

The separate key avoids ambiguity with the existing planar `figure` contract.

## Accessibility and responsive rules

Every rendered figure:

- has `role="img"`;
- has an `aria-label` from `ariaLabel` or `title`;
- keeps internal SVG decorative to assistive technology;
- scales to the container;
- has no horizontal overflow at 390 px;
- has a print-safe representation.

A scene that fails to render degrades to a readable error message instead of breaking the page.

## What is intentionally out of foundation

Not implemented until a concrete lesson/lab needs it:

- free mouse orbit controls;
- WebGL/Three.js;
- perspective camera;
- automatic hidden-surface removal;
- automatic construction of perpendicular/parallel marks in 3D;
- measurement from projected pixels;
- collision/physics;
- heavy external libraries.

For static school stereometry, SVG + data-driven projection keeps the dependency surface small and allows print/PDF output. A future interactive lab may wrap the same 3D data with controls without changing the educational content schema.

## Review checklist for a new scene

1. Are all mathematical points true 3D coordinates?
2. Does the scene remain correct after changing camera yaw/pitch?
3. Are hidden edges explicitly marked?
4. Are auxiliary objects visually subordinate?
5. Does the caption explain any nonstandard convention?
6. Is every claimed metric fact computed from 3D data?
7. Is the scene readable at 390 px and in print?
8. Does the drawing illustrate the theorem without visually assuming its conclusion?
