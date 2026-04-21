# 📊 CATALOG-ANÁLISIS — v5.2 → SvelteKit

> Análisis profundo del catalog (vanilla JS v5.2) para migrar features a store (SvelteKit).
> NO copiar código. Reconstruir con Svelte signals + componentes reactivos.

---

## Arquitectura: Old vs New

| Aspecto | Catalog (v5.2) | Store (SvelteKit) |
|---|---|---|
| Framework | Vanilla JS + esbuild | SvelteKit + Vite |
| State | `state.js` global object | Svelte stores ($state, $derived) |
| DOM | `getElementById`, innerHTML | Svelte templates, {#each}, bind: |
| Events | `window.onclick`, inline `onclick=""` | Svelte event handlers |
| Routing | Hash router (`#/beat/id`) | File-based (`/beat/[id]`) |
| Build | Custom esbuild script | Vite (incluido) |
| Deploy | Cloudflare Pages | Cloudflare Pages (mismo) |
| Firebase | Compat SDK v8 | Modular SDK v9+ |
| Admin | Iframe + postMessage bridge | Misma app, ruta `/admin` |
| CSS | Global + inline styles | Scoped Svelte + tokens globales |

---

## Features del Catalog — Inventario Completo

### 🎵 TIENDA (Público)

#### 1. Audio Player (`player.js` — 247 líneas)
- Play/pause/prev/next/seek/volume
- Track plays vía Firebase transaction
- Auto-next al terminar
- EQ visualizer animado
- Barra de progreso (desktop + modal)
- Waveform progress sync
- **Portar:** ✅ → `Player.svelte` + `playerStore`

#### 2. Beat Cards (`cards.js` — 380 líneas)
- Card con imagen, nombre, BPM, key, genre, tags
- Play hint overlay
- Wishlist button (♡/♥)
- Precio "desde" con MXN/USD
- "Ver licencias" CTA
- Featured badge
- **Card Style Engine** (601 líneas — la parte más compleja):
  - Merge global + per-beat + custom styles
  - **Glow:** 5 tipos (active, rgb, pulse, breathe, neon)
  - **Animations:** 30+ tipos (flotar, holograma, glitch, cambio-color, etc.)
  - **Hover FX:** scale, brightness, saturate, blur, sibling blur, hue-rotate
  - **Filters:** brightness, contrast, saturate, grayscale, sepia, hue, invert
  - **Border:** width, style, color, per-beat
  - **Shadow:** inset, x/y, blur, spread, color, opacity
  - **Transform:** rotate, scale, skew, translate
  - **Shimmer:** overlay animado
  - **Blur FX:** aura, ripple
- **Portar:** ✅ → `BeatCard.svelte` + `cardStyleEngine.ts` (adaptar, simplificar)

#### 3. Filtros (`filters.js` — 224 líneas)
- Genre buttons (horizontal scroll en mobile)
- Key dropdown
- Mood/Tag dropdown
- Search input con clear
- Sort (8 opciones: newest, oldest, name-az/za, bpm-asc/desc, price-asc/desc)
- Tag cloud (expandible, popular tags por frecuencia)
- Active filter tags (removibles individualmente)
- "Limpiar todo" button
- Contador de beats filtrados
- No-results state
- **Portar:** ✅ → `Filters.svelte` + `TagCloud.svelte`

#### 4. Waveform (`waveform.js` — 130 líneas)
- Genera SVG desde audio (AudioContext + analyser)
- Cache en localStorage
- Render en card como SVG clip-path
- **Portar:** ✅ → `Waveform.svelte` + store (lazy load)

#### 5. Effects (`effects.js` — 180 líneas)
- **Cursor glow** — lerp suave (0.08 factor)
- **Scroll progress** — barra 2px en top
- **Hero parallax** — translateY + opacity al scrollear
- **Scroll-aware nav** — hide on scroll down, show on scroll up
- **3D tilt en cards** — perspective + rotateX/Y basado en mouse
- **Sibling blur** — JS-driven (throttled, performant)
- **Staggered reveal** — IntersectionObserver con delay escalonado
- **EQ visualizer** — barras random cada 120ms
- **Animated counter** — count up animation
- **Portar:** ✅ → Svelte actions (`use:parallax`, `use:tilt`, `use:cursorGlow`)

#### 6. Settings/Content (`settings.js` — 280 líneas)
- **Hero builder** — título con glow/stroke, subtitle, eyebrow, gradient
- **Text colorizer** — segmentos coloreados en título
- **Social links** — WhatsApp, Instagram, email
- **Banner** — 5 animaciones (scroll, fade-pulse, bounce, glow-pulse, static)
- **Custom links** — header, hero, footer locations
- **Floating elements** — imágenes/texto posicionados libremente
- **Testimonials** — grid con stars
- **Brand/Logo** — URL, width, height, rotation, scale, text toggle
- **Section divider** — título con glow, subtitle
- **Portar:** ✅ → Settings store + componentes dinámicos

#### 7. Theme System (`theme.js` — 230 líneas)
- **50+ CSS variables** editables desde admin
- **Light mode** toggle + sync
- **Glow system** — color, intensity, blur, animation presets
- **Font loading** — Google Fonts dinámico
- **Particles** — count, speed, type, color, opacity
- **Animation presets** — per-element (logo, title, player, cards, buttons)
- **Card effects** — opacity, shadow, blur, radius
- **Layout** — section padding, beat gap, hero margin
- **Blend modes** — orbs, grain, waveform
- **Portar:** ✅ → `theme.ts` (ya existe) + Firebase store (Bloque 2)

#### 8. Modal (`modal.js` — 145 líneas)
- Beat detail con imagen, nombre, metadata
- Licenses grid (tipo, precio MXN/USD)
- Player integrado
- WhatsApp purchase CTA
- Navigation entre beats
- Deep link via hash
- **Portar:** ✅ → `BeatModal.svelte` (expandir Modal.svelte existente)

#### 9. Wishlist (`wishlist.js` — 111 líneas)
- localStorage persist
- Badge counter en nav
- Toggle por beat
- Lista completa (panel/overlay)
- WhatsApp share con lista formateada
- **Portar:** ✅ → `wishlistStore` + `WishlistPanel.svelte`

#### 10. Analytics (`analytics.js` — 72 líneas)
- Debounced event tracking
- Batch flush a Firebase
- Play/click/view/wa counters
- **Portar:** ✅ → `analyticsStore`

#### 11. Live Edit Bridge (`live-edit.js` — 121 líneas)
- postMessage admin↔store (iframe)
- ACK confirmation
- Buffer updates
- Batch apply
- **Portar:** ⚠️ No necesario si admin es misma app (pero útil para preview live)

#### 12. Audio Error Recovery (`main.js` inline — ~30 líneas)
- Retry con delay (2s)
- Timeout (10s)
- Visual feedback (red glow)
- Toast notification
- **Portar:** ✅ → player store

#### 13. Hash Router (`hash-router.js` — 91 líneas)
- Deep links `#/beat/id`
- Browser back/forward
- Copy link button
- Title update
- **Portar:** ❌ SvelteKit file routing reemplaza esto

#### 14. Cross-tab Sync (`main.js` inline — ~20 líneas)
- localStorage events para theme, emojis, floating
- **Portar:** ✅ → Svelte + Firebase realtime (reemplaza localStorage bridge)

---

### 🔧 ADMIN (Panel de control)

#### Core
| Módulo | Líneas | Función | Portar |
|---|---|---|---|
| `firebase-init.js` | 499 | Auth, Firebase init, bootstrapping | ✅ Auth store |
| `helpers.js` | — | Utils compartidas | ✅ utils |
| `core.js` | — | Undo/redo, auto-save, preview bridge | ✅ UndoStore + autosave |
| `click-handler.js` | — | Event delegation | ❌ Svelte events |
| `state.js` | — | Admin state | ✅ Svelte $state |

#### Theme
| Módulo | Líneas | Función | Portar |
|---|---|---|---|
| `colors.js` | — | Color pickers | ✅ ThemeEditor |
| `fonts.js` | — | Font selector | ✅ ThemeEditor |
| `glow.js` | 145 | Glow controls | ✅ ThemeEditor |
| `gradient.js` | 141 | Gradient editor | ✅ ThemeEditor |
| `theme-presets.js` | — | Presets save/load | ✅ ThemeEditor |
| `theme-io.js` | — | Import/export theme | ✅ ThemeEditor |
| `particles.js` | — | Particle config | ✅ ThemeEditor |

#### Beats
| Módulo | Líneas | Función | Portar |
|---|---|---|---|
| `beats.js` | 460 | CRUD completo | ✅ BeatsAdmin |
| `beat-preview.js` | 423 | Preview en admin | ✅ BeatsAdmin |
| `beat-presets.js` | 274 | Card style presets | ✅ BeatsAdmin |
| `beat-card-style.js` | 144 | Per-beat card style | ✅ BeatsAdmin |
| `beat-live-preview.js` | 208 | Live preview | ✅ BeatsAdmin |
| `beat-licenses.js` | — | License editor | ✅ BeatsAdmin |
| `beat-inline-edit.js` | — | Quick edit | ✅ BeatsAdmin |

#### Card System
| Módulo | Líneas | Función | Portar |
|---|---|---|---|
| `card-global.js` | 165 | Global card style | ✅ CardEditor |
| `card-style-ui.js` | 288 | Card style UI | ✅ CardEditor |
| `card-effect-presets.js` | 192 | Effect presets | ✅ CardEditor |

#### Content
| Módulo | Líneas | Función | Portar |
|---|---|---|---|
| `hero-preview.js` | 191 | Hero live preview | ✅ ContentEditor |
| `text-colorizer.js` | 196 | Visual text editor | ✅ ContentEditor |
| `floating.js` | 148 | Floating elements | ✅ ContentEditor |
| `gallery.js` | 301 | Image gallery | ✅ ContentEditor |
| `emojis.js` | — | Custom emojis | 🟡 Bajo |

#### Utilities
| Módulo | Líneas | Función | Portar |
|---|---|---|---|
| `cmd-palette.js` | — | Ctrl+K command palette | 🟡 Bajo |
| `qr.js` | — | QR generator | 🟡 Bajo |
| `export.js` | 160 | Export data | ✅ Backup |
| `trash.js` | 183 | Soft delete + restore | ✅ BeatsAdmin |
| `snapshots.js` | 195 | Theme snapshots | 🟡 Medio |
| `undo.js` | — | Undo/redo | ✅ Core |
| `autosave.js` | — | Auto-save | ✅ Core |
| `fullscreen.js` | — | Preview fullscreen | 🟡 Bajo |
| `changelog.js` | — | Change log | 🟡 Bajo |
| `resize.js` | — | Panel resize | 🟡 Bajo |
| `features.js` | — | Feature toggles | ✅ Settings |
| `preview-sync.js` | 170 | Preview sync | ✅ Preview |
| `preview-resize.js` | — | Preview resize | 🟡 Bajo |
| `preview-live.js` | — | Live preview | ✅ Preview |
| `r2.js` | — | Cloudflare R2 upload | ✅ Upload |

---

## Diseño Visual — Dirección

### Del catalog actual (dark + rojo):
- Fondo: `#060404` a `#0a0a0a` (casi negro con tinte rojo)
- Accent: `#dc2626` (rojo) — **CAMBIAR a la paleta del usuario**
- Surface: `#0f0808` (negro con tinte rojo oscuro)
- Grain overlay
- Floating orbs difusos
- Glassmorphism nav
- Glow effects prominentes

### Para store (mejorado, misma línea):
- Fondo: dark con tono rojo profundo (no puro negro)
- Accent: configurable (default rojo intenso)
- Efectos: glow, grain, orbs (heredados del catalog)
- Cards: hover effects, glow, shimmer
- Tipografía: Syne (display) + Space Grotesk (body) + DM Mono (code)
- **Más pulido, más responsive, más performant**

---

## Bloques Expandidos (Plan v2)

Ver PROJECT_STATE.md para el plan completo con subtareas.
