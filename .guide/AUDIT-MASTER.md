# 📋 AUDIT-MASTER.md — Guía Maestra

> **Última actualización: 2026-04-25 02:19**
> **Lee este archivo primero en cualquier sesión nueva.**

---

## ⚠️ REGLAS DE ORO

### 0. Esta guía es viva — se reescribe en cada sesión

**NO es un documento estático.** Cada chat nuevo DEBE:

1. **Leer** esta guía al inicio
2. **Actualizar** si descubre cosas nuevas (errores, paths, datos)
3. **Reescribir** secciones si la realidad cambió
4. **Agregar** lecciones aprendidas al cierre
5. **Corregir** si algo de la guía estaba mal

Si al auditar descubrís que "esto ya no aplica" o "esto falta" → cambiá el archivo. No lo dejes para después. La siguiente sesión depende de lo que vos escribiste.

La guía mejora con cada sesión. Si no la actualizás, la siguiente sesión arranca con info vieja.

### 1. Siempre auditar antes de codear

**NUNCA fixear sin entender.** Antes de tocar cualquier código:

1. **Leer** el código relevante completo (no solo el diff)
2. **Leer** los datos reales de Firebase (curl)
3. **Entender** qué espera el código vs qué hay
4. **Identificar** TODOS los puntos de fallo
5. **Recién ahí** codear

Si un audit de 10 minutos te ahorra 30 minutos de fixes incorrectos, el audit gana.

**Ejemplo malo:** "El hero no se ve, voy a cambiar el template del hero"
**Ejemplo bueno:** "El hero no se ve. Primero: ¿qué lee el código? ¿Qué tiene Firebase? ¿El migration layer está transformando bien? Ah, el problema es X. Ahora fixeo."

### 2. Construir bien, no rápido

- No fixear rápido → investigar, entender, fixear correcto
- No asumir que funciona → testear después de deploy
- No marcar ✅ sin test confirmado por el usuario
- No saltar bloques → uno a la vez
- No commitear basura

**Límite real: 50 minutos por sesión de chat.** Ese es el tiempo que tenemos los dos — vos preguntás, yo codeo, deployeamos, testeamos. Todo dentro de esos 50 min. Los bloques están diseñados para completarse en 1 o 2 sesiones.

---

## Estado del Proyecto

```
Código:    SvelteKit + Cloudflare Pages + Firebase RTDB
Repo:      dacewav/storewav
Firebase:  dacewav-store-3b0f5
Líneas:    ~14,000 | Archivos: 69 | Commits: 27
Build:     ✅ 0 errores, 0 warnings (svelte-check)
Límite:    50 min por sesión de chat
```

### ¿Qué funciona? (Verificado 2026-04-24)

| Área | Status | Detalle |
|------|--------|---------|
| Auth | ✅ | Google login + adminWhitelist + UID fallback |
| Theme engine | ✅ | 35+ keys → CSS vars, accent variants, glow presets |
| Build | ✅ | 0 errores, 0 warnings en svelte-check |
| Firebase rules | ✅ | Validación estricta, `$other` catch-all |
| Design system | ✅ | 1191 CSS, 28 icons, 40+ animation keyframes |
| Componentes | ✅ | 29 componentes, 10 stores, 7 actions |
| Beat schema | ✅ | Alineado con deployed rules (name, genre, bpm, key, licenses[]) |
| Beat CRUD | ✅ | create, read, update, delete, duplicate, reorder |
| Store page | ✅ | Hero, grid, filters, featured, wishlist, player |
| Beat page | ✅ | Cover, waveform, licenses, platforms, related beats |
| Admin panel | ✅ | 9 páginas (dashboard, beats, theme, content, brand, banner, layout, animations, hero) |
| Beat editor | ✅ | Tabs (info, licenses, media, platforms, card style), auto-save |
| Seed data | ✅ | Script para poblar 8 beats de demo desde admin dashboard |
| Player | ✅ | Play/pause/seek/volume, waveform bars en cards |
| Wishlist | ✅ | localStorage + reactive + cross-tab sync |
| Filters | ✅ | Search, genre, key, sort, tags |
| Analytics | ✅ | Batched events → Firebase |
| SEO | ✅ | robots.txt, sitemap.xml, OG tags, meta description |
| Undo/redo | ✅ | Stack 20 entries, Ctrl+Z/Ctrl+Shift+Z |
| Export/import | ✅ | Backup JSON desde admin dashboard |
| Labels editables | ✅ | 25+ labels configurables desde admin |
| Card style engine | ✅ | Glow, filters, border, shadow, hover, shimmer, 40+ animation presets |
| Actions | ✅ | tilt, parallax, staggerReveal, reveal, siblingBlur, ripple, countUp |

### 🐛 Bugs Activos (Audit v2 — 2026-04-25)

| Bug | Severidad | Archivo | Línea | Descripción |
|-----|-----------|---------|-------|-------------|
| `effect_update_depth_exceeded` | 🔴 CRÍTICO | `(admin)/+layout.svelte` | 37 | `$effect` lee+escribe `lastStatus` → loop infinito. Fix: `untrack()` |
| XSS `{@html dividerTitle}` | 🔴 CRÍTICO | `(store)/+page.svelte` | 248 | HTML crudo desde Firebase sin sanitizar |
| `$effect` lee+escribe `autoSaveTimer` | 🟡 ALTO | `BeatEditor.svelte` | 102 | Mismo patrón que bug crítico |
| Bulk ops sin try/catch | 🟡 ALTO | `admin/beats/+page.svelte` | 76-121 | `bulkSetActive`, `bulkDelete`, `moveBeat`, `handleDuplicate` |
| `confirmDelete` sin try/catch | 🟡 ALTO | `admin/beats/+page.svelte` | 98 | `deleteBeat` sin manejo de errores |
| `undoField`/`redoField` sin error handling | 🟡 ALTO | `settings.ts` | — | Stacks se mutan antes del update; si falla, estado inconsistente |
| `$app/stores` deprecated | 🟡 MED | `(store)/beat/[id]/+page.svelte` | 2 | Usa `$app/stores` en vez de `$app/state` |
| `as any` en Icon name | 🟡 MED | `(store)/+page.svelte` | 205 | Bypass de type safety |
| `getComputedStyle` por BeatCard | 🟡 MED | `BeatCard.svelte` | 31 | N cards × `$effect` = N calls. Debería ser shared |
| `JSON.stringify(beat)` cada keystroke | 🟡 MED | `BeatEditor.svelte` | 103 | Serialización completa como trigger |
| 14× `Record<string, any>` | 🟡 MED | Admin pages | — | Tipos propios no usados |
| No offline write queue | 🟡 MED | `settings.ts` | — | Updates fallidos se pierden |
| Mobile overlay `onkeydown` vacío | 🟡 MED | `(store)/+layout.svelte` | 195 | Supresión a11y sin handler real |
| Delete modals sin keyboard handler | 🟡 MED | Múltiples | — | `svelte-ignore` en vez de Escape handler |
| Import errors solo console.log | 🟡 MED | `admin/+page.svelte` | 64 | Errores de import no se muestran al usuario |
| `alt=""` en player cover | 🟢 BAJA | `Player.svelte` | 45 | Alt vacío en imagen del beat actual |
| Sin `aria-pressed` en wishlist | 🟢 BAJA | `BeatCard.svelte` | 100 | Botón sin estado pressed accesible |
| No lazy loading admin | 🟢 BAJA | Admin layout | — | Todas las páginas se cargan eagerly |
| 40+ keyframes no usados | 🟢 BAJA | `cardStyleEngine.ts` | — | CSS bloat |
| `AdminSidebar` dead code | 🟢 BAJA | `AdminSidebar.svelte` | — | Componente nunca importado |
| Version mismatch | 🟢 BAJA | `admin/+page.svelte` | — | Muestra v0.7.0 y v0.6.0 |

### ¿Qué falta? (Ver SOLIDIFICATION-PLAN.md)

| Área | Prioridad | Detalle |
|------|-----------|---------|
| Fix `effect_update_depth_exceeded` | 🔴 Crítico | `untrack()` en admin layout |
| Sanitize `{@html dividerTitle}` | 🔴 Crítico | XSS vector desde Firebase |
| Fix BeatEditor `$effect` loop | 🟡 Alto | `untrack()` para `autoSaveTimer` |
| Error handling en bulk ops | 🟡 Alto | try/catch + toast feedback |
| Toast notifications | 🟡 Media | Sistema existe pero no se usa — save errors/successes sin feedback |
| Plays counter | 🟡 Media | Campo `plays` en Beat type pero nunca se incrementa |
| Connection state | 🟡 Media | No hay detección de desconexión ni "reconnecting" indicator |
| Testimonials fix | 🟡 Media | Firebase tiene {name,role,text} — componente soporta ambos pero migration no transforma |
| globalCardStyle | 🟡 Media | Migration existe pero puede no cubrir todos los casos de Firebase |
| No tests | 🔴 Alta | 0 tests unitarios, 0 e2e |
| No CI/CD | 🟡 Media | No hay GitHub Actions, no hay auto-deploy |
| No PWA | ⚪ Baja | Solo funciona online |
| No i18n | ⚪ Baja | Todo hardcodeado en español |
| No rate limiting | ⚪ Baja | Analytics writes sin throttle |

---

## Estructura de Firebase (Datos Reales)

```bash
# Verificar:
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/theme.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"
```

**settings/** (flat, old):
- `heroTitle: ''`, `heroSubtitle: ''`, `siteName: 'YUGEN'`
- `bannerActive: true`, `bannerText: 'saca un toque . <3 !'`
- `whatsapp: '+527551492054'`, `instagram: 'dace.wav'`
- `dividerTitle: '<em>CALIDAD</em> AEGURADA'`
- `globalCardStyle: { glow, hover, shadow, filter, border, style, transform }`
- `testimonials: [{ name, text, role }]`

**theme/** (flat, all visual):
- `accent: '#dc2626'`, `fontBody: 'JetBrains Mono'`, `fontDisplay: 'Manrope'`
- `logoUrl: '...BLANCO_Dace.wav_PNG_Logo.png'`
- `heroEyebrow: 'En vivo · Puebla, MX'`, `heroTitleCustom: 'S'`
- `heroGlowBlur: 83`, `heroGlowInt: 3.4`, `glowAnim: 'flicker'`
- `radiusGlobal: 12`, `padSection: 4.5`, `beatGap: 19`
- `animLogo/Cards/Buttons/Player/Title/Waveform: { type, dur, del }`
- `particles*: { type: 'text', text: '𓆉', count: 17, ... }`
- 95+ keys total

**beats/** → NULL (usar seed desde admin dashboard para poblar)
**adminWhitelist/** → `{ email1: true, email2: true, email3: true }`

---

## Plan de Solidificación

**Ver `SOLIDIFICATION-PLAN.md`** — Mega plan de 8 sesiones para llevar la tienda de "funciona" a "sólida".

---

## Protocolo por Sesión

**Tenés 50 min. No empezar algo que no puedas terminar.**

```
INICIO — AUDIT (10-15 min):
1. Leer este archivo
2. Leer SOLIDIFICATION-PLAN.md → qué sesión toca
3. Verificar Firebase → qué hay realmente
4. Leer el código relevante COMPLETO
5. Entender qué espera vs qué hay
6. Identificar TODOS los puntos de fallo
7. Planear la fix (no codear todavía)

TRABAJO — FIXEAR (25-30 min):
8. Fixear UN problema a la vez
9. npm run build → 0 errores después de CADA cambio
10. npx svelte-check → 0 errores
11. Commit

CIERRE — PUSH (5-10 min):
12. Pedir token → push → limpiar remote
13. Actualizar este archivo + SOLIDIFICATION-PLAN.md
14. Resumir qué se hizo, qué falta, qué testear

REGLA DE TIEMPO:
- Si quedan 15 min y falta mucho → commitear lo que hay, cerrar bien
- Si quedan 5 min y no commiteaste → commitear YA, push, cerrar
- NUNCA dejar la sesión sin commit + push
- NUNCA empezar un bloque nuevo si no cerraste el actual

NO HACER:
- Codear sin audit primero
- Más de lo que dice la sesión
- Commitear sin build limpio
- Marcar ✅ sin test
- Saltar sesiones
- Fixear "por si acaso" sin confirmar el problema
```

---

## Archivos Clave

```
src/lib/stores/settings.ts       ★ Settings + migration (781 líneas)
src/lib/stores/auth.ts           ★ Auth + adminWhitelist
src/lib/stores/beats.ts          Beats CRUD + types
src/lib/stores/player.ts         Audio player
src/lib/stores/analytics.ts      Batched analytics
src/lib/stores/_firebaseStore.ts ★ Base store pattern
src/lib/theme.ts                 Theme engine (CSS vars)
src/lib/cardStyleEngine.ts       Card style engine (426 líneas)
src/lib/actions.ts               Svelte actions (tilt, reveal, etc.)
src/lib/upload.ts                Firebase Storage upload
src/lib/seed.ts                  ★ Seed demo beats
src/routes/(store)/+page.svelte  ★ Store index (hero, grid, filters)
src/routes/(store)/+layout.svelte★ Store layout (nav, footer, player)
src/routes/(store)/beat/[id]/+page.svelte Beat page
src/routes/(admin)/+layout.svelte★ Admin auth guard
src/routes/(admin)/admin/+page.svelte Dashboard (stats, seed, export)
src/routes/(admin)/admin/beats/+page.svelte Beats list
src/routes/(admin)/admin/beats/[id]/+page.svelte Beat editor
src/lib/components/BeatEditor.svelte ★ Beat editor component (660 líneas)
src/lib/components/BeatCard.svelte   Beat card component
src/lib/components/BeatModal.svelte  Beat modal component
src/lib/components/Player.svelte     Player bar
src/lib/components/Waveform.svelte   Waveform visualization
src/lib/components/Filters.svelte    Filters component
src/lib/components/FileUpload.svelte File upload with preview
src/app.css                      Design tokens (1191 líneas)
firebase-deployed-rules.json     Firebase rules (referencia)
```

---

## Lecciones Aprendidas

### Sesión 2026-04-25 (Deep Audit v2)

1. **`$effect` + `$state` read/write = loop** — En Svelte 5, si un `$effect` lee una variable `$state` (como `lastStatus`) y luego la escribe, se crea un ciclo infinito. La solución es `untrack()` para la lectura. Es el patrón más peligroso de Svelte 5.
2. **`{@html}` desde Firebase = XSS** — Cualquier contenido que venga de Firebase y se renderice con `{@html}` es un vector de ataque. Siempre sanitizar o usar formato estructurado.
3. **`$app/stores` vs `$app/state`** — Svelte 5 tiene dos APIs para `page`. `$app/stores` devuelve un store (requiere `$page`), `$app/state` devuelve el valor directamente. Mezclarlos funciona pero es inconsistente y deprecated.
4. **`getComputedStyle` en `$effect` por componente** — Si cada instancia de un componente ejecuta `getComputedStyle` en un `$effect`, el costo se multiplica por N. Usar un store compartido.
5. **`JSON.stringify` como dependency trigger** — Usar `JSON.stringify(obj)` dentro de un `$effect` para detectar cambios es costoso. Mejor usar un contador de versión o checksum.
6. **`Record<string, any>` en vez de tipos propios** — Cuando el store ya define tipos (`ThemeSettings`, `HeroVisualSettings`), castear a `any` pierde toda la seguridad. Siempre usar los tipos exportados.
7. **async sin try/catch en UI** — Toda función async que muestra feedback al usuario necesita try/catch con toast. Sin esto, los errores son silenciosos.
8. **`svelte-check` no detecta todo** — No detecta: dependency cycles en `$effect`, XSS via `{@html}`, dead code, runtime type mismats. Hay que auditar manualmente.

---

*Proyecto por @dacewav — 2026*
