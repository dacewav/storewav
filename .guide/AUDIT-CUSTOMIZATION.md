# 🔍 Deep Audit: Admin Customization Options — storewav

> Generated: 2026-04-26 | Scope: ALL admin pages, settings store, cardStyleEngine, firebase rules, frontend rendering

---

## Table of Contents

1. [Admin Pages Inventory](#1-admin-pages-inventory)
2. [Settings Store (settings.ts)](#2-settings-store)
3. [Card Style Engine](#3-card-style-engine)
4. [Firebase Rules Validation](#4-firebase-rules-validation)
5. [Frontend CSS Variables Applied](#5-frontend-css-variables-applied)
6. [Gap Analysis: Missing Customizations](#6-gap-analysis)
7. [Orphaned Keys (Firebase/Settings without Admin UI)](#7-orphaned-keys)

---

## 1. Admin Pages Inventory

### 1.1 `/admin` — Dashboard

**Controls:** None (read-only dashboard)
- Stats grid (beats, active, plays, artists, top beat)
- Recent activity log
- Quick actions: new beat, edit theme, edit content, manage beats, export, import, seed demo beats
- Export/Import with validation preview modal

### 1.2 `/admin/theme` — 🎨 Global Theme

#### Colors
| Control | Type | Path | Range |
|---------|------|------|-------|
| Accent (color principal) | color picker + text | `theme.accent` | hex |
| Glow color | color picker + text | `theme.glowColor` | hex (empty = accent) |
| Background principal | color picker + text | `theme.bgColor` | hex |
| Superficie (cards/paneles) | color picker + text | `theme.surfaceColor` | hex |
| Texto principal | color picker + text | `theme.textColor` | hex |

#### Navigation
| Control | Type | Path | Range |
|---------|------|------|-------|
| Color fondo nav | color picker + text | `theme.navBgColor` | hex |
| Blur nav | slider | `theme.navBlur` | 0–40px |

#### CTA Button
| Control | Type | Path | Range |
|---------|------|------|-------|
| Fondo botón | color picker + text | `theme.ctaBtnBg` | hex |
| Texto botón | color picker + text | `theme.ctaBtnClr` | hex |
| Hover fondo | color picker + text | `theme.ctaBtnHoverBg` | hex |
| Radio | slider | `theme.ctaBtnRadius` | 0–50px |

#### Container
| Control | Type | Path | Range |
|---------|------|------|-------|
| Ancho máximo | slider | `theme.containerMaxWidth` | 800–1800px |

#### Glow System
| Control | Type | Path | Range |
|---------|------|------|-------|
| Glow global activado | toggle | `theme.glowActive` | boolean |
| Intensidad | slider | `theme.glowIntensity` | 0–3 |
| Blur | slider | `theme.glowBlur` | 0–60px |
| Animación glow | select | `theme.glowAnim` | none/pulse/breathe/spin |
| Velocidad anim | slider | `theme.glowAnimSpeed` | 0.5–10s |

#### Typography
| Control | Type | Path | Range |
|---------|------|------|-------|
| Font display | text input | `theme.fontDisplay` | Google Font name |
| Font body | text input | `theme.fontBody` | Google Font name |
| Font weight | slider | `theme.fontWeight` | 100–900 (step 100) |
| Base font size | slider | `theme.fontSize` | 10–20px |
| Line height | slider | `theme.lineHeight` | 1–2.5 |

#### Spacing & Shape
| Control | Type | Path | Range |
|---------|------|------|-------|
| Border radius | slider | `theme.radiusGlobal` | 0–30px |
| Section padding | slider | `theme.sectionPadding` | 1–10rem |
| Beat gap | slider | `theme.beatGap` | 4–40px |

#### Card Effects
| Control | Type | Path | Range |
|---------|------|------|-------|
| Card opacity | slider | `theme.cardOpacity` | 0–1 |
| Blur fondo | slider | `theme.blurBg` | 0–40px |
| Grain | slider | `theme.grainOpacity` | 0–0.2 |
| Shadow intensidad | slider | `theme.cardShadowIntensity` | 0–1 |
| Shadow color | color picker + text | `theme.cardShadowColor` | hex |

#### Opacities
| Control | Type | Path | Range |
|---------|------|------|-------|
| Nav | slider | `theme.navOpacity` | 0–1 |
| Hero bg | slider | `theme.heroBgOpacity` | 0–1 |
| Sections | slider | `theme.sectionOpacity` | 0–1 |
| Beat images | slider | `theme.beatImgOpacity` | 0–1 |
| Text | slider | `theme.textOpacity` | 0–1 |
| Btn normal | slider | `theme.btnOpacityNormal` | 0–1 |
| Btn hover | slider | `theme.btnOpacityHover` | 0–1 |
| Background | slider | `theme.bgOpacity` | 0–1 |

#### Player Bar
| Control | Type | Path | Range |
|---------|------|------|-------|
| Color barra | color picker + text | `theme.wbarColor` | hex |
| Color activo | color picker + text | `theme.wbarActive` | hex |
| Alto | slider | `theme.wbarHeight` | 48–100px |
| Border radius | slider | `theme.wbarRadius` | 0–30px |
| Wave off | slider | `theme.waveOpacityOff` | 0–1 |
| Wave on | slider | `theme.waveOpacityOn` | 0–1 |

#### Blend Modes
| Control | Type | Path | Range |
|---------|------|------|-------|
| Orbs blend | select | `theme.orbBlendMode` | normal/screen/overlay/multiply/soft-light/hard-light/color-dodge |
| Grain blend | select | `theme.grainBlendMode` | same options |

#### Hero Glow (background)
| Control | Type | Path | Range |
|---------|------|------|-------|
| Hero glow activado | toggle | `theme.heroGlowOn` | boolean |
| Intensidad | slider | `theme.heroGlowInt` | 0–3 |
| Blur | slider | `theme.heroGlowBlur` | 0–60px |
| Color glow hero | color picker + text | `theme.heroGlowClr` | hex |

#### Hero Stroke (outline título)
| Control | Type | Path | Range |
|---------|------|------|-------|
| Stroke activado | toggle | `theme.heroStrokeOn` | boolean |
| Grosor | slider | `theme.heroStrokeW` | 0.5–5px |
| Color stroke | color picker + text | `theme.heroStrokeClr` | hex |

#### License Buttons
| Control | Type | Path | Range |
|---------|------|------|-------|
| Fondo | color picker + text | `theme.btnLicBg` | hex |
| Texto | color picker + text | `theme.btnLicClr` | hex |
| Border | color picker + text | `theme.btnLicBdr` | hex |

#### Particles
| Control | Type | Path | Range |
|---------|------|------|-------|
| Partículas activadas | toggle | `theme.particlesOn` | boolean |
| Cantidad | slider | `theme.particlesCount` | 10–200 |
| Velocidad | slider | `theme.particlesSpeed` | 0.1–5 |
| Tipo | select | `theme.particlesType` | circle/square/line/text/image |
| Tamaño min | slider | `theme.particlesSizeMin` | 1–20px |
| Tamaño max | slider | `theme.particlesSizeMax` | 2–40px |
| Color | color picker + text | `theme.particlesColor` | hex |
| Opacidad | slider | `theme.particlesOpacity` | 0–1 |
| Texto partícula | text (conditional) | `theme.particlesText` | string |
| URL imagen | text (conditional) | `theme.particlesImgUrl` | URL |

#### Hero
| Control | Type | Path | Range |
|---------|------|------|-------|
| Altura mínima | slider | `theme.heroMinHeight` | 30–100vh |

#### Section Titles
| Control | Type | Path | Range |
|---------|------|------|-------|
| Tamaño | select | `theme.sectionTitleSize` | default/1.25rem/1.5rem/2rem/2.5rem |
| Peso | slider | `theme.sectionTitleWeight` | 100–900 |
| Alineación | select | `theme.sectionTitleAlign` | left/center/right |
| Color | color picker + text | `theme.sectionTitleColor` | hex |

#### Background Pattern
| Control | Type | Path | Range |
|---------|------|------|-------|
| Patrón de fondo | select | `theme.bgPattern` | none/dots/lines/grid |
| Color patrón | color picker + text | `theme.bgPatternColor` | hex |
| Opacidad patrón | slider | `theme.bgPatternOpacity` | 0–0.3 |

#### Scrollbar
| Control | Type | Path | Range |
|---------|------|------|-------|
| Scrollbar delgado | toggle | `theme.scrollbarThin` | boolean |
| Color scrollbar | color picker + text | `theme.scrollbarColor` | hex |

#### Custom CSS
| Control | Type | Path | Range |
|---------|------|------|-------|
| CSS Personalizado | textarea | `theme.customCSS` | free CSS |

#### Theme Presets
- Save current theme as named preset
- Load/delete/rename presets
- Preset cards with color dots

#### Quick Actions
- Light/Dark mode toggle (`theme.lightMode`)
- Reset all to defaults button

#### Live Preview Panel
- Mini device mockup with nav, hero, cards, CTA
- Updates in real-time as sliders change

**Total controls on Theme page: ~75+**

---

### 1.3 `/admin/hero` — 🎨 Hero Visual

#### Text
| Control | Type | Path | Range |
|---------|------|------|-------|
| Título principal | text input | `hero.title` | string |
| Palabra glow | text input | `hero.glowWord` | string |
| Subtítulo | text input | `hero.subtitle` | string |
| Eyebrow badge | text input | `hero.eyebrow` | string |

#### Title Style
| Control | Type | Path | Range |
|---------|------|------|-------|
| Tamaño | number input | `heroVisual.titleSize` | 0–12rem (0=default) |
| Letter spacing | number input | `heroVisual.letterSpacing` | -0.2–0.5em |
| Line height | number input | `heroVisual.lineHeight` | 0.5–2 |

#### Glow Word
| Control | Type | Path | Range |
|---------|------|------|-------|
| Glow activado | toggle | `heroVisual.glowOn` | boolean |
| Intensidad | slider | `heroVisual.glowInt` | 0–3 |
| Blur | slider | `heroVisual.glowBlur` | 0–60px |
| Color glow | color picker + text | `heroVisual.glowClr` | hex |
| Word blur | slider | `heroVisual.wordBlur` | 0–40px |
| Word opacity | slider | `heroVisual.wordOp` | 0–1 |

#### Stroke Mode
| Control | Type | Path | Range |
|---------|------|------|-------|
| Stroke activado | toggle | `heroVisual.strokeOn` | boolean |
| Grosor | slider | `heroVisual.strokeW` | 0.5–5px |
| Color stroke | color picker + text | `heroVisual.strokeClr` | hex |

#### Color Segments
- Dynamic list of text/color pairs
- Add/remove segments
- Per-word coloring for hero title

#### Eyebrow Badge
| Control | Type | Path | Range |
|---------|------|------|-------|
| Mostrar eyebrow | toggle | `heroVisual.eyebrowOn` | boolean |
| Color | color picker + text | `heroVisual.eyebrowClr` | hex |
| Tamaño | number input | `heroVisual.eyebrowSize` | 0–30px (0=default) |

#### Background Gradient
| Control | Type | Path | Range |
|---------|------|------|-------|
| Gradiente activado | toggle | `heroVisual.gradOn` | boolean |
| Color gradiente | color picker + text | `heroVisual.gradClr` | hex |
| Opacidad | slider | `heroVisual.gradOp` | 0–1 |
| Ancho | slider | `heroVisual.gradW` | 10–100% |
| Alto | slider | `heroVisual.gradH` | 10–100% |
| Padding top | number input | `heroVisual.padTop` | 0–20rem |

**Total controls on Hero page: ~22**

---

### 1.4 `/admin/layout` — 📐 Layout

| Control | Type | Path | Range |
|---------|------|------|-------|
| Cards por fila | slider | `layout.cardsPerRow` | 1–6 |
| Mostrar wishlist | toggle | `layout.showWishlist` | boolean |
| Escala logo | slider | `layout.logoScale` | 0.3–3x |
| Ancho logo | number input | `layout.logoWidth` | 0–300px (0=auto) |
| Alto logo | number input | `layout.logoHeight` | 0–300px (0=auto) |
| Rotación logo | slider | `layout.logoRotation` | -180–180° |
| Mostrar texto junto al logo | toggle | `layout.showLogoText` | boolean |
| Padding top hero | number input | `layout.heroPadTop` | 0–20rem |
| Player bottom offset | number input | `layout.playerBottom` | 0–40px |
| Altura nav | slider | `layout.navHeight` | 40–100px |
| Mostrar banner superior | toggle | `layout.showBanner` | boolean |
| Mostrar footer | toggle | `layout.footerVisible` | boolean |

**Total controls on Layout page: 12**

---

### 1.5 `/admin/brand` — 🏢 Brand & Media

#### Logo
- File upload with image cropper
- Auto-generates favicon (32×32) and OG image (1200×630)
- URL fallback input
- Logo previews: Nav, Favicon, Footer

#### Identity
| Control | Type | Path | Range |
|---------|------|------|-------|
| Nombre de marca | text input | `brand.name` | string |
| WhatsApp | text input | `brand.whatsapp` | phone number |
| Footer texto | text input | `brand.footerText` | string |
| Meta description (SEO) | text input | `brand.metaDescription` | string |

#### Color Palette Generator
- Auto-generated from accent color
- 10-shade palette with click-to-apply
- Color harmonies (complementary, triadic, etc.)

#### Font Preview
- Live Google Font preview for display and body fonts
- Combined preview panel

#### Loader
| Control | Type | Path | Range |
|---------|------|------|-------|
| Mostrar loader | toggle | `loader.enabled` | boolean |
| Texto loader | text input | `loader.brandText` | string |

**Total controls on Brand page: ~10 + upload/crop/palette tools**

---

### 1.6 `/admin/content` — ✏️ Content

#### Section Catálogo
| Control | Type | Path | Range |
|---------|------|------|-------|
| Título sección | text input | `section.title` | string |
| Divider título | emoji input (HTML) | `section.dividerTitle` | HTML + emojis |
| Divider subtítulo | emoji input | `section.dividerSub` | string + emojis |

#### CTA
| Control | Type | Path | Range |
|---------|------|------|-------|
| Título | text input | `cta.title` | string |
| Subtítulo | emoji input | `cta.subtitle` | string + emojis |
| Texto botón | text input | `cta.buttonText` | string |
| URL botón | text input | `cta.buttonUrl` | URL |

#### Labels (26 editable text fields)
- **Filtros:** search, filterAll, filterKey, tags, clearAll
- **Estados vacíos:** emptyTitle, emptySub, wishlistEmptyTitle, wishlistEmptySub
- **Modal:** beatPreview, licenses
- **Beat Card:** priceFrom
- **Hero Stats:** statBeats, statGenres, statLicenses
- **Testimonios:** testimonialsTitle
- **Beat Page:** relatedBeats, backToCatalog, preview, buy
- **Login:** loginTitle, loginSub, loginBtn, loginBack
- **Error:** errorTitle, errorBtn

**Total controls on Content page: 33**

---

### 1.7 `/admin/banner` — 📢 Banner

| Control | Type | Path | Range |
|---------|------|------|-------|
| Banner activado | toggle | `banner.enabled` | boolean |
| Texto del banner | emoji input | `banner.text` | string + emojis |
| URL (clickeable) | text input | `banner.url` | URL |
| Tipo animación | select | `banner.animation` | static/scroll/fade-pulse/bounce/glow-pulse |
| Velocidad | slider | `banner.speed` | 5–60s |
| Easing | select | `banner.easing` | linear/ease/ease-in/ease-out/ease-in-out |
| Dirección | select | `banner.direction` | normal/reverse/alternate |
| Delay | slider | `banner.delay` | 0–10s |
| Fondo | color picker + text | `banner.bgColor` | hex |
| Texto | color picker + text | `banner.textColor` | hex |

**Total controls on Banner page: 10**

---

### 1.8 `/admin/cardstyle` — 🎨 Card Style Global

Uses the `CardStyleEditor` component with 14 collapsible sections:

#### Glow
- Type: select (none/active/rgb/pulse/breathe/neon)
- Color: color picker + text
- Intensity: slider 0–3

#### CSS Filters
- Brightness: slider 0–2
- Contrast: slider 0–2
- Saturate: slider 0–3
- Grayscale: slider 0–1
- Sepia: slider 0–1
- Hue Rotate: slider 0–360°
- Invert: slider 0–1

#### Border
- Width: slider 0–5px
- Radius: slider 0–24px
- Style: select (none/solid/dashed/dotted/double)
- Color: color picker + text

#### Shadow
- X/Y: sliders -20–20px
- Blur: slider 0–60px
- Spread: slider -20–20px
- Color: color picker
- Opacity: slider 0–1
- Inset: toggle

#### Transform
- Rotate: slider -180–180°
- Scale: slider 0.5–1.5
- Skew X/Y: sliders -30–30°
- Translate Y: text input

#### Hover
- Scale: slider 0.8–1.3
- Brightness: slider 0.5–2
- Blur: slider 0–10px
- Saturate: slider 0–3
- **Sibling hover effect:** select (blur/dim/scale-down/none)
- Sibling blur: slider 0–10px
- Sibling opacity: slider 0.1–1
- Sibling scale: slider 0.8–1
- Sibling duration: slider 0.1–1s

#### Animation
- Type: select (40+ presets grouped by category: Suaves, Energéticas, 3D, Especiales)
- Duration: text input
- Delay: text input

#### Shimmer
- Active: toggle
- Color: color picker + text
- Opacity: slider 0–1
- Duration: text input

#### Cover Effects
- Overlay: textarea (CSS gradient)
- Blur: slider 0–20px

#### Background
- Card background: color picker + text
- Opacity: slider 0–1

#### Typography
- Title size: select (XS/SM/Base/LG/XL)
- Title weight: slider 100–900
- Title color: color picker + text
- Title align: select (left/center/right)
- Price size: select
- Price color: color picker + text

#### Tags
- Tag background: color picker + text
- Tag color: color picker + text
- Tag radius: select (default/square/smooth/pill)
- Tag size: select

#### Image
- Aspect ratio: select (1/1, 4/3, 16/9, 3/4, 2/3)
- Hover zoom: slider 1–1.2x
- Object fit: select (cover/contain)

#### Layout
- Card padding: select (none/small/medium/large)
- Info background: color picker + text

#### Presets
- 8+ predefined presets (Default, Neon, Glass, etc.) with one-click apply

**Total controls on Card Style page: ~60+**

---

### 1.9 `/admin/animations` — 🌗 Animations

#### Per-Element Animation (6 elements)
Each element has: animation preset select + duration/delay/easing sliders

| Element | Path prefix |
|---------|-------------|
| Logo / Brand | `animations.animLogo` |
| Título Hero | `animations.animTitle` |
| Beat Cards | `animations.animCards` |
| Botones CTA | `animations.animButtons` |
| Player Bar | `animations.animPlayer` |
| Waveform | `animations.animWaveform` |

**Animation presets:** none/float/pulse/bounce/spin/shake/glow/slide-up/slide-down/fade-in

#### Per-Element Timing
- Duration: slider 0.2–10s
- Delay: slider 0–5s
- Easing: select (Ease In-Out/Ease/Ease In/Ease Out/Linear/Spring/Bouncy)

#### Global Timing
- Duration: slider 0.2–10s
- Delay: slider 0–5s
- Easing: select

#### Custom CSS Keyframes
- Textarea for `@keyframes` definitions

#### Live Preview
- Real-time preview of each element's animation
- Preset gallery

**Total controls on Animations page: ~25+**

---

### 1.10 `/admin/floating` — ✨ Floating Elements

Per-element controls (slide-out panel):
| Control | Type | Range |
|---------|------|-------|
| Type | toggle (text/image) | text or image URL |
| Content | text input | string/URL |
| Position X | slider | 0–100% |
| Position Y | slider | 0–100% |
| Width | slider | 10–400px |
| Opacity | slider | 5–100% |
| Rotation | slider | -180–180° |
| Z-index | slider | 1–20 |
| Animation | select | none/float/pulse/bounce/spin/drift |
| Animation duration | slider | 1–20s |
| Visible | toggle | boolean |
| Desktop only | toggle | boolean |
| Mobile only | toggle | boolean |

---

### 1.11 `/admin/links` — 🔗 Links

Per-link controls:
- Label: text input
- URL: URL input
- Icon: select (Auto/Instagram/YouTube/Spotify/SoundCloud/TikTok/Twitter/WhatsApp/Apple Music/External)
- Reorder: up/down buttons
- Delete: button

---

### 1.12 `/admin/testimonials` — 💬 Testimonials

Per-testimonial controls:
- Name: text input
- Role: text input
- Stars: select (1–5)
- Text: textarea
- Avatar: file upload + URL fallback
- Reorder/Delete

Section title: text input

---

### 1.13 `/admin/features` — ⚡ Feature Toggles

Toggle switches for 11 features:
| Feature | Description |
|---------|-------------|
| wishlist | Botón de favoritos en cards |
| testimonials | Sección de testimonios |
| particles | Partículas flotantes |
| banner | Banner superior animado |
| hero | Sección hero principal |
| player | Barra de reproducción |
| filters | Filtros de búsqueda |
| stats | Barra de estadísticas en hero |
| floating | Elementos flotantes |
| scrollProgress | Barra de progreso de scroll |
| cursorGlow | Efecto glow que sigue el cursor |

Bulk actions: Todo ON / Todo OFF

---

### 1.14 `/admin/emojis` — 😀 Custom Emojis

- Add: name + file upload/URL
- Grid display with preview
- Copy shortcode / Delete

---

### 1.15 `/admin/changelog` — 📋 Changelog (read-only)

- Filter by action type (all/update/create/delete)
- Shows field, old→new value, timestamp

---

### 1.16 `/admin/media` — 📁 Media Gallery

- Drag-and-drop upload zone
- Search by name
- Image grid with: Assign to beat, Copy URL, Delete
- Assign-to-beat modal

---

### 1.17 `/admin/beats` — Beat Management

- Beat list with inline editing
- `/admin/beats/new` — Create new beat
- `/admin/beats/[id]` — Edit beat (includes per-beat CardStyleEditor)

---

## 2. Settings Store

The `settings.ts` store defines the complete data model. All keys:

### Type: `SettingsData`
```
hero: HeroSettings          — title, subtitle, eyebrow, glowWord
heroVisual: HeroVisualSettings — 20+ visual controls for hero
theme: ThemeSettings        — 60+ theme controls
section: SectionSettings    — title, dividerTitle, dividerSub
cta: CtaSettings            — title, subtitle, buttonText, buttonUrl
layout: LayoutSettings      — 12 layout controls
links: LinkItem[]           — social links array
brand: BrandSettings        — name, logo, favicon, ogImage, footerText, metaDescription, whatsapp
loader: LoaderSettings      — enabled, brandText
banner: BannerSettings      — 10 banner controls
testimonials: Testimonial[] — testimonials array
cardStyle: CardStyleConfig  — 50+ card style controls
animations: AnimationSettings — 6 element animations + global timing + custom CSS
labels: LabelSettings       — 26 editable label strings
features: Record<string, boolean> — 11 feature toggles
```

---

## 3. Card Style Engine

`cardStyleEngine.ts` defines `CardStyleConfig` with these fields:

### Supported Properties
- **Glow:** glow (6 types), glowColor, glowIntensity
- **Filters:** brightness, contrast, saturate, grayscale, sepia, hueRotate, invert
- **Border:** borderWidth, borderStyle, borderColor, borderRadius
- **Shadow:** boxShadow (complex string)
- **Transform:** rotate, scale, skew, translateY
- **Hover:** hoverScale, hoverBrightness, hoverBlur, hoverSaturate
- **Animation:** animation (40+ presets), animationDuration, animationDelay
- **Cover:** coverOverlay, coverBlur
- **Shimmer:** shimmer, shimmerColor, shimmerDuration, shimmerOpacity
- **Background:** cardBg, cardBgOpacity
- **Typography:** titleSize, titleWeight, titleColor, titleAlign
- **Price:** priceSize, priceColor, priceBadge
- **Tags:** tagBg, tagColor, tagRadius, tagSize
- **Image:** imageAspect, imageHoverZoom, imageObjectFit
- **Layout:** cardPadding, infoBg, gap
- **Sibling hover:** siblingHoverEffect, siblingHoverBlur, siblingHoverOpacity, siblingHoverScale, siblingHoverDuration

### Merge Logic
`mergeCardStyles(global, perBeat, custom)` — per-beat overrides global, custom overrides both.

---

## 4. Firebase Rules Validation

### `theme/` path — Validated keys (80+)
All theme keys are individually validated with type + range checks. Includes:
- Colors: bg, surface, surface2, accent, text, muted, hint, border, red, redL
- Glow: glowColor, glowIntensity, glowOpacity, glowBlur, glowActive, glowAnim, glowAnimSpeed
- Card: cardOpacity, blurBg, grainOpacity, radiusGlobal, padSection, beatGap, bgOpacity, cardShadowIntensity, cardShadowColor
- Player: wbarColor, wbarActive, wbarHeight, wbarRadius
- Buttons: btnLicBg, btnLicClr, btnLicBdr, btnOpacityNormal, btnOpacityHover
- Wave: waveOpacityOff, waveOpacityOn
- Fonts: fontDisplay, fontBody, fontSize, lineHeight, fontWeight
- Logo: logoUrl, logoWidth, logoHeight, logoScale, logoRotation, logoTextGap, showLogoText
- Hero visual: heroTitleCustom, heroSubCustom, heroTextClr, heroTitleSize, heroLetterSpacing, heroLineHeight, heroGlowOn, heroGlowClr, heroGlowInt, heroGlowBlur, heroStrokeOn, heroStrokeClr, heroStrokeW, heroWordBlur, heroWordOp, heroPadTop, heroGradOn, heroGradClr, heroGradOp, heroGradW, heroGradH, heroEyebrowOn, heroEyebrow, heroEyebrowClr, heroEyebrowSize, heroTitleSegments
- Opacities: navOpacity, beatImgOpacity, textOpacity, heroBgOpacity, sectionOpacity
- Blend modes: orbBlendMode, grainBlendMode
- Banner: bannerBg, bannerText, bannerSpeed, bannerTxtClr
- Particles: particlesOn, particlesCount, particlesMin, particlesMax, particlesSpeed, particlesType, particlesColor, particlesOpacity, particlesText, particlesImgUrl
- Animations: animLogo, animTitle, animPlayer, animCards, animButtons, animWaveform
- Layout sub-keys: heroMarginTop, playerBottom, logoOffsetX
- **Catch-all:** `$other` validates string/number/boolean

### `settings/` path — Validated keys
- siteName, whatsapp, instagram, email
- bannerActive, bannerAnim, bannerEasing, bannerDir, bannerDelay
- heroTitle, heroSubtitle, lightMode
- dividerTitle, dividerTitleSize, dividerLetterSpacing, dividerSub, dividerSubColor, dividerSubSize, dividerGlowOn, dividerGlowInt, dividerGlowBlur, dividerTitleSegments
- testimonialsActive, testimonials (nested array)
- globalCardStyle (nested object with filter/glow/anim/style/border/shadow/hover/transform)
- r2Config (workerUrl, uploadToken)
- cardStyle (key-value map)
- **Catch-all:** `$other` validates string/number/boolean

### `beats/$beatId/` — Per-beat validated fields
- Required: name, genre, bpm, key
- Optional: description, tags, imageUrl, images, audioUrl, previewUrl, spotify, youtube, soundcloud, date, order, active, featured, exclusive, available
- Per-beat style: glowConfig, cardAnim, accentColor, shimmer, shimmerSpeed, shimmerOp, cardBorder, cardStyle (deep nested validation)

---

## 5. Frontend CSS Variables Applied

### From `+layout.svelte` (store layout)
The store layout reads settings and applies:
- **Banner:** background, text color, animation
- **Loader:** brand text, visibility
- **Nav:** brand name/logo, links, height, scroll behavior
- **Footer:** brand text, links visibility
- **Particles:** all particle settings
- **Custom CSS:** injected via `<style>` tag
- **Animation custom CSS:** injected via `<style>` tag
- **Background pattern:** dots/lines/grid with color/opacity
- **Scrollbar:** thin mode + color

### From `+page.svelte` (main store page)
- **Hero:** title, subtitle, eyebrow, glow word, color segments, gradient, stroke mode
- **Hero visual:** all sizing/spacing/glow/eyebrow settings
- **Section titles:** size, weight, align, color
- **Beat grid:** cards per row, animations, sibling hover
- **CTA:** title, subtitle, button text/URL with theme colors
- **Labels:** all 26 label strings
- **Genre tabs:** auto-generated from beats
- **Filters:** search, genre, key, sort, tags

---

## 6. Gap Analysis: Missing Customizations

### 🔴 High-Impact Missing Customizations

#### Navigation
- ❌ **Nav link color** — no control over nav link text color (uses `--text-secondary`)
- ❌ **Nav link hover color** — hardcoded to `--text`
- ❌ **Nav border color** — uses `--border`, no dedicated control
- ❌ **Nav logo text gap** — `logoTextGap` exists in Firebase rules but NO admin UI
- ❌ **Nav position** — always sticky, no option for static/fixed
- ❌ **Mobile menu style** — no customization of mobile menu appearance

#### Hero
- ❌ **Hero background image** — no way to set a hero background image (only gradient)
- ❌ **Hero subtitle styling** — no font size/weight/color controls for subtitle
- ❌ **Hero eyebrow badge border radius** — hardcoded to `--radius-full`
- ❌ **Hero stats styling** — no control over stat number size/color or label styling
- ❌ **Hero links styling** — no control over the social link buttons appearance
- ❌ **Hero text color** — `heroTextClr` exists in Firebase but no admin UI

#### Beat Cards
- ❌ **Card border color (global)** — only per-beat via CardStyleEditor, no global default
- ❌ **Card hover border color** — hardcoded to `--border-hover-accent`
- ❌ **Card cover aspect ratio (global)** — only per-beat, no global default
- ❌ **Play button style** — hardcoded accent color, no size/shape control
- ❌ **Wishlist button style** — no customization
- ❌ **Genre badge style** — no control over genre badge appearance on cards
- ❌ **Plays badge style** — no control
- ❌ **Featured badge style** — hardcoded "TOP" text, no customization
- ❌ **Meta text style** — BPM/key text uses `--text-secondary`, no dedicated control
- ❌ **Price "from" text style** — no control over the "Desde" label style

#### Player Bar
- ❌ **Player font** — no dedicated font control for player
- ❌ **Player progress bar color** — uses accent, no separate control
- ❌ **Player track title style** — no font size/weight control
- ❌ **Player waveform style** — bar width, gap, colors not customizable
- ❌ **Player album art size** — hardcoded

#### CTA Section
- ❌ **CTA background** — no dedicated background color/gradient for CTA section
- ❌ **CTA border top** — hardcoded 1px border
- ❌ **CTA icon** — hardcoded WhatsApp icon, not customizable

#### Footer
- ❌ **Footer background** — no dedicated background color
- ❌ **Footer border** — hardcoded
- ❌ **Footer text color** — uses `--text-hint`, no dedicated control
- ❌ **Footer link styling** — no control over footer link appearance
- ❌ **Footer layout** — always 2-column, no center option

#### Testimonials
- ❌ **Testimonials section styling** — no background/color/border controls
- ❌ **Star color** — no control over star rating color
- ❌ **Avatar size/shape** — hardcoded

#### Section Divider
- ❌ **Divider styling** — `dividerTitleSize`, `dividerLetterSpacing`, `dividerSubColor`, `dividerSubSize`, `dividerGlowOn`, `dividerGlowInt`, `dividerGlowBlur`, `dividerTitleSegments` ALL exist in Firebase rules but have NO admin UI

#### General
- ❌ **Page background image** — no way to set a background image
- ❌ **Font import control** — Google Fonts auto-loaded but no preview of available fonts
- ❌ **Cursor glow color** — uses accent, no separate control
- ❌ **Scroll progress bar color** — uses accent gradient, no separate control
- ❌ **Orb colors** — 3 floating orbs with no color/size/position control
- ❌ **Toast notification style** — no customization
- ❌ **Modal style** — no customization of modal appearance
- ❌ **Skeleton loader style** — no customization
- ❌ **Empty state styling** — no customization beyond text labels

### 🟡 Medium-Impact Missing

- ❌ **Cards per row (responsive)** — only 1 slider, no mobile-specific setting
- ❌ **Section order** — `sectionOrder` exists in layout settings but has no drag-and-drop UI
- ❌ **Beat page styling** — individual beat detail page has no customization
- ❌ **Login page styling** — no customization beyond labels
- ❌ **Error page styling** — no customization beyond labels
- ❌ **Filter bar styling** — no color/spacing controls
- ❌ **Genre tabs styling** — no control over tab appearance
- ❌ **Show more button styling** — hardcoded
- ❌ **Back to top button styling** — hardcoded

### 🟢 Low-Impact Missing

- ❌ **Loading spinner style** — hardcoded
- ❌ **Tooltip style** — no customization
- ❌ **Badge style** — no global badge customization
- ❌ **Selection color** — no `::selection` color control
- ❌ **Focus ring color** — hardcoded to accent

---

## 7. Orphaned Keys (Firebase/Settings without Admin UI)

### In Firebase `theme/` rules but NO admin UI:
| Key | Description | Why it matters |
|-----|-------------|----------------|
| `bg` | Background color (old format) | Legacy, migrated to `bgColor` |
| `surface` | Surface color (old format) | Legacy, migrated to `surfaceColor` |
| `surface2` | Secondary surface | No UI control |
| `text` | Text color (old format) | Legacy, migrated to `textColor` |
| `muted` | Muted text color | No UI control |
| `hint` | Hint text color | No UI control |
| `border` | Border color | No UI control |
| `border2` | Secondary border | No UI control |
| `red` / `redL` | Danger colors | No UI control |
| `glowOpacity` | Glow opacity | No UI (separate from glowIntensity) |
| `padSection` | Section padding (old key) | Legacy, now `sectionPadding` |
| `heroSubCustom` | Hero subtitle custom | No UI |
| `heroTextClr` | Hero text color | No UI |
| `logoTextGap` | Logo-text gap | No UI |
| `heroPadTop` | Hero padding top | Moved to layout, but also in theme |
| `particlesMin` / `particlesMax` | Particle size range | Mapped to `particlesSizeMin`/`particlesSizeMax` |

### In `settings/` Firebase rules but NO admin UI:
| Key | Description | Why it matters |
|-----|-------------|----------------|
| `instagram` | Instagram handle | No dedicated UI (handled via links) |
| `email` | Contact email | No UI |
| `dividerTitleSize` | Divider title font size | No UI |
| `dividerLetterSpacing` | Divider letter spacing | No UI |
| `dividerSubColor` | Divider subtitle color | No UI |
| `dividerSubSize` | Divider subtitle size | No UI |
| `dividerGlowOn` | Divider glow toggle | No UI |
| `dividerGlowInt` | Divider glow intensity | No UI |
| `dividerGlowBlur` | Divider glow blur | No UI |
| `dividerTitleSegments` | Divider color segments | No UI |
| `testimonialsActive` | Testimonials toggle | No UI (handled by features) |
| `lightMode` | Light/dark mode | Has UI in theme page ✓ |
| `r2Config.workerUrl` | R2 upload worker | No UI (configured elsewhere) |
| `r2Config.uploadToken` | R2 upload token | No UI (configured elsewhere) |

### In `SettingsData` type but NOT in Firebase rules:
| Key | Description |
|-----|-------------|
| `heroVisual.*` (all) | Written to `theme/` path, not `settings/` |
| `animations.*` (all) | Written to `theme/` path, not `settings/` |
| `labels.*` (all) | Written to `settings/` via flattened keys |
| `layout.cardsPerRow` | No specific rule (catched by `$other`) |
| `layout.showWishlist` | No specific rule (catched by `$other`) |
| `layout.logoScale` | Mapped to `logoScale` in theme |
| `layout.logoWidth` | Mapped to `logoWidth` in theme |
| `layout.sectionOrder` | No specific rule |

---

## Summary Statistics

| Area | Controls | Missing |
|------|----------|---------|
| Theme page | ~75 | ~15 |
| Hero page | ~22 | ~6 |
| Layout page | 12 | ~4 |
| Brand page | ~10 | ~2 |
| Content page | 33 | ~8 (divider styling) |
| Banner page | 10 | 0 |
| Card Style page | ~60 | ~8 |
| Animations page | ~25 | ~2 |
| Floating page | ~13/element | 0 |
| Links page | ~4/link | 0 |
| Testimonials page | ~6/item | ~3 |
| Features page | 11 | 0 |
| Emojis page | 2/emoji | 0 |
| **TOTAL** | **~280+** | **~50+** |

### Top Priority Gaps
1. **Divider section styling** — 8 keys in Firebase with zero admin UI
2. **Hero text/background image** — common customization missing
3. **Nav link colors** — no control
4. **Footer styling** — zero customization
5. **Section order drag-and-drop** — key exists, no UI
6. **Orb colors/sizes** — visible decorative elements with no control
7. **Player bar details** — progress bar, waveform style
