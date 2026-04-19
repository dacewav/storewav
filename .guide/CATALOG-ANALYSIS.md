# 📖 CATÁLOGO — Análisis Profundo (v5.2)

> Revisión exhaustiva del proyecto catalog para entender qué funciona,
> qué está roto, y qué debemos MIGRAR vs DESCARTAR al nuevo store.

---

## Arquitectura del Store (index.html + src/)

### Módulos y sus responsabilidades

| Módulo | Líneas aprox | Qué hace | Calidad |
|--------|-------------|----------|---------|
| `main.js` | ~200 | Entry point. Wira módulos, expone globals, keyboard shortcuts, cross-tab sync, audio error recovery, inspector | ⭐⭐⭐⭐ Bueno |
| `state.js` | ~35 | Estado global único. Firebase ref, beats[], settings, theme, filters, wishlist, waveform cache | ⭐⭐⭐ Bien pero mezcla concerns |
| `player.js` | ~200 | Audio player (AP object). Play/pause/prev/next/seek/volume. Track plays via Firebase. UI por getElementById | ⭐⭐⭐⭐ Bueno, acoplado a DOM |
| `cards.js` | ~400+ | Render de beat cards. CardStyle engine complejo (glow, animaciones, filtros). HTML inline | ⭐⭐⭐⭐⭐ Muy completo pero denso |
| `settings.js` | ~300+ | Hero builder, brand, banner, social links, custom links, floating elements | ⭐⭐⭐⭐ Muy potente, mezcla admin stuff |
| `theme.js` | ~150 | Aplica tema a CSS vars. Light/dark toggle. Firebase sync. Cambio detection para particles/animaciones | ⭐⭐⭐⭐ Bien |
| `filters.js` | ~150 | Genre buttons, key/mood selects, search, tag cloud, sort (8 opciones), active filter tags | ⭐⭐⭐⭐⭐ Completo |
| `waveform.js` | ~120 | Genera waveform desde audio (AudioContext), cache en localStorage, SVG output | ⭐⭐⭐⭐ Funcional pero pesado |
| `effects.js` | ~250 | Cursor glow (lerp), scroll progress, hero parallax, scroll-nav hide, 3D tilt, staggered reveal, EQ animation | ⭐⭐⭐⭐⭐ Excelentes efectos |
| `live-edit.js` | ~150 | Bridge postMessage admin↔store. ACK confirmation, buffering, batch updates | ⭐⭐⭐⭐⭐ Clave para admin real-time |
| `hash-router.js` | ~100 | Deep links #/beat/<id>, browser back/forward, copy-link button, title update | ⭐⭐⭐⭐ Bien pero hash-based |
| `analytics.js` | ~80 | Event tracking con debounce, batch flush a Firebase, counters | ⭐⭐⭐⭐ Bien |
| `wishlist.js` | ~100 | Favoritos en localStorage, badge counter, WhatsApp share | ⭐⭐⭐⭐ Simple y funcional |
| `error-handler.js` | ~50 | Logging centralizado, error recovery | ⭐⭐⭐⭐ Bien |
| `utils.js` | ~100 | hexRgba, loadFont, formatTime, safeJSON, debounce, esc, applyAnim | ⭐⭐⭐⭐ Funciones puras |
| `card-style-engine.js` | ~100 | Merge de card styles (global + per-beat + custom) | ⭐⭐⭐⭐ Motor de estilos |

### Flujo de datos del Store

```
Firebase RTDB
    ↓ onValue()
state.js (state.allBeats, state.siteSettings, state.T)
    ↓
main.js boot:
    1. initAllEffects()
    2. initThemeSync() → applyTheme() → CSS vars
    3. Firebase ref('beats') → state.allBeats → renderAll()
    4. Firebase ref('settings') → state.siteSettings → applySettings()
    5. Firebase ref('theme') → state.T → applyTheme()
    6. initLiveEditBridge()
    7. initAnalytics()
```

### Estructura Firebase (inferida del código)

```
beats/
  {beatId}/
    name: string
    genre: string
    bpm: number
    key: string (ej: "Cm")
    tags: string[]
    imageUrl: string
    audioUrl: string
    previewUrl: string
    licenses: [{type, priceMXN, priceUSD, ...}]
    cardStyle: {filter, glow, anim, style, border, shadow, hover, transform}
    order: number
    plays: number
    clicks: number
    views: number
    waClicks: number
    createdAt: number

settings/
  siteName: string
  heroTitle: string
  heroSubtitle: string
  whatsapp: string
  instagram: string
  bannerActive: boolean
  bannerText: string
  bannerAnim: string
  heroLinks: [{label, url, icon}]
  floatingElements: [{...}]

theme/
  bg, surface, surface2, accent, text, muted, hint, border, border2, red
  glowColor, glowBlur, glowIntensity
  cardOpacity, blurBg, grainOpacity, radiusGlobal
  heroTitleCustom, heroGlowOn, heroGlowInt, heroStrokeOn, etc.
  logoUrl, logoWidth, logoHeight, logoRotation
  fontDisplay, fontBody
  lightMode: boolean
  (y muchos más — tema MUY extensible)

analytics/
  events/{date}/{eventId}
  counts/{beatId}/{clicks, views, waClicks}
  daily/{date}/total

customEmojis: [{name, url, height}]
```

---

## Arquitectura del Admin (admin.html + admin/)

### Estado actual

- **`admin.html`** — ~2000+ líneas de HTML con scripts inline
- **`admin-main.js`** — Stub que importa módulos de `admin/` directory
- **Módulos admin/** — colors, fonts, nav, text-colorizer, QR, cmd-palette, resize, beat-preview, beats, card-global, beat-live-preview, r2, features, trash, gallery, click-handler, firebase-init

### El problema del Admin

1. **Scripts inline** — El HTML tiene <script> tags que cargan ANTES que el bundle modular. Condiciones de carrera.
2. **No comparte state** — El admin tiene su propio manejo de estado, separado del store.
3. **Firebase init duplicado** — `firebase-init.js` inicializa Firebase otra vez.
4. **Window globals** — Todo se cuelga en `window` para que los onclick inline funcionen.
5. **Live edit bridge** — Es la ÚNICA conexión real-time entre admin y store, via postMessage a un iframe.

### Flujo admin → store (cómo se reflejan los cambios)

```
Admin edita un beat
    ↓
Admin escribe a Firebase RTDB (beats/{id}/...)
    ↓
Store tiene onValue(ref('beats')) → se actualiza automáticamente
    ↓
BONUS: Admin también envía postMessage al iframe del store
    → Store recibe en live-edit.js → actualiza state directamente
    → Esto es MÁS RÁPIDO que esperar Firebase
```

### Features del Admin (de admin-main.js)

| Módulo | Función |
|--------|---------|
| `colors.js` | Editor de colores con color picker |
| `fonts.js` | Selector de fonts |
| `nav.js` | Navegación del admin |
| `text-colorizer.js` | Editor visual de texto con colores |
| `qr.js` | Generador de QR |
| `cmd-palette.js` | Command palette (Ctrl+K) |
| `resize.js` | Resize de paneles |
| `beat-preview.js` | Preview de beats en admin |
| `beats.js` | CRUD completo de beats |
| `card-global.js` | Editor de card styles globales |
| `beat-live-preview.js` | Preview en vivo de cambios |
| `r2.js` | Cloudflare R2 upload |
| `features.js` | Features toggles |
| `trash.js` | Papelera / recuperación |
| `gallery.js` | Gestor de imágenes |

---

## Lo que SÍ funciona bien (migrar al nuevo store)

| Feature | Por qué funciona | Cómo migrar |
|---------|-----------------|-------------|
| Player (AP object) | Completo, auto-next, play tracking | Portar como Svelte component + store |
| Filters system | Género, key, mood, search, sort, tag cloud | Portar como Svelte component |
| Effects (cursor, parallax, tilt) | Muy pulidos, performantes | Portar como Svelte actions/directives |
| Waveform SVG | Cache + SVG render, buen UX | Portar como Svelte component |
| Live edit bridge (postMessage) | ÚNICO puente real-time admin↔store | Mejorar con Svelte reactivity |
| Analytics (batched) | Debounced, batched, Firebase | Portar como Svelte store |
| Wishlist | Simple, localStorage, WhatsApp share | Portar como Svelte store |
| Card style engine | Muy completo (glow, anim, filters) | Simplificar para v1, expandir después |
| Hero builder | Configurable, con glow/stroke/segments | Portar como Svelte component |
| Cross-tab sync | localStorage events | Reemplazar con Svelte stores + Firebase |
| Hash router | Deep links, copy-link, title update | Reemplazar con SvelteKit file routing |
| Skeleton loading | Placeholder cards mientras carga | Portar como Svelte component |
| Audio error recovery | Retry logic, timeout handling | Portar |

## Lo que NO funciona (descartar o reescribir)

| Feature | Problema | Solución en nuevo store |
|---------|----------|----------------------|
| Window globals para onclick | Acopla todo al DOM global | Svelte events + component props |
| getElementById en player | Frágil, depende de IDs exactos | Svelte bind:this |
| Inline scripts en admin.html | Race conditions, no modular | Todo en SvelteKit routes |
| Firebase compat SDK | Pesado, no tree-shakeable | Firebase modular SDK (v9+) |
| esbuild custom build | Limitaciones de SSR/HMR | Vite (incluido con SvelteKit) |
| localStorage como bridge | No confiable, desincroniza | Firebase onValue() directo |
| CSS externo sin procesar | No purge, no scope | Svelte scoped styles + tokens |
| Cache busting manual (hashFile) | Propenso a errores | Vite lo hace automático |

---

## Features del Admin que DEBEMOS replicar

| Feature Admin | En catalog | En nuevo store |
|--------------|-----------|---------------|
| CRUD beats | beats.js (inline) | /admin/beats SvelteKit route |
| Color picker | colors.js | /admin/settings color inputs |
| Font selector | fonts.js | /admin/settings font dropdown |
| Card style editor | card-global.js | /admin/settings card section |
| Gallery de imágenes | gallery.js | /admin/gallery SvelteKit route |
| Beat live preview | beat-live-preview.js | iframe + Firebase onValue |
| Text colorizer | text-colorizer.js | Rich text editor component |
| Command palette | cmd-palette.js | Keyboard shortcut + modal |
| QR generator | qr.js | /admin/tools/qr |
| Import/Export | inline scripts | /admin/settings import/export |
| Undo/Redo | inline scripts | History stack in Svelte store |
| Auto-save | inline scripts | Debounced Firebase writes |

---

## Errores de diseño que encontré

1. **state.js mezcla Firebase refs con UI state** — `db` y `allBeats` son diferentes concerns
2. **player.js depende de IDs de DOM** — `getElementById('track-fill')` es frágil
3. **settings.js tiene lógica de admin** — `heroTitleSegments` del colorizer admin está en el store
4. **waveform.js descarga audio completo** — Para generar waveform, baja el archivo entero. Costoso.
5. **live-edit.js tiene postMessage Y Firebase** — Dos caminos para lo mismo. Confuso.
6. **no hay error boundaries** — Si un módulo falla, toda la app crashea
7. **analytics escribe directo a Firebase** — Sin cola persistente. Si pierdes conexión, pierdes eventos.
8. **wishlist solo vive en localStorage** — No se sincroniza entre dispositivos.

---

*Análisis completado: 2026-04-19*
