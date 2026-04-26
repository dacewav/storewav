# 🏗️ MEGA PLAN — Personalización Admin Completa

> **Fecha**: 2026-04-26 (Sesión 43+)
> **Objetivo**: Cubrir TODOS los gaps de personalización en admin. Cada aspecto visual de la tienda debe tener un slider, toggle, o control en el admin.

---

## 📊 AUDIT: Estado Actual vs Lo Que Falta

### ✅ LO QUE YA EXISTE (funcional)

| Área | Controles | Estado |
|------|-----------|--------|
| Theme > Colors | accent, glowColor, bgColor, surfaceColor, textColor | ✅ |
| Theme > Glow | glowActive, intensity, blur, anim, speed | ✅ |
| Theme > Typography | fontDisplay, fontBody, fontWeight, fontSize, lineHeight | ✅ |
| Theme > Spacing | radiusGlobal, sectionPadding, beatGap | ✅ |
| Theme > Cards | cardOpacity, blurBg, grainOpacity, shadowIntensity, shadowColor | ✅ |
| Theme > Opacities | nav, heroBg, section, beatImg, text, btnNormal, btnHover, bg | ✅ |
| Theme > Player | wbarColor, wbarActive, wbarHeight, wbarRadius, waveOpacity | ✅ |
| Theme > Hero | heroGlowOn/Int/Blur/Clr, heroStrokeOn/Clr/W | ✅ |
| Theme > Particles | On/Count/Speed/Type/Color/Opacity/Size | ✅ |
| Theme > CTA Button | bg, clr, hoverBg, radius | ✅ |
| Theme > Navigation | navBgColor, navBlur | ✅ |
| Theme > Container | containerMaxWidth | ✅ |
| Theme > Presets | Save/load/delete/rename | ✅ |
| Theme > Custom CSS | Textarea injection | ✅ |
| Animations | Logo/Title/Cards/Buttons/Player/Waveform — type + timing | ✅ |
| Card Style | Presets + full CardStyleEditor (glow, filters, border, shadow, transform, hover, animation, shimmer, cover, title, price, tags, image, layout) | ✅ |
| Hero Visual | glow, stroke, segments, eyebrow, gradient, title size, letter spacing | ✅ |
| Layout | cardsPerRow, showWishlist, logo scale/rotation, navHeight | ✅ |
| Content | Section title, divider, CTA text, 25+ labels | ✅ |
| Brand | logo upload, favicon, name, slogan | ✅ |
| Banner | toggle, text, colors, position, speed | ✅ |
| Floating | CRUD, 5 animations, responsive | ✅ |
| Features | 11 toggle switches | ✅ |
| Media | Upload, grid, assign to beats | ✅ |
| Emojis | CRUD, shortcode | ✅ |
| Changelog | History with filters | ✅ |

### 🔴 LO QUE FALTA (gaps identificados)

#### A. CSS Vars que se USAN en frontend pero NO tienen admin control

| CSS Variable | Dónde se usa | Admin control |
|---|---|---|
| `--bg-secondary` | backgrounds secundarios | ❌ No |
| `--surface2` | superficies alternativas | ❌ No |
| `--surface-hover` | hover states | ❌ No |
| `--surface-active` | active states | ❌ No |
| `--text-hint` | textos muy sutiles | ❌ No |
| `--border` | bordes generales | ❌ Parcial (theme.$other) |
| `--border2` | bordes secundarios | ❌ No |
| `--border-hover` | hover de bordes | ❌ No |
| `--danger` / `--warning` | colores de estado | ❌ No |
| `--shadow-sm/md/lg/xl` | sombras hardcodeadas | ❌ No |
| `--card-shadow` / `--card-shadow-hover` | sombra de cards | ❌ Parcial |
| `--duration-fast/normal/slow` | transiciones | ❌ No |
| `--ease-out/ease-in-out/ease-spring` | curvas de animación | ❌ No |
| `--selection-bg/color` | selección de texto | ❌ No |
| `--nav-bg-scrolled` | nav al hacer scroll | ❌ No |
| `--nav-border-scrolled` | borde nav al scroll | ❌ No |

#### B. Secciones del store sin personalización

| Sección | Qué falta |
|---|---|
| **Beat Card** (info section) | Colores de nombre, género, BPM, precio por separado |
| **Beat Detail page** | Layout, colores, spacing de la página de detalle |
| **Footer** | Visible/invisible, textos, colores, links |
| **Login page** | Colores, fondo, textos editables |
| **Error page** | Colores, textos |
| **Wishlist page** | Layout, colores |
| **Search/Filters** | Estilo de inputs, botones de filtro, activos |
| **Genre Tabs** | Colores activo/inactivo, borde, fondo |
| **Show More button** | Colores, borde, estilo |
| **Back to Top** | Color, posición, tamaño |
| **Player Bar** | Fondo completo, gradiente, botones, tiempo |
| **CTA Section** | Fondo gradiente, borde superior |
| **Testimonials** | Colores de card, texto, estrellas |
| **Stats del hero** | Colores de números, labels |

#### C. Controles que existen en Firebase pero sin admin UI

| Key en Firebase | Existe en rules | Admin UI |
|---|---|---|
| `theme.heroWordBlur` | ✅ | ❌ (hero page) |
| `theme.heroWordOp` | ✅ | ❌ (hero page) |
| `theme.heroPadTop` | ✅ | ❌ (layout page) |
| `theme.heroTitleCustom` | ✅ | ❌ |
| `theme.heroSubCustom` | ✅ | ❌ |
| `theme.heroTextClr` | ✅ | ❌ |
| `theme.heroLetterSpacing` | ✅ | ❌ |
| `theme.heroLineHeight` | ✅ | ❌ |
| `theme.heroGradOn/Clr/Op/W/H` | ✅ | ❌ (heroVisual separado) |
| `theme.heroEyebrowOn/Clr/Size` | ✅ | ❌ (heroVisual separado) |
| `theme.sectionTitleSize/Weight/Align/Color` | ✅ | ✅ (content page) |
| `theme.bgPattern/Color/Opacity` | ✅ | ✅ (theme page) |
| `theme.scrollbarThin/Color` | ✅ | ✅ (theme page) |
| `settings.heroMinHeight` | ❌ | ❌ |
| `theme.heroTitleSize` | ✅ | ✅ (heroVisual) |
| `theme.particlesSizeMin/Max` | ✅ | ✅ (theme page) |
| `theme.lightMode` | ✅ | ✅ (theme page) |

#### D. Features del store sin toggle

| Feature | Toggle existe | Notas |
|---|---|---|
| Genre tabs | ❌ | Siempre visibles |
| Show More batching | ❌ | Siempre activo (8 per batch) |
| Back to Top button | ❌ | Siempre visible después de 600px |
| Beat grid columns (responsive) | ❌ | Hardcodeado 3→2→1 |
| Featured section | ❌ | Siempre muestra si hay featured |
| Testimonials section | ✅ | testimonialsActive |
| Banner | ✅ | bannerActive |
| Particles | ✅ | particlesOn |
| Hero glow | ✅ | heroGlowOn |
| Wishlist | ✅ | showWishlist |
| Logo text | ✅ | showLogoText |

---

## 🗺️ PLAN DE CONSTRUCCIÓN — Por Fases

### FASE 1: Quick Wins (1 sesión)
> Controles que ya existen en Firebase pero no tienen admin UI

#### 1.1 Hero Visual — Controles perdidos
**Archivo**: `src/routes/(admin)/admin/hero/+page.svelte`

Agregar:
- [ ] `heroWordBlur` slider (0-50px) — blur de la palabra glow
- [ ] `heroWordOp` slider (0-1) — opacidad de la palabra glow
- [ ] `heroTitleCustom` text input — título custom del hero
- [ ] `heroSubCustom` text input — subtítulo custom
- [ ] `heroTextClr` color picker — color del texto hero
- [ ] `heroLetterSpacing` slider (-0.2 a 0.5em)
- [ ] `heroLineHeight` slider (0.5-3)
- [ ] `heroPadTop` slider (0-20rem) — padding top del hero

#### 1.2 Layout — Grid responsive
**Archivo**: `src/routes/(admin)/admin/layout/+page.svelte`

Agregar:
- [ ] `heroMinHeight` slider (30-100vh) — altura mínima del hero
- [ ] `footerVisible` toggle — mostrar/ocultar footer
- [ ] `sectionOrder` drag-list — orden de secciones (hero, featured, catalog, testimonials, cta)

#### 1.3 Theme — Variables secundarias
**Archivo**: `src/routes/(admin)/admin/theme/+page.svelte`

Agregar en nueva sección "Colores avanzados":
- [ ] `bgSecondary` color picker — fondo secundario
- [ ] `surfaceColor2` color picker — superficie alternativa
- [ ] `surfaceHover` color picker — hover de superficies
- [ ] `borderColor` color picker — color de bordes
- [ ] `borderColor2` color picker — bordes secundarios
- [ ] `textHint` color picker — textos sutiles
- [ ] `dangerColor` color picker — color de error
- [ ] `warningColor` color picker — color de advertencia

Agregar en nueva sección "Transiciones":
- [ ] `durationFast` slider (50-500ms)
- [ ] `durationNormal` slider (100-1000ms)
- [ ] `durationSlow` slider (200-2000ms)
- [ ] `easeDefault` select (ease-out, ease-in-out, spring, linear)

Agregar en nueva sección "Sombras":
- [ ] `shadowSm` text input — sombra pequeña
- [ ] `shadowMd` text input — sombra mediana
- [ ] `shadowLg` text input — sombra grande

Agregar:
- [ ] `selectionBg` color picker — color de selección de texto
- [ ] `selectionColor` color picker — texto seleccionado

---

### FASE 2: Store Sections (1-2 sesiones)
> Controles para cada sección visible del store

#### 2.1 Nueva página: Admin → Store Sections
**Archivo**: `src/routes/(admin)/admin/sections/+page.svelte` (NUEVO)

**Genre Tabs:**
- [ ] `genreTabsActive` toggle — mostrar/ocultar genre tabs
- [ ] `genreTabBg` color picker — fondo tab inactivo
- [ ] `genreTabBgActive` color picker — fondo tab activo
- [ ] `genreTabBorder` color picker — borde tab
- [ ] `genreTabText` color picker — texto inactivo
- [ ] `genreTabTextActive` color picker — texto activo
- [ ] `genreTabRadius` slider (0-50px)
- [ ] `genreTabFontSize` slider (8-16px)

**Show More:**
- [ ] `showMoreActive` toggle — activar/desactivar batching
- [ ] `showMoreBatch` slider (4-24) — beats por batch
- [ ] `showMoreText` text input — texto del botón
- [ ] `showMoreStyle` select (pill, button, link)

**Back to Top:**
- [ ] `backToTopActive` toggle
- [ ] `backToTopThreshold` slider (200-2000px) — scroll para aparecer
- [ ] `backToTopPosition` select (right, left)
- [ ] `backToTopSize` slider (32-64px)
- [ ] `backToTopBg` color picker
- [ ] `backToTopColor` color picker
- [ ] `backToTopRadius` slider (0-50%, default 50%)

**Featured Section:**
- [ ] `featuredActive` toggle — mostrar/ocultar sección destacados
- [ ] `featuredTitle` text input — título de la sección
- [ ] `featuredMax` slider (1-12) — máximo de beats destacados

**Beat Grid:**
- [ ] `gridColumnsMobile` select (1, 2)
- [ ] `gridColumnsTablet` select (1, 2, 3)
- [ ] `gridColumnsDesktop` select (2, 3, 4, 5)

**Stats:**
- [ ] `statsActive` toggle — mostrar stats en hero
- [ ] `statBeatsLabel` text input
- [ ] `statGenresLabel` text input
- [ ] `statLicensesLabel` text input
- [ ] `statColor` color picker — color de números

#### 2.2 Nueva página: Admin → Beat Card Detail
**Archivo**: `src/routes/(admin)/admin/carddetail/+page.svelte` (NUEVO)

Controles para la página de detalle de un beat:
- [ ] `detailLayout` select (sidebar, full-width, modal)
- [ ] `detailCoverAspect` select (1/1, 4/3, 16/9)
- [ ] `detailCoverRadius` slider (0-30px)
- [ ] `detailShowTags` toggle
- [ ] `detailShowBpm` toggle
- [ ] `detailShowKey` toggle
- [ ] `detailShowDate` toggle
- [ ] `detailShowPlays` toggle
- [ ] `detailRelatedActive` toggle
- [ ] `detailRelatedMax` slider (2-8)
- [ ] `detailStaggerLicenses` toggle

#### 2.3 Nueva página: Admin → Player
**Archivo**: `src/routes/(admin)/admin/player/+page.svelte` (NUEVO)

Controles para el player bar:
- [ ] `playerBg` color picker — fondo del player
- [ ] `playerGradient` toggle — gradiente en barra de progreso
- [ ] `playerGradientFrom` color picker
- [ ] `playerGradientTo` color picker
- [ ] `playerBtnStyle` select (circle, square, rounded)
- [ ] `playerTimeFont` select (mono, body)
- [ ] `playerShowWaveform` toggle
- [ ] `playerWaveformBars` slider (10-40)
- [ ] `playerTransition` select (crossfade, slide, none)

#### 2.4 Nueva página: Admin → Footer
**Archivo**: `src/routes/(admin)/admin/footer/+page.svelte` (NUEVO)

- [ ] `footerVisible` toggle
- [ ] `footerBg` color picker
- [ ] `footerText` color picker
- [ ] `footerBorder` toggle
- [ ] `footerBorderColor` color picker
- [ ] `footerContent` textarea — HTML/Markdown
- [ ] `footerAlign` select (left, center, right)
- [ ] `footerPadding` slider (1-8rem)

---

### FASE 3: Advanced Controls (2 sesiones)
> Controles avanzados para personalización profunda

#### 3.1 Theme — Modo Light completo
**Archivo**: `src/routes/(admin)/admin/theme/+page.svelte`

El toggle de light mode ya existe, pero faltan overrides para modo claro:
- [ ] `lightBg` color picker — fondo en modo claro
- [ ] `lightSurface` color picker — superficie en modo claro
- [ ] `lightText` color picker — texto en modo claro
- [ ] `lightAccent` color picker — accent en modo claro (para que no sea rojo sobre blanco)
- [ ] `lightBorder` color picker — bordes en modo claro
- [ ] `lightNavBg` color picker — nav en modo claro

#### 3.2 Animaciones — Por sección
**Archivo**: `src/routes/(admin)/admin/animations/+page.svelte`

Agregar controles para:
- [ ] `animGenreTabs` — animación de genre tabs
- [ ] `animShowMore` — animación del botón show more
- [ ] `animBackToTop` — animación del botón back to top
- [ ] `animCTA` — animación de la sección CTA
- [ ] `animTestimonials` — animación de testimonios
- [ ] `animFooter` — animación del footer
- [ ] `animHeroStats` — animación de stats

#### 3.3 Card Style — Sibling Hover mejorado
**Archivo**: `src/lib/components/CardStyleEditor.svelte`

Ya existe sibling hover, pero agregar:
- [ ] `siblingHoverColor` — tint color en siblings
- [ ] `siblingHoverBorder` — borde del sibling activo
- [ ] `siblingHoverGlow` — glow del sibling activo
- [ ] `activeCardZIndex` — z-index de la card activa

#### 3.4 Beat Card — Info section personalizable
En el CardStyleEditor, sección nueva "Info Section":
- [ ] `infoPadding` slider — padding de la sección info
- [ ] `infoBg` color picker — fondo de la sección info
- [ ] `infoBorderTop` toggle + color — borde superior
- [ ] `nameColor` color picker — color del nombre del beat
- [ ] `nameSize` slider — tamaño del nombre
- [ ] `genreColor` color picker — color del género
- [ ] `bpmColor` color picker — color del BPM
- [ ] `priceColor` color picker — color del precio
- [ ] `priceSize` slider — tamaño del precio
- [ ] `metaFontSize` slider — tamaño de meta (genre, bpm, key)

---

### FASE 4: Polish & Power Features (1-2 sesiones)
> Features avanzados de personalización

#### 4.1 CSS Variables — Editor visual
**Archivo**: `src/routes/(admin)/admin/theme/+page.svelte` → nueva sección

- [ ] Lista de TODAS las CSS vars con su valor actual
- [ ] Override individual por variable
- [ ] Reset individual
- [ ] Search/filter de variables

#### 4.2 Import/Export de tema completo
- [ ] Export: descargar tema como JSON
- [ ] Import: subir JSON y aplicar
- [ ] Preview antes de aplicar
- [ ] Diff: mostrar qué cambia antes de aplicar

#### 4.3 Theme History
- [ ] Undo: revertir último cambio
- [ ] History: últimos 20 cambios con timestamp
- [ ] Compare: ver dos presets lado a lado

#### 4.4 Mobile Preview
- [ ] Preview en 3 tamaños: desktop, tablet, mobile
- [ ] Toggle entre tamaños en el preview panel
- [ ] Controles específicos por breakpoint

---

## 📋 PRIORIDAD DE EJECUCIÓN

| Fase | Sesiones | Impacto | Dificultad |
|------|----------|---------|------------|
| **F1: Quick Wins** | 1 | ⭐⭐⭐⭐ | Fácil |
| **F2: Store Sections** | 1-2 | ⭐⭐⭐⭐⭐ | Medio |
| **F3: Advanced** | 2 | ⭐⭐⭐ | Medio |
| **F4: Polish** | 1-2 | ⭐⭐ | Difícil |

**Recomendación**: Empezar por F1 + F2 (2-3 sesiones) cubre el 80% del valor.

---

## 🔧 IMPLEMENTACIÓN — Detalles Técnicos

### Pattern para agregar controles

1. **Firebase rules**: agregar validación en `firebase.rules.json` → `theme/` o `settings/`
2. **TypeScript type**: agregar campo en `src/lib/stores/settings.ts` → `ThemeSettings` o `SettingsData`
3. **Theme engine**: si es CSS var, agregar mapping en `src/lib/theme.ts` → `THEME_MAP`
4. **Admin UI**: agregar slider/toggle en la página de admin correspondiente
5. **Frontend**: usar el valor en el componente del store (ya debería funcionar si es CSS var)
6. **Test**: verificar que el slider actualiza en tiempo real

### Ejemplo: agregar `genreTabsActive` toggle

```typescript
// 1. settings.ts — agregar a SettingsData
export type SettingsData = {
  // ...
  features?: Record<string, boolean>; // ya existe
  // NO hace falta agregar aquí — se usa features.genreTabs
};

// 2. Admin features page — ya tiene toggle genérico
// features page ya lee/escribe settings.features.{key}

// 3. Store page — consumir
let genreTabsActive = $derived(s?.features?.genreTabs !== false);
```

### Ejemplo: agregar nuevo color picker

```typescript
// 1. settings.ts — agregar a ThemeSettings
export type ThemeSettings = {
  // ...
  genreTabBgActive?: string;
};

// 2. firebase.rules.json — agregar validación
"genreTabBgActive": {
  ".validate": "newData.isString() && newData.val().length <= 30"
}

// 3. theme.ts — agregar a THEME_MAP
const THEME_MAP = {
  // ...
  genreTabBgActive: '--genre-tab-bg-active',
};

// 4. Admin UI — agregar color picker
<div class="field">
  <label>Genre tab activo</label>
  <div class="color-row">
    <input type="color" value={t.genreTabBgActive || '#dc2626'} 
      oninput={(e) => update('theme.genreTabBgActive', e.currentTarget.value)} />
  </div>
</div>

// 5. CSS — usar la variable
.genre-tab.active {
  background: var(--genre-tab-bg-active);
}
```

---

## 📐 ARCHIVOS A MODIFICAR POR FASE

### Fase 1
- `src/routes/(admin)/admin/hero/+page.svelte` — agregar 8 controles
- `src/routes/(admin)/admin/layout/+page.svelte` — agregar 3 controles
- `src/routes/(admin)/admin/theme/+page.svelte` — agregar ~15 controles
- `src/lib/stores/settings.ts` — agregar campos al type
- `src/lib/theme.ts` — agregar mappings
- `firebase.rules.json` — agregar validaciones

### Fase 2
- `src/routes/(admin)/admin/sections/+page.svelte` — NUEVO (~600 líneas)
- `src/routes/(admin)/admin/carddetail/+page.svelte` — NUEVO (~300 líneas)
- `src/routes/(admin)/admin/player/+page.svelte` — NUEVO (~250 líneas)
- `src/routes/(admin)/admin/footer/+page.svelte` — NUEVO (~200 líneas)
- `src/routes/(admin)/+layout.svelte` — agregar nav items
- `src/routes/(store)/+page.svelte` — consumir nuevos settings
- `src/lib/stores/settings.ts` — agregar types
- `firebase.rules.json` — agregar validaciones

### Fase 3
- `src/routes/(admin)/admin/animations/+page.svelte` — agregar 7 animaciones
- `src/lib/components/CardStyleEditor.svelte` — agregar sección info
- `src/lib/stores/settings.ts` — agregar campos
- `src/lib/cardStyleEngine.ts` — agregar propiedades

### Fase 4
- `src/routes/(admin)/admin/theme/+page.svelte` — CSS var editor
- `src/lib/components/ThemeHistory.svelte` — NUEVO
- `src/lib/components/ThemeCompare.svelte` — NUEVO
- `src/lib/stores/themeHistory.ts` — NUEVO

---

## 🎯 MÉTRICAS DE ÉXITO

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Admin pages | 20 | 24 |
| Controles totales | ~100+ | ~200+ |
| CSS vars con admin control | ~40 | ~70 |
| Secciones personalizables | 8/15 | 15/15 |
| Features con toggle | 11 | 18 |
| Firebase keys sin admin UI | ~15 | 0 |
