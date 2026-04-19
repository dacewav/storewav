# 🎯 BLOCK-CONTEXT.md — Contexto del Bloque Actual

> **Este archivo se REESCRIBE cada vez que cambiamos de bloque.**
> Contiene TODO lo que la IA necesita saber para el bloque actual.
> Es más rápido de leer que PROJECT_STATE.md completo.

---

## Bloque Actual: NINGUNO (proyecto no iniciado)

```yaml
bloque: 0
nombre: "Setup del Proyecto"
tarea_actual: "ninguna — esperando primer chat"
tareas_completadas: 0
tareas_totales: 9
```

## Qué Necesita Saber la IA

### Contexto del Proyecto
- **Qué es:** Tienda de beats tipo BeatStars — tienda + admin
- **Stack:** SvelteKit + Firebase Realtime DB (modular SDK v9+) + Cloudflare Pages
- **Firebase project:** dacewav-store-3b0f5
- **Estilo:** dark (#0a0a0a), accent neón (#00ff88), fonts Syne/Space Grotesk/DM Mono
- **Proyecto anterior:** catalog (vanilla JS v5.2) — se deja atrás PERO se migran features
- **Archivo de análisis:** `CATALOG-ANALYSIS.md` — lee esto para entender qué migrar

### Features a migrar desde catalog
- **Player** (AP object) → Svelte component + store
- **Filters** (genre, key, mood, search, sort, tag cloud) → Svelte component
- **Effects** (cursor glow, parallax, 3D tilt, staggered reveal) → Svelte actions
- **Waveform** (SVG from audio) → Svelte component
- **Analytics** (batched events) → Svelte store
- **Wishlist** (localStorage) → Svelte store
- **Hero builder** (configurable, glow/stroke) → Svelte component
- **Skeleton loading** → Svelte component
- **Audio error recovery** (retry logic) → Svelte store

### Features a NO migrar (reemplazar)
- ❌ Hash router → SvelteKit file routing
- ❌ Window globals → Svelte events
- ❌ getElementById → Svelte bind:this
- ❌ localStorage bridge → Firebase onValue()
- ❌ Firebase compat SDK → Firebase modular SDK v9
- ❌ esbuild custom build → Vite (incluido en SvelteKit)
- ❌ External CSS → Svelte scoped styles

### Estructura Firebase (desde catalog)
```
beats/{id} → name, genre, bpm, key, tags, imageUrl, audioUrl, previewUrl, licenses, cardStyle, order, plays
settings → siteName, heroTitle, heroSubtitle, whatsapp, instagram, banner*, heroLinks, floatingElements
theme → bg, surface, accent, text, muted, glow*, cardOpacity, radiusGlobal, heroTitle*, logo*, font*
analytics/events/{date}/{id} → analytics/counts/{beatId} → analytics/daily/{date}
```
- `README.md` — descripción básica
- `PROJECT_STATE.md` — memoria del proyecto
- `LIVE-STATUS.md` — health check de guía
- `CHANGELOG.md` — log de sesiones
- `BOOTSTRAP.sh` — script de inicio
- `INSTALL-SKILLS.sh` — instala skills de diseño
- `REVIEW-GUIDE.md` — protocolo de actualización de guía
- `docs/DESIGN-REFERENCES.md` — se crea al instalar skills

### Lo que NO existe aún
- `package.json`
- `src/`
- `svelte.config.js`
- `.env`
- Cualquier código de SvelteKit

## Tareas del Bloque Actual

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 1 | `npm create svelte@latest` | ⬜ | Skeleton project, TypeScript, no ESLint/Prettier |
| 2 | Firebase SDK instalado | ⬜ | `npm install firebase` |
| 3 | `.env` creado | ⬜ | Firebase keys (NO commitear) |
| 4 | `src/lib/firebase.ts` | ⬜ | Módulo central Firebase |
| 5 | Cloudflare config | ⬜ | `@sveltejs/adapter-cloudflare` |
| 6 | `.gitignore` correcto | ⬜ | node_modules, .env, .svelte-kit, dist |
| 7 | `npm run build` exitoso | ⬜ | Verificar que compila |
| 8 | Primer commit + push | ⬜ | "chore: project setup" |
| 9 | `npm run dev` funciona | ⬜ | Abrir localhost:5173, ver página |

## Decisiones Pendientes del Bloque

| Decisión | Opciones | Decidido por |
|----------|----------|-------------|
| TypeScript o JavaScript | TS (recomendado) / JS | pendiente |
| R2 o Firebase Storage para audio | R2 (más barato) / Firebase Storage | pendiente |
| Auth provider | Solo Google / Google + Email | pendiente |

## Errores Conocidos de este Bloque

| Error | Solución |
|-------|----------|
| — | (agregar aquí si aparecen) |

## Archivos que la IA debe consultar

1. **PROJECT_STATE.md** — estructura de bloques completa
2. **GUIA-COMPLETA.md** — arquitectura detallada
3. **ERRORES-COMUNES.md** — errores y soluciones conocidas
4. **docs/DESIGN-REFERENCES.md** — reglas de diseño

---

**Última actualización:** 2026-04-19 — inicial
**Próxima actualización:** cuando cambie de bloque o se complete una tarea
