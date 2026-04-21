# 📋 AUDIT-MASTER.md — Guía Maestra de Reconstrucción

> **Última actualización: 2026-04-22 04:11**
> **Este archivo es la fuente de verdad para cualquier sesión nueva.**

---

## Estado Real del Proyecto (Post-Deploy)

**Código:** SvelteKit + Cloudflare + Firebase RTDB
**Repo:** `dacewav/storewav`
**Líneas:** ~13,500 | **Archivos:** 68 | **Commits:** 22

### ¿Qué está roto?

| Problema | Impacto | Detalle |
|---|---|---|
| Settings path mismatch | 🔴 CRÍTICO | Código lee `settings.hero.title`, Firebase tiene `settings.heroTitle` |
| No beats en DB | 🔴 CRÍTICO | `beats/` = null → tienda vacía |
| AdminWhitelist vs admins | ✅ FIXEADO | Auth ya chequea `adminWhitelist/{email}` |
| Migration layer | ⚠️ PARCIAL | Agregado pero no testeado en deploy real |

### Estructura de Firebase (datos reales)

```
settings/          (flat, old structure)
  ├── heroTitle: ''
  ├── heroSubtitle: ''
  ├── siteName: 'YUGEN'
  ├── bannerActive: true
  ├── bannerText: 'saca un toque . <3 !'
  ├── whatsapp: '+527551492054'
  ├── instagram: 'dace.wav'
  ├── dividerTitle: '<em>CALIDAD</em> AEGURADA'
  ├── dividerSub: '...'
  ├── globalCardStyle: { glow, hover, shadow, filter, border, style, transform }
  ├── testimonials: [{ name, text, role }]
  └── sections: { featured: true, testimonials: true }

theme/             (flat, all visual config)
  ├── accent: '#dc2626'
  ├── fontBody: 'JetBrains Mono'
  ├── fontDisplay: 'Manrope'
  ├── logoUrl: 'https://...BLANCO_Dace.wav_PNG_Logo.png'
  ├── heroEyebrow: 'En vivo · Puebla, MX'
  ├── heroGlowBlur: 83, heroGlowInt: 3.4, heroGlowClr: '#dd2c35'
  ├── heroTitleCustom: 'S', heroSubCustom: ':/'
  ├── heroTitleSize: 3.8, heroLetterSpacing: -0.01, heroLineHeight: 0.9
  ├── radiusGlobal: 12, padSection: 4.5, beatGap: 19
  ├── glowColor: '#ff0026', glowAnim: 'flicker', glowBlur: 67
  ├── particles*: (configuración de partículas)
  ├── animLogo/Cards/Buttons/Player/Title/Waveform: { type, dur, del }
  └── ... 95+ keys

beats/             → NULL (vacío)
adminWhitelist/    → { email1: true, email2: true, email3: true }
```

### Lo que el código lee vs lo que hay

```
CÓDIGO                          FIREBASE                    MATCH?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
settings.hero.title              settings.heroTitle (EMPTY)   ❌
settings.hero.subtitle           settings.heroSubtitle        ❌
settings.hero.eyebrow            theme.heroEyebrow            ❌ path
settings.hero.glowWord           theme.heroTitleCustom        ❌ path
settings.heroVisual.glowBlur     theme.heroGlowBlur           ❌ path
settings.section.dividerTitle    settings.dividerTitle        ❌ nested
settings.cta.title               —                            ❌ empty
settings.brand.name              settings.siteName            ❌ key
settings.brand.logo              theme.logoUrl                ❌ path
settings.brand.whatsapp          settings.whatsapp            ❌ key
settings.banner.enabled          settings.bannerActive        ❌ key
settings.banner.text             settings.bannerText          ❌ key
settings.links                   —                            ❌ empty
settings.cardStyle               settings.globalCardStyle     ❌ key
settings.animations              theme.animLogo etc.          ❌ path
settings.labels                  —                            ❌ empty
theme.accent                     theme.accent                 ✅
theme.fontBody                   theme.fontBody               ✅
theme.fontDisplay                theme.fontDisplay            ✅
beats/*                          NULL                         ❌
```

---

## Plan de Reconstrucción — Bloque por Bloque

### BLOQUE 0: Data Layer ✅ (hecho, necesita test)
**Objetivo:** Que el código lea los datos reales de Firebase.
**Acción:** Migration layer en settings.ts que transforma flat→nested.
**Test:** Deploy → verificar que hero muestra `siteName`, eyebrow, glow word.
**Status:** Committed `4f8452a`, necesita verificación en deploy.

### BLOQUE 1: Store Visual — Hero + Banner + Footer
**Objetivo:** Que la tienda se vea viva al entrar.
- [ ] Hero muestra título real (de `siteName` o `heroTitle`)
- [ ] Hero muestra eyebrow ("En vivo · Puebla, MX")
- [ ] Hero muestra glow word (de `heroTitleCustom`)
- [ ] Hero muestra subtitle
- [ ] Hero stats animados (beats count, géneros, licencias)
- [ ] Hero links (Instagram, WhatsApp) desde settings
- [ ] Banner se muestra si `bannerActive` es true
- [ ] Divider se muestra con `dividerTitle` y `dividerSub`
- [ ] Footer muestra nombre de marca
- [ ] Nav muestra logo (de `theme.logoUrl`)
- [ ] Nav links funcionan

**Test manual:** Abrir tienda → ¿se ve el hero con datos reales? ¿Banner visible? ¿Links funcionan?

### BLOQUE 2: Beats — Seed + Grid
**Objetivo:** Que haya beats en la tienda.
- [ ] Seed de 6-8 beats de ejemplo en Firebase
- [ ] Beat grid renderiza cards
- [ ] BeatCard muestra cover, título, precio, tags
- [ ] Play button reproduce audio (con URL vacía o placeholder)
- [ ] Wishlist toggle funciona
- [ ] Filters (search, genre, key, sort) funcionan
- [ ] Featured section muestra beats marcados como featured
- [ ] Click en beat → navega a `/beat/[id]`
- [ ] Beat page muestra cover, waveform, licenses, platform links

**Test manual:** ¿Se ven beats en el grid? ¿Filtros filtran? ¿Click navega?

### BLOQUE 3: Admin — Que funcione
**Objetivo:** Panel admin usable.
- [ ] Login funciona (Google Auth)
- [ ] Admin detecta `adminWhitelist/{email}`
- [ ] Dashboard muestra stats reales
- [ ] Beats list muestra beats existentes
- [ ] BeatEditor carga datos actuales al editar
- [ ] BeatEditor guarda cambios a Firebase
- [ ] Theme editor muestra valores actuales de `theme/`
- [ ] Content editor muestra valores actuales de `settings/`
- [ ] Cambios se reflejan en la tienda inmediatamente

**Test manual:** Entrar al admin → ¿se ven datos? ¿Editar y guardar funciona?

### BLOQUE 4: Effects & Polish
**Objetivo:** Que la tienda se sienta premium.
- [ ] Cursor glow (lerp suave)
- [ ] Scroll progress bar (gradiente 3 colores)
- [ ] Floating orbs (3 orbs animados)
- [ ] Card glow/animation/shimmer desde `globalCardStyle`
- [ ] Hero parallax on scroll
- [ ] Sibling blur en beat grid
- [ ] Stagger reveal animations
- [ ] Loader con nombre de marca
- [ ] Grain overlay

**Test manual:** ¿Efectos visibles? ¿60fps? ¿Mobile se ve bien?

### BLOQUE 5: Content & Labels
**Objetivo:** Todo editable desde admin.
- [ ] Labels editables (search, empty states, license names, etc.)
- [ ] CTA section configurable
- [ ] Testimonials editables
- [ ] Banner animation types funcionan
- [ ] Animation slots aplican en tienda

### BLOQUE 6: Final Audit & Deploy
**Objetico:** Tienda lista para producción.
- [ ] Build: 0 errores
- [ ] svelte-check: 0 errores
- [ ] Todos los links funcionan
- [ ] Mobile responsive (480px, 768px)
- [ ] SEO meta tags presentes
- [ ] robots.txt + sitemap.xml
- [ ] 0 console.log debug
- [ ] Performance OK (no jank, lazy loading)

---

## Protocolo por Bloque

```
BLOQUE X — PROTOCOLO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LEER:     Revisar qué hay en Firebase (curl)
2. MAPEAR:   Qué paths necesita el código vs qué hay
3. CODEAR:   Fix/add en el código
4. BUILD:    npm run build → 0 errores
5. TYPES:    npx svelte-check → 0 errores
6. COMMIT:   git commit con descripción clara
7. PUSH:     git push origin main
8. TEST:     Deploy → verificar en browser real
9. ITERAR:   Si no funciona → volver al paso 3
10. PASS:    Marcar bloque como ✅ solo después de test real
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Archivos Clave

```
src/lib/stores/settings.ts       — Settings + migration layer (MÁS IMPORTANTE)
src/lib/stores/auth.ts           — Auth + adminWhitelist check
src/lib/stores/beats.ts          — Beats CRUD
src/lib/stores/player.ts         — Audio player
src/lib/stores/theme.ts          — Theme → CSS vars
src/lib/theme.ts                 — Theme engine
src/routes/(store)/+page.svelte  — Store index (hero, grid, CTA)
src/routes/(store)/+layout.svelte— Store layout (nav, footer, banner)
src/routes/(store)/beat/[id]/+page.svelte — Beat detail page
src/routes/(admin)/+layout.svelte— Admin layout + auth guard
src/routes/(admin)/admin/+page.svelte — Admin dashboard
src/routes/(admin)/admin/beats/+page.svelte — Beats list
src/lib/components/BeatCard.svelte — Beat card component
src/lib/components/BeatEditor.svelte — Beat editor (5 tabs)
src/lib/components/Filters.svelte — Search/filter component
src/lib/components/Player.svelte — Audio player bar
src/app.css                      — Design tokens + keyframes
firebase.rules.json              — DB security rules
```

---

## Instrucciones para Nueva Sesión

Si empezás un chat nuevo:

1. **Leer** `.guide/AUDIT-MASTER.md` (este archivo) — estado completo
2. **Leer** `.guide/BLOCK-CONTEXT.md` — qué bloque estamos
3. **Leer** `.guide/REAL-AUDIT.md` — datos reales de Firebase
4. **Verificar** qué hay en Firebase: `curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json"`
5. **Empezar** por el bloque marcado como "en progreso" en BLOCK-CONTEXT.md
6. **Seguir** el protocolo por bloque (arriba)
7. **Actualizar** BLOCK-CONTEXT.md al terminar cada bloque
8. **Actualizar** este archivo si descubrís cosas nuevas
