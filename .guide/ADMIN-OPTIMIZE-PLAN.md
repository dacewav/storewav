# 🔧 ADMIN + STORE OPTIMIZE PLAN

> **Objetivo**: Arreglar bugs reales, optimizar UX del admin, y dejar todo production-ready.
> **Regla**: Un bloque a la vez. Verificar en navegador ANTES de seguir. Commit después de cada bloque.
> **Prioridad**: Bugs que afectan uso real → UX → Optimización → Polish

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

- [ ] Sidebar: hacer toggleable (hamburger button para mostrar/ocultar)
- [ ] Sidebar: en mobile, overlay mode (no empuja contenido)
- [ ] Settings editors: todos los grids deben ser single-column en mobile
- [ ] Beat list: en mobile, mostrar solo nombre + precio + acciones (ocultar plays, tags)
- [ ] Verificar en browser a 375px: navegar por todos los editores sin overflow

**Archivos a tocar**:
- `src/routes/(admin)/+layout.svelte`
- `src/routes/(admin)/admin/beats/+page.svelte`
- CSS de todos los editores de settings

---

## 🔨 Bloque F — Settings save feedback

**Objetivo**: Que el usuario sepa cuando algo se guardó o falló.

- [ ] Todos los editores de settings (Brand, Hero, Theme, Content, Banner, Layout, Links, Testimonials, Animations): usar `saveStatus` store correctamente
- [ ] Mostrar toast "Guardado ✓" al éxito, "Error al guardar" al fallo
- [ ] Mostrar indicador de "Guardando..." durante la operación
- [ ] Ctrl+S en todos los editores (no solo BeatEditor)
- [ ] Verificar: editar cada sección, guardar, ver toast

**Archivos a tocar**:
- Todos los `+page.svelte` en `src/routes/(admin)/admin/`
- `src/lib/stores/settings.ts`

---

## 🔨 Bloque G — Testimonial + Data cleanup

**Objetivo**: Normalizar datos y limpiar deuda técnica.

- [ ] Testimonial type: unificar `stars` y `role` — decidir cuál usar y normalizar
- [ ] Settings migration: cachear resultado de `migrateOldData()` para no recalcular en cada subscribe
- [ ] Limpiar anonymous UID `EbkwGZFqhYMHKvEI5LbmDfGnwRt2` de `adminWhitelist/approved` en Firebase
- [ ] Revisar `beatsStats` — el "0 beats" puede ser por timing de la suscripción
- [ ] Verificar: todo funciona igual después del cleanup

**Archivos a tocar**:
- `src/lib/stores/settings.ts`
- `src/lib/stores/beats.ts`
- Firebase Console (manual)

---

## 🔨 Bloque H — Sitemap dinámico + SEO polish

**Objetivo**: Que el sitemap incluya beats y el SEO sea completo.

- [ ] `sitemap.xml`: generar dinámicamente con beats activos desde Firebase
- [ ] `robots.txt`: verificar que permite crawling de `/beat/*`
- [ ] JSON-LD en homepage: agregar `WebSite` schema con `potentialAction` SearchAction
- [ ] OG image default: si beat no tiene imagen, usar brand logo o placeholder
- [ ] Verificar: Google Rich Results Test con URL de beat

**Archivos a tocar**:
- `src/routes/sitemap.xml/+server.ts` (nuevo o modificar)
- `src/routes/(store)/+layout.svelte`
- `src/routes/(store)/beat/[id]/+page.svelte`

---

## ⏱️ Ritmo

- **Un bloque a la vez.**
- **Verificar en browser** después de cada bloque.
- **Commit** después de cada bloque exitoso.
- **Si algo no funciona**, no lo salves — arréglalo antes de seguir.
- **Actualizar este archivo** marcando los checkboxes completados.
