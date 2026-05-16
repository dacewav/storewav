# 🎯 MEGA PLAN — Store Visual Overhaul + Data Coherence
**Date:** 2026-05-17 | **Target:** Production-ready store with premium UX

---

## 📌 Context

- Solo hay **1 beat real** (Reggaeton!) y **1 drumkit** de test en Firebase
- La home muestra "1 beats" en destacados + catálogo que se repite
- Necesitamos coherencia total: datos Firebase ↔ admin ↔ store
- Inspiración visual: atrumlab.com (dark premium, bold typography, immersive hero)

---

## 🏗️ PHASE 1: Data Coherence & Store Logic (CRÍTICO)

### 1.1 — Home page: no mostrar catálogo vacío/repetido
**Archivo:** `src/routes/(store)/+page.svelte`
**Problema:** Cuando todos los beats son featured, el catálogo se oculta (correcto). Pero cuando hay 1 featured + 0 no-featured, muestra "Sin resultados" en el catálogo. Y si hay 1 featured que TAMBIÉN aparece en catálogo, se duplica.
**Fix:**
- Si `filteredBeats.length === 0` (todos son featured o solo hay 1 beat), NO mostrar sección de catálogo
- Mostrar solo "Destacados" con todos los beats disponibles
- El badge "{n} beats" debe reflejar el conteo real

### 1.2 — Beat count pluralization
**Archivo:** `src/routes/(store)/+page.svelte`
**Problema:** "1 beats" — falta singular/plural
**Fix:** `{featuredBeats.length} {featuredBeats.length === 1 ? 'beat' : 'beats'}`

### 1.3 — "Iniciá sesión" voseo argentino
**Archivos:** `src/routes/(store)/account/orders/+page.svelte`, `notifications/+page.svelte`, `account/+page.svelte`
**Problema:** Usa "Iniciá sesión" (voseo) mientras el resto usa español mexicano
**Fix:** Cambiar a "Inicia sesión" en todos los auth gates

### 1.4 — Kits loading forever cuando Firebase 401
**Archivo:** `src/lib/stores/_firebaseStore.ts`
**Problema:** Cuando Firebase devuelve 401 (reglas sin deploy, auth requerido), el `onValue` de la SDK nunca dispara callback → `loading: true` permanente
**Fix:** Agregar timeout de 5s al `onValue` — si no dispara, forzar `loading: false` con fallback a cache/default

---

## 🎨 PHASE 2: Hero Overhaul (Inspiración Atrumlab)

### 2.1 — Full-viewport hero con video/visual de fondo
**Archivo:** `src/routes/(store)/+page.svelte` + `+layout.svelte`
**Concepto:** Hero a pantalla completa (100vh) con:
- Video de fondo loop (o gradient animado si no hay video)
- Título grande con efecto glow/stroke
- Subtítulo + CTA buttons (Explorar / WhatsApp)
- Scroll indicator animado (flecha abajo)
- Stats (beats, géneros, licencias) en la parte inferior del hero

**Implementación:**
```svelte
<!-- Hero background video (admin-configurable) -->
{#if heroVideoUrl}
  <video class="hero-video" autoplay muted loop playsinline>
    <source src={heroVideoUrl} type="video/mp4" />
  </video>
{/if}
<div class="hero-overlay"></div>
```

**CSS:**
```css
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, 
    rgba(0,0,0,0.4) 0%, 
    rgba(0,0,0,0.7) 50%, 
    var(--bg) 100%
  );
  z-index: 1;
}
```

### 2.2 — Settings: heroVideoUrl field
**Archivo:** `src/lib/stores/settings.ts`
**Add:** `heroVideoUrl?: string` al HeroVisualSettings

### 2.3 — Admin: Hero video upload
**Archivo:** `src/routes/(admin)/admin/hero/+page.svelte`
**Add:** Video URL input + preview en admin hero settings

---

## 🎵 PHASE 3: Beat Cards Premium Redesign

### 3.1 — Card hover: glassmorphism + glow border
**Archivo:** `src/lib/components/BeatCard.svelte`
**Actual:** Hover sutil con scale
**Propuesta:**
```css
.beat-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.3),
    0 0 0 1px rgba(var(--accent-rgb), 0.2),
    inset 0 0 20px rgba(var(--accent-rgb), 0.05);
  backdrop-filter: blur(8px);
}
```

### 3.2 — Play button: pulse ring al reproducir
**Archivo:** `src/lib/components/BeatCard.svelte`
**Cuando el beat está playing:**
```css
.beat-play.is-playing::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  animation: playPulse 1.5s ease-out infinite;
}
```

### 3.3 — Genre badge en card
**Archivo:** `src/lib/components/BeatCard.svelte`
**Add:** Badge flotante con el género del beat (esquina superior izquierda)
```svelte
<span class="beat-genre-badge">{beat.genre}</span>
```

### 3.4 — Price: mostrar rango de licencias
**Archivo:** `src/lib/components/BeatCard.svelte`
**Actual:** "Desde $350"
**Propuesta:** "Desde $350 · 4 licencias" (si tiene múltiples)

---

## 🏪 PHASE 4: Home Page Sections Rebuild

### 4.1 — Sección "Cómo funciona" (3 pasos)
**Archivo:** `src/routes/(store)/+page.svelte`
**Posición:** Después de featured beats, antes del catálogo
```
🎵 Escucha → 🛒 Elige licencia → ⬇️ Descarga al instante
```
Cada paso con icono, título, descripción. CSS grid 3 columnas.

### 4.2 — Sección de estadísticas mejorada
**Actual:** Stats en el hero (beats, géneros, licencias)
**Propuesta:** Stats como sección separada después del hero con:
- Números animados (countUp ya existe)
- Labels descriptivos
- Diseño horizontal con separadores

### 4.3 — Sección "Géneros" como pills/badges grandes
**Archivo:** `src/routes/(store)/+page.svelte`
**Posición:** Antes del catálogo
```svelte
<div class="genre-showcase">
  {#each genreList as genre}
    <a href="/genre/{genre}" class="genre-chip">
      <span class="genre-icon">{genreIcon(genre)}</span>
      {genre}
    </a>
  {/each}
</div>
```

### 4.4 — Footer mejorado
**Archivo:** `src/routes/(store)/+layout.svelte`
**Propuesta:**
- 3 columnas: Brand + description | Links | Social
- Newsletter input (opcional)
- Copyright más sutil
- Animación de glow sutil en el brand

---

## 📱 PHASE 5: Mobile-First Refinements

### 5.1 — Bottom nav bar (mobile)
**Archivo:** `src/routes/(store)/+layout.svelte`
**Propuesta:** Navigation fija en bottom para mobile (estilo app)
```
[🏠 Home] [🔍 Buscar] [❤️ Fav] [🛒 Cart] [👤 Cuenta]
```
Ocultar en desktop. Reemplazar hamburger menu con nav bottom.

### 5.2 — Swipe gestures en beat cards (mobile)
**Archivo:** `src/lib/components/BeatCard.svelte`
**Propuesta:** 
- Swipe derecha → añadir a favoritos
- Swipe izquierda → añadir al carrito
- Feedback visual con color overlay

### 5.3 — Pull-to-refresh (mobile)
**Archivo:** `src/routes/(store)/+layout.svelte`
**Propuesta:** Gesture de pull-down para recargar datos

---

## ✨ PHASE 6: Micro-interactions & Polish

### 6.1 — Page transitions mejoradas
**Archivo:** `src/routes/(store)/+layout.svelte`
**Actual:** View Transitions API con fade básico
**Propuesta:** 
- Slide + fade para navegación forward
- Fade para back navigation
- Shared element transition para beat cards → detail

### 6.2 — Add-to-cart animation
**Archivo:** `src/lib/components/BeatCard.svelte`
**Propuesta:** Al añadir al carrito:
1. Card hace "pop" (scale up + down)
2. Badge del carrito en nav hace "pulse"
3. Miniatura del beat "vuela" hacia el icono del carrito (parábola)

### 6.3 — Like animation (heart burst)
**Archivo:** `src/lib/components/BeatCard.svelte`
**Propuesta:** Partículas de corazones que salen del botón al dar like

### 6.4 — Scroll-triggered reveals mejorados
**Archivo:** `src/lib/actions.ts` (ya tiene `reveal`)
**Propuesta:** 
- Fade-up con stagger para grids
- Parallax sutil para secciones
- Progress indicator por sección

---

## 🔧 PHASE 7: Technical Debt & Performance

### 7.1 — Skeleton loaders más realistas
**Archivo:** `src/lib/components/Skeleton.svelte`
**Propuesta:** Skeletons que reflejen el layout real de los BeatCards

### 7.2 — Image optimization
**Archivo:** `src/lib/components/BeatCard.svelte`
- `loading="lazy"` (ya tiene)
- `decoding="async"` (ya tiene)
- Agregar `srcset` para responsive images
- WebP fallback

### 7.3 — Font loading optimization
**Archivo:** `src/app.html`
- `font-display: swap` (probablemente ya tiene)
- Preload de fuentes críticas

---

## 📋 Implementation Order

### Sprint 1 (Critical — Data + Logic)
1. ✅ Fix beats count pluralization (#1.2)
2. ✅ Fix "Iniciá" voseo (#1.3)
3. ✅ Fix catalog empty/duplicate logic (#1.1)
4. ✅ Fix kits loading timeout (#1.4)
5. ✅ Test all fixes in browser

### Sprint 2 (Hero + Home)
6. Full-viewport hero with video support (#2.1, #2.2, #2.3)
7. "Cómo funciona" section (#4.1)
8. Genre showcase section (#4.3)
9. Stats section standalone (#4.2)

### Sprint 3 (Cards + Polish)
10. BeatCard hover glow (#3.1)
11. Play button pulse (#3.2)
12. Genre badge on card (#3.3)
13. Add-to-cart animation (#6.2)
14. Like burst animation (#6.3)

### Sprint 4 (Mobile + Nav)
15. Bottom nav bar mobile (#5.1)
16. Footer redesign (#4.4)
17. Page transitions (#6.1)
18. Skeleton improvements (#7.1)

### Sprint 5 (Admin Parity)
19. Admin hero video upload (#2.3)
20. Admin preview for all new sections
21. Verify data coherence admin ↔ store

---

## 🎨 Design Tokens (Atrumlab-inspired)

```css
:root {
  /* Darker, more premium feel */
  --bg: #0a0a0a;
  --bg-elevated: #111111;
  --surface: #161616;
  --surface-hover: #1a1a1a;
  --border: rgba(255,255,255,0.06);
  --border-hover: rgba(255,255,255,0.12);
  
  /* Typography: bolder, more dramatic */
  --font-display: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  --text-hero: clamp(3rem, 10vw, 8rem);
  
  /* Accent glow */
  --accent-glow: rgba(var(--accent-rgb), 0.15);
  --accent-glow-strong: rgba(var(--accent-rgb), 0.3);
  --glow-sm: 0 0 12px rgba(var(--accent-rgb), 0.2);
  --glow-md: 0 0 24px rgba(var(--accent-rgb), 0.3);
  --glow-lg: 0 0 48px rgba(var(--accent-rgb), 0.4);
  
  /* Spacing */
  --section-padding: clamp(3rem, 8vw, 6rem);
  --container-max: 1200px;
}
```

---

## ✅ Definition of Done

- [ ] All data coherent (Firebase ↔ admin ↔ store)
- [ ] No "1 beats" — proper pluralization
- [ ] No voseo — consistent Mexican Spanish
- [ ] Kits don't hang on loading
- [ ] Hero is full-viewport with video support
- [ ] Cards have premium hover effects
- [ ] Mobile has bottom nav
- [ ] All animations are smooth (60fps)
- [ ] 280+ tests passing
- [ ] svelte-check clean
- [ ] Browser-tested on desktop + mobile
