# DEEP AUDIT V2 — Report
**Date:** 2026-05-10
**Live:** https://dacewav.store
**Stack:** SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages + R2

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 BUG  | 5     |
| 🟡 VISUAL | 8   |
| 🟢 MEJORA | 7   |

**Tests:** 280/280 ✅ | **svelte-check:** 11 errors (all missing env vars — expected) | **Build:** Fails without .env (expected)

---

## 🔴 BUG — PRIORITY 1: WAVEFORM NO APARECE

### 🔴 BUG-01: Waveform vacío en /beat/[slug] (modo "live" falla por Web Audio API)

**Componente:** `src/lib/components/Waveform.svelte` + `src/lib/components/Player.svelte`
**Problema:** El waveform en la página de detalle del beat muestra un área vacía (caja bordeada sin barras), tanto antes como durante la reproducción.

**Causa raíz:** `createMediaElementSource(audio)` solo puede llamarse UNA VEZ por elemento `<audio>`. El flujo:
1. `Player.svelte` renderiza `<Waveform mode="live">` → conecta `MediaElementSourceNode` al audio singleton
2. Al navegar a `/beat/[slug]`, otro `<Waveform mode="live">` intenta conectar al mismo audio
3. `createMediaElementSource(audio)` lanza error (el elemento ya tiene un source node)
4. El `catch` llama `teardownLive()` → waveform queda vacío

**Prueba:** Play desde homepage → player bar aparece ✅ → navegar a /beat/[slug] → waveform vacío ❌

**Solución:** Mover el AudioContext/AnalyserNode al player store como singleton:

```typescript
// src/lib/stores/player.ts — agregar al módulo
let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedSourceNode: MediaElementAudioSourceNode | null = null;

export function getAnalyser(bars: number): AnalyserNode | null {
  if (!browser) return null;
  const a = getAudio();
  if (!a) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioContext();
      sharedAnalyser = sharedAudioCtx.createAnalyser();
      sharedAnalyser.fftSize = bars * 4;
      sharedAnalyser.smoothingTimeConstant = 0.75;
      sharedSourceNode = sharedAudioCtx.createMediaElementSource(a);
      sharedSourceNode.connect(sharedAnalyser);
      sharedAnalyser.connect(sharedAudioCtx.destination);
    } catch {
      return null;
    }
  }
  if (sharedAnalyser) {
    sharedAnalyser.fftSize = bars * 4;
  }
  return sharedAnalyser;
}
```

En `Waveform.svelte`, reemplazar `setupLiveAnalysis()` con:
```typescript
function setupLiveAnalysis() {
  if (!browser || mode !== 'live') return;
  analyser = player.getAnalyser(bars);
  if (analyser) tickLive();
}
```

**Esfuerzo:** M (30-45 min)

---

### 🔴 BUG-02: Waveform no muestra nada cuando NO está reproduciendo (modo "live")

**Componente:** `src/lib/components/Waveform.svelte`
**Problema:** `liveHeights` se inicializa a `Array(bars).fill(0.05)` — invisible. Cuando `mode="live"` y no hay audio, no se muestra ninguna barra.

**Solución:** Mostrar waveform estático cuando no está reproduciendo:

```typescript
let barHeights: number[] = $derived(
  mode === 'live' && isPlaying ? liveHeights : staticHeights
);
```

**Esfuerzo:** S (5 min)

---

### 🔴 BUG-03: Catálogo muestra "0 de 1 beats" / "Sin resultados" cuando el único beat es featured

**Componente:** `src/routes/(store)/+page.svelte`
**Problema:** El código excluye beats featured del grid principal (`list = list.filter(b => !b.featured)`). Con solo 1 beat (que es featured), el catálogo muestra "—" y "Sin resultados".

**Solución:** Cuando `filteredBeats.length === 0` y hay featured beats, mostrar mensaje alternativo o no mostrar la sección catálogo:

```svelte
{#if filteredBeats.length > 0}
  <!-- grid normal -->
{:else if featuredBeats.length > 0 && beats.length <= featuredBeats.length}
  <!-- Todos los beats están destacados, no mostrar catálogo vacío -->
{:else}
  <EmptyState ... />
{/if}
```

**Esfuerzo:** S (10 min)

---

### 🔴 BUG-04: `.subscribe()` sin cleanup en BeatCard y beat detail page (memory leak)

**Componente:** `src/lib/components/BeatCard.svelte:49`, `src/routes/(store)/beat/[id]/+page.svelte:144`
**Problema:**
```typescript
accentRgbStore.subscribe(v => { accentRgb = v; });
```
En Svelte 5 con runes, las suscripciones a stores en el script block de nivel superior NO se limpian automáticamente. Cada vez que se monta un BeatCard, se crea una suscripción que nunca se destruye.

**Solución:** Usar `$derived` o `$effect` con cleanup:

```typescript
// Opción 1: Usar $derived directamente
let accentRgb = $derived($accentRgbStore);

// Opción 2: $effect con cleanup
$effect(() => {
  const unsub = accentRgbStore.subscribe(v => { accentRgb = v; });
  return unsub;
});
```

**Esfuerzo:** S (5 min por archivo)

---

### 🔴 BUG-05: Google One Tap FedCM warnings en cada página

**Componente:** `src/lib/oneTap.ts` / layout
**Problema:** Console llena de errores "Not signed in with the identity provider" y warnings de FedCM migration en cada navegación.

**Solución:** Suprimir el error cuando no hay sesión activa (es behavior esperado), y migrar a FedCM API:
```typescript
// En initOneTap, catch el error silenciosamente
try { ... } catch (e) {
  if (e.message?.includes('identity provider')) return; // Expected
  console.warn('[OneTap]', e);
}
```

**Esfuerzo:** S (10 min)

---

## 🟡 VISUAL — Issues de Diseño

### 🟡 VIS-01: Waveform vacío en beat detail — área en blanco visible

**Componente:** `src/routes/(store)/beat/[id]/+page.svelte`
**Problema:** El contenedor del waveform (borde + fondo) muestra un área vacía de ~48px de alto. Se ve como un bug visual, no como un feature.
**Solución:** Fix del BUG-01 + BUG-02. Mientras tanto, mostrar un placeholder con texto "Waveform" o icono de audio.
**Esfuerzo:** S (incluido en BUG-01/02)

### 🟡 VIS-02: Beat card "related" se muestra a sí mismo

**Componente:** `src/routes/(store)/beat/[id]/+page.svelte`
**Problema:** En "Beats relacionados", el beat actual aparece como recomendado (es el único beat, así que se filtra pero el fallback muestra beats random que pueden incluir el mismo).
**Solución:** El código ya filtra `b.id !== beatId` en el fallback, pero `getRecommendations` podría devolver el mismo beat. Verificar.
**Esfuerzo:** S (10 min)

### 🟡 VIS-03: Loader se muestra brevemente en cada navegación

**Componente:** `src/routes/(store)/+layout.svelte`
**Problema:** El loader se muestra cuando `loaderVisible` es true. Se inicializa en `true` y solo se oculta cuando settings carga. En SPA navigation esto no debería re-activarse, pero el layout se re-monta.
**Solución:** Verificar que el loader solo se muestre en la carga inicial, no en navegaciones SPA.
**Esfuerzo:** S (10 min)

### 🟡 VIS-04: Mobile — botones de acción en beat cards muy grandes

**Componente:** `src/lib/components/BeatCard.svelte`
**Problema:** En `@media (hover: none)` los botones de play, wishlist y carrito se fuerzan a `opacity: 1` con `!important`. El botón de play crece a 56px y se superpone mucho a la cover image.
**Solución:** Reducir tamaño a 44px y ajustar posicionamiento.
**Esfuerzo:** S (5 min)

### 🟡 VIS-05: Cursor glow consume CPU con requestAnimationFrame permanente

**Componente:** `src/routes/(store)/+layout.svelte`
**Problema:** `lerpCursor()` corre con `requestAnimationFrame` continuamente, incluso en mobile donde no hay cursor. Consume CPU/batería.
**Solución:** Pausar en mobile y cuando la pestaña no es visible:
```typescript
if (window.matchMedia('(hover: none)').matches) return;
document.addEventListener('visibilitychange', () => { ... });
```
**Esfuerzo:** S (10 min)

### 🟡 VIS-06: Hero parallax aplica inline styles en cada scroll event

**Componente:** `src/routes/(store)/+layout.svelte`
**Problema:** En `onScroll()`, se aplican `hero.style.transform` y `hero.style.opacity` directamente. Aunque usa RAF, esto puede causar repaints costosos.
**Solución:** Usar CSS `scroll()` con `animation-timeline` o al menos usar `will-change: transform` (ya está, así que está bien).
**Esfuerzo:** XS (ya optimizado)

### 🟡 VIS-07: Filtros se colapsan en mobile pero el toggle no tiene indicador claro

**Componente:** `src/lib/components/Filters.svelte`
**Problema:** En mobile, los filtros están colapsados por defecto. El botón de expandir (chevron) es pequeño y no indica claramente que hay filtros disponibles.
**Solución:** Mostrar badge con número de filtros activos cuando está colapsado (ya lo hace con `expand-badge`, pero solo cuando `hasActive`).
**Esfuerzo:** XS

### 🟡 VIS-08: Sección "Catálogo" aparece vacía con header + filtros pero sin beats

**Componente:** `src/routes/(store)/+page.svelte`
**Problema:** Cuando todos los beats son featured, la sección catálogo muestra el header "Catálogo", los filtros, y "0 de 1 beats / Sin resultados". Se ve roto.
**Solución:** Ocultar toda la sección cuando no hay beats no-featured.
**Esfuerzo:** S (10 min) — mismo que BUG-03

---

## 🟢 MEJORA — Features y Utilidades

### 🟢 MEJ-01: Agregar keyboard shortcut para skip ±10s (ya implementado, pero no visible)

**Status:** ✅ Ya implementado en layout. Space = play/pause, ←→ = seek ±5s, M = mute.
**Mejora:** Mostrar tooltip o overlay breve al usar shortcuts.

### 🟢 MEJ-02: Waveform debería ser clickeable para seek

**Componente:** `src/routes/(store)/beat/[id]/+page.svelte`
**Problema:** El waveform grande en beat detail no permite hacer click para buscar posición.
**Solución:** Agregar `onclick` handler al SVG que calcule la posición y haga `player.seek()`:
```svelte
<div class="beat-waveform" onclick={handleWaveformSeek}>
  <Waveform bars={80} height={48} mode="live" />
</div>
```
**Esfuerzo:** S (15 min)

### 🟢 MEJ-03: Persistir volumen en localStorage

**Componente:** `src/lib/stores/player.ts`
**Problema:** El volumen se resetea a 0.8 en cada sesión.
**Solución:** Guardar/cargar de localStorage:
```typescript
const savedVol = typeof localStorage !== 'undefined' ? +(localStorage.getItem('player-vol') ?? 0.8) : 0.8;
// En setVolume: localStorage.setItem('player-vol', String(vol));
```
**Esfuerzo:** S (5 min)

### 🟢 MEJ-04: Agregar "Now Playing" en la barra del nav cuando hay audio

**Problema:** No hay indicación visual en el nav de que hay audio reproduciéndose.
**Solución:** Agregar un pequeño indicador de ecualizador animado junto al logo o en el nav.
**Esfuerzo:** M (20 min)

### 🟢 MEJ-05: Beat card — mostrar precio en USD además de MXN

**Componente:** `src/lib/components/BeatCard.svelte`
**Problema:** Solo muestra precio MXN. Para audiencia internacional, mostrar USD también.
**Solución:** Agregar precio USD debajo del MXN.
**Esfuerzo:** S (5 min)

### 🟢 MEJ-06: Lazy load de componentes admin

**Componente:** `src/routes/(admin)/+layout.svelte`
**Problema:** Todos los componentes admin se cargan eagerly.
**Solución:** Usar dynamic imports para componentes admin pesados.
**Esfuerzo:** M (30 min)

### 🟢 MEJ-07: Service Worker para offline support

**Problema:** Sin SW, la app no funciona offline.
**Solución:** Agregar SW básico que cachee assets estáticos y muestre página offline.
**Esfuerzo:** L (1-2h)

---

## Code Quality Summary

| Check | Status |
|-------|--------|
| Tests (280) | ✅ All passing |
| svelte-check | ⚠️ 11 errors (all missing env vars — expected without .env) |
| Build | ⚠️ Fails without env vars (expected) |
| `as any` casts | 5 in production code, 12 in tests |
| `$effect` sin cleanup | 30+ instances (most benign, 3-4 need fixing) |
| `.subscribe()` sin cleanup | 5 instances (2 need fixing — BeatCard, beat detail) |
| CORS en audio R2 | ✅ No CORS errors detected |

---

## Priority Order for Fixes

1. **BUG-01 + BUG-02** — Waveform fix (shared AudioContext) → `M`
2. **BUG-04** — Subscribe memory leaks → `S`
3. **BUG-03 + VIS-08** — Empty catalog section → `S`
4. **VIS-05** — Cursor glow on mobile → `S`
5. **MEJ-02** — Waveform click-to-seek → `S`
6. **MEJ-03** — Persist volume → `S`
7. **BUG-05** — FedCM warnings → `S`
