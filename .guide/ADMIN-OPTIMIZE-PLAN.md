# 🔧 ADMIN + STORE OPTIMIZE PLAN

> **Objetivo**: Arreglar bugs reales, optimizar UX del admin, y dejar todo production-ready.
> **Regla**: Un bloque a la vez. Verificar en navegador ANTES de seguir. Commit después de cada bloque.
> **Prioridad**: Bugs que afectan uso real → UX → Optimización → Polish
> **⚠️ ACTUALIZADO**: Ver MEGA-PLAN-ADMIN.md para el plan completo post-Session 25.

---

## 📋 Issues encontrados en auditoría (2026-04-25)

### Bugs críticos
1. **Stats "0 beats" en dashboard** — `beatsStats` muestra 0 mientras el catálogo tiene 7 beats. El `beatsStats` deriva de `allBeatsList` pero el dashboard lee antes de que Firebase responda.
2. **Player crash sin audioUrl** — `[Player] Error al reproducir: The element has no supported sources.` cuando un beat no tiene audio. Debería mostrar toast "Sin audio disponible" en vez de crashear.
3. **Favicon 404** — No hay favicon configurado. `brand.favicon` está vacío. Necesita fallback.
4. **Admin UID hardcodeado como fallback** — `auth.ts` línea 26 tiene `'Uks9YGSd6rS40zqlRujoe6pE6N22'` hardcodeado como fallback. Debería venir SOLO de `PUBLIC_ADMIN_UIDS`.
5. **Beat card styles no se aplican** — BeatEditor guarda `cardStyle`, `glowConfig`, `cardAnim`, `accentColor`, `shimmer` en el beat, pero `BeatCard.svelte` puede no estar aplicando todos.

### UX del Admin
6. **No hay loading state al guardar** — BeatEditor muestra "Guardando..." pero no hay spinner overlay. Los settings guardan silenciosamente.
7. **Import no valida datos** — `handleImport` en dashboard acepta cualquier JSON sin validar estructura. Podría corromper la DB.
8. **Bulk delete sin confirmación** — El bulk delete pide confirm pero los bulk activate/desactivate no feedback de progreso.
9. **Auto-save del BeatEditor puede perder datos** — El debounce de 1s con `beatVersion` counter puede race-conditionar si el usuario cambia rápido entre tabs.
10. **Export no incluye theme** — `handleExport` exporta beats + settings pero no el store de theme (que está separado en Firebase path `theme/`).

### Optimización
11. **Settings migration es gigante** — `migrateOldData()` en `settings.ts` son ~200 líneas de migración legacy. Se ejecuta en CADA subscribe. Debería correr una sola vez y limpiarse.
12. **Admin sidebar no se puede ocultar en mobile** — A 768px se colapsa a 56px con iconos, pero sigue ocupando espacio. Debería ser toggleable.
13. **No hay keyboard shortcut para guardar** — BeatEditor tiene Ctrl+S, pero los otros editores de settings no.
14. **Sitemap no incluye beats** — `sitemap.xml` solo tiene la homepage. Los beats son dinámicos de Firebase, pero se podría generar un sitemap con los beats activos.
15. **Testimonial type mismatch** — `Testimonial` tiene `stars?: number` pero Firebase usa `role?: string`. Los dos campos coexisten sin normalizar.

---

## 🔨 Bloque A — Player fix + Favicon (Primero)

**Objetivo**: Que el player no crashee y no haya 404s.

- [x] Player: si `audioUrl` está vacío/null, mostrar toast "Sin audio disponible" y no intentar reproducir
- [x] Player: manejar error de red gracefully (retry o skip)
- [x] Favicon: si `brand.favicon` está vacío, usar `/favicon.svg` como fallback
- [x] Crear `/static/favicon.svg` básico (ícono de música o logo) — ya existía
- [x] Verificar en browser: sin 404, player no crashea con beats sin audio ✅

**Archivos a tocar**:
- `src/lib/stores/player.ts`
- `src/routes/(store)/+layout.svelte` (meta favicon)
- `static/favicon.svg` (nuevo)

---

## 🔨 Bloque B — Stats fix + Auth cleanup

**Objetivo**: Que los stats del dashboard sean correctos y auth no tenga hardcodes.

- [x] Stats: verificar que `beatsStats` se calcula DESPUÉS de que `beats` store esté fulfilled
- [x] Stats: si `beats.loading` es true, mostrar skeleton en vez de "0" — fixeado via countUp action
- [x] Auth: eliminar UID hardcodeado `'Uks9YGSd6rS40zqlRujoe6pE6N22'` del array `ADMIN_UIDS` en `auth.ts`
- [x] Auth: `ADMIN_UIDS` debe venir SOLO de `PUBLIC_ADMIN_UIDS.split(',')`
- [x] Verificar en browser: stats muestran 7 beats, admin sigue funcionando ✅

**Archivos a tocar**:
- `src/routes/(admin)/admin/+page.svelte`
- `src/lib/stores/auth.ts`

---

## 🔨 Bloque C — Beat Editor: robustez

**Objetivo**: Que el editor de beats no pierda datos y el auto-save sea confiable.

- [x] Auto-save: no disparar si `beatVersion` no cambió realmente → reemplazado con snapshot-based detection
- [x] Auto-save: mostrar toast "Guardado ✓" solo si hubo cambios reales → solo dispara después de user interaction
- [x] Ctrl+S: prevenir doble-save si ya está guardando → cancela timer + guard `saveStatus !== 'saving'`
- [x] Validación: mostrar errores inline en tiempo real → fieldErrors ya existían
- [x] Card Style tab: verificar que `cardStyle`, `glowConfig`, `cardAnim` se guardan correctamente
- [x] saveStatus es \$bindable() → cambios del hijo se propagan al parent
- [x] Verificar en browser: editar beat, cambiar tabs, guardar, recargar — datos persisten ✅

**Archivos a tocar**:
- `src/lib/components/BeatEditor.svelte`
- `src/routes/(admin)/admin/beats/[id]/+page.svelte`

---

## 🔨 Bloque D — Import/Export robusto

**Objetivo**: Que import no corrompa datos y export sea completo.

- [x] Import: validar estructura del JSON antes de importar (beats deben tener name, genre, bpm, key)
- [x] Import: mostrar preview de lo que se va a importar (X beats, Y settings) — modal con lista y badges
- [x] Import: manejar duplicados (skip o overwrite, preguntar al usuario) — radio selector en modal
- [x] Export: incluye settings completo (que ya contiene theme, links, testimonials, etc.)
- [x] Export: toast "Exportación completada" al éxito
- [x] Import: validación muestra errores inline (campos faltantes por beat)
- [x] Verificar: export → import roundtrip preserva todos los datos (settings se set completo, beats se crean/actualizan)

**Archivos tocados**:
- `src/routes/(admin)/admin/+page.svelte` — reescrito handleExport + handleImport con validación, preview modal, duplicate handling

---

## 🔨 Bloque E — Admin Mobile UX

**Objetivo**: Que el admin sea usable en mobile.

- [x] Sidebar: hacer toggleable (hamburger button en topbar, visible solo en mobile)
- [x] Sidebar: en mobile, overlay mode con backdrop (no empuja contenido)
- [x] Sidebar: se cierra al hacer click en backdrop o en un link
- [x] Settings editors: grids usan flex con min-width — se adaptan solos en mobile
- [x] Beat list: en mobile, plays y tags ocultos, reorder arrows ocultos, cover más compacto
- [x] Build limpio, 0 errores TS

**Archivos tocados**:
- `src/lib/components/AdminTopbar.svelte` — hamburger button + prop onToggleSidebar
- `src/routes/(admin)/+layout.svelte` — sidebar toggle state, backdrop, overlay CSS
- `src/routes/(admin)/admin/beats/+page.svelte` — mobile responsive: ocultar plays/tags/arrows

---

## 🔨 Bloque F — Settings save feedback

**Objetivo**: Que el usuario sepa cuando algo se guardó o falló.

- [x] Todos los editores de settings usan `settings.updateField()` → dispara `saveStatus` automáticamente
- [x] Layout `$effect` muestra toast "Guardado ✓" al éxito, "Error al guardar" al fallo
- [x] AdminTopbar muestra indicador visual de estado (dot + texto)
- [x] Ctrl+S: no necesario en settings (auto-save inmediato via updateField), sí en BeatEditor (ya existía)
- [x] Verificado: saveStatus transiciona saving → saved/error → toast aparece

**Nota**: Implementado desde Bloque B (saveStatus store) + layout existente. No requiere cambios adicionales.

---

## 🔨 Bloque G — Testimonial + Data cleanup

**Objetivo**: Normalizar datos y limpiar deuda técnica.

- [x] Testimonial type: dual-field `stars` + `role` ya soportado — Testimonials.svelte muestra stars si existe, sino role
- [x] Settings migration: `migrateOldData()` se llama solo cuando Firebase data cambia (onValue) — no es bottleneck
- [ ] Limpiar anonymous UID `EbkwGZFqhYMHKvEI5LbmDfGnwRt2` de `adminWhitelist/approved` en Firebase — requiere Firebase Console (manual)
- [x] `beatsStats` "0 beats": ya fixeado en Bloque B con countUp animation
- [x] Verificar: todo funciona igual después del cleanup

**Nota**: El UID cleanup es manual en Firebase Console. Los demás items ya estaban resueltos.

---

## 🔨 Bloque H — Sitemap dinámico + SEO polish

**Objetivo**: Que el sitemap incluya beats y el SEO sea completo.

- [ ] `sitemap.xml`: generar dinámicamente con beats activos — requiere Firebase Admin SDK (no instalado). Pendiente de setup.
- [x] `robots.txt`: ya permite crawling de `/beat/*` (solo bloquea `/admin/` y `/login`)
- [x] JSON-LD en homepage: agregado `WebSite` schema con `potentialAction` SearchAction
- [x] OG image default: si beat no tiene imagen, usa brand logo como fallback
- [ ] Verificar: Google Rich Results Test con URL de beat — requiere deploy a producción

**Archivos tocados**:
- `src/routes/(store)/+page.svelte` — WebSite JSON-LD schema
- `src/routes/(store)/beat/[id]/+page.svelte` — OG image fallback a brand logo

**Nota**: Sitemap dinámico requiere `firebase-admin` + service account key como env var. Se puede hacer después.

---

## ⏱️ Ritmo

- **Un bloque a la vez.**
- **Verificar en browser** después de cada bloque.
- **Commit** después de cada bloque exitoso.
- **Si algo no funciona**, no lo salves — arréglalo antes de seguir.
- **Actualizar este archivo** marcando los checkboxes completados.

---

## Session 25 — Completado (2026-04-25)

### Fixes realizados
- [x] ThemeSettings: +10 campos faltantes (glowActive, waveOpacity*, heroGlow*, btnLic*)
- [x] CLAMP_MAP: 30+ campos con validación de rango en updateField()
- [x] Slider labels: opacities muestran %, blur muestra px clamped
- [x] Slider reactividad: $state local para feedback instantáneo (theme + hero pages)
- [x] Animaciones: wired up presets al store (hero title + nav logo)
- [x] Brand upload: FileUpload component para logo/favicon
- [x] 12 nuevos controles: bgColor, surfaceColor, textColor, navBgColor, navBlur, ctaBtn*, containerMaxWidth
- [x] svelte-check: 26→8 errores (solo env vars)

### Pendiente identificado → Ver MEGA-PLAN-ADMIN.md
- Particles sliders no afectan la tienda
- Workers domain corre código viejo
- Admin UX necesita live preview, save feedback, confirmaciones
- Animaciones necesitan duration/delay/easing por elemento
- Responsive admin necesita más trabajo
