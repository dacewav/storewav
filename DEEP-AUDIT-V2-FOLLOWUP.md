# DEEP AUDIT V2 — Follow-up Findings

## Verified Fixes (deployed)

| Fix | Status | Verified |
|-----|--------|----------|
| Waveform (BUG-01/02) | ✅ | Browser: waveform visible on beat detail page |
| Catalog empty section (BUG-03) | ✅ | Browser: "0 de 1 beats" gone |
| Subscribe leaks (BUG-04) | ✅ | Code review: all 3 fixed |
| Click-to-seek (MEJ-02) | ✅ | Browser: "Posición de audio" slider visible |
| Volume persistence (MEJ-03) | ✅ | Code: localStorage read/write |
| Cursor glow mobile (VIS-05) | ✅ | Code: `hover: none` check |

## New Findings

### 🟡 VIS-09: Verify page hardcoded colors (FIXED)

**Componente:** `src/routes/verify/[hash]/+page.svelte`
**Problema:** CSS hardcoded `#888`, `#333`, `#dc2626`, `#0a2a1a`, etc. No usa variables de tema. Se ve roto en light mode.
**Solución:** Reescrito completo usando CSS variables del theme system.
**Esfuerzo:** S ✅ (ya fixeado)

### 🟡 VIS-10: Verify page re-fetches on every render

**Componente:** `src/routes/verify/[hash]/+page.svelte`
**Problema:** `$effect(() => { fetch(...) })` se ejecuta en cada re-render porque `hash` es reactive.
**Solución:** Cambiado a `onMount` con flag `fetched`.
**Esfuerzo:** S ✅ (ya fixeado)

### 🟢 MEJ-08: Genre page JSON-LD no sanitizado

**Componente:** `src/routes/(store)/genre/[slug]/+page.svelte`
**Problema:** `{JSON.stringify({...})}` sin `escapeJsonLd`. Si el genre name tiene `</script>`, rompe el JSON-LD.
**Solución:** Usar `escapeJsonLd()`.
**Esfuerzo:** S (5 min)

### 🟢 MEJ-09: Login page — $effect para email link check

**Componente:** `src/routes/(store)/login/+page.svelte`
**Problema:** Usa `$effect` para detectar `?complete=email` en la URL. Debería ser `onMount` para evitar re-ejecución.
**Solución:** Migrar a `onMount`.
**Esfuerzo:** S (5 min)

### 🟢 MEJ-10: Kit page — Audio player no usa store compartido

**Componente:** `src/routes/(store)/kit/[id]/+page.svelte`
**Problema:** Crea su propio `new Audio()` en lugar de usar el player store. Si el usuario reproduce un beat y luego un sample, hay dos audios superpuestos.
**Solución:** Integrar con el player store o al menos pausar el player global al reproducir samples.
**Esfuerzo:** M (30 min)

### 🟢 MEJ-11: Login page — admin redirect solo para admins

**Componente:** `src/routes/(store)/login/+page.svelte`
**Problema:** Si un usuario no-admin se loguea, se queda en la página de login sin feedback claro de por qué no puede acceder.
**Status:** Ya tiene un mensaje "Tu cuenta no tiene permisos de administrador" — está bien.

### 🟢 MEJ-12: Orders page — download button usa createElement hack

**Componente:** `src/routes/(store)/account/orders/+page.svelte`
**Problema:** `document.createElement('a')` + `click()` para descargar. Podría ser bloqueado por popup blockers.
**Solución:** Usar `window.open()` o un `<a>` real con `target="_blank"`.
**Esfuerzo:** S (10 min)
