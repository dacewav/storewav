# 🎯 BLOCK-CONTEXT.md — Contexto del Bloque Actual

> **Este archivo se REESCRIBE cada vez que cambiamos de bloque.**
> Contiene TODO lo que la IA necesita saber para el bloque actual.
> Es más rápido de leer que PROJECT_STATE.md completo.

---

## Bloque Actual: 1 — Design System

```yaml
bloque: 1
nombre: "Design System"
tarea_actual: "tokens.css"
tareas_completadas: 0
tareas_totales: 14
```

## Qué Necesita Saber la IA

### Contexto del Proyecto
- **Qué es:** Tienda de beats tipo BeatStars — tienda + admin
- **Stack:** SvelteKit + Firebase Realtime DB (modular SDK v9+) + Cloudflare Pages
- **Firebase project:** dacewav-store-3b0f5
- **Estilo:** dark (#0a0a0a), accent neón (#00ff88), fonts Syne/Space Grotesk/DM Mono
- **Proyecto anterior:** catalog (vanilla JS v5.2) — se deja atrás PERO se migran features
- **Archivo de análisis:** `.guide/CATALOG-ANALYSIS.md` — lee esto para entender qué migrar

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
- `.guide/PROJECT_STATE.md` — memoria del proyecto
- `.guide/LIVE-STATUS.md` — health check de guía
- `.guide/CHANGELOG.md` — log de sesiones
- `.guide/BOOTSTRAP.sh` — script de inicio
- `.guide/INSTALL-SKILLS.sh` — instala skills de diseño
- `.guide/REVIEW-GUIDE.md` — protocolo de actualización de guía
- `.guide/docs/DESIGN-REFERENCES.md` — se crea al instalar skills

### Lo que NO existe aún
- `package.json`
- `src/`
- `svelte.config.js`
- `.env`
- Cualquier código de SvelteKit

## Tareas del Bloque Actual

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 1 | `npm create svelte@latest` | ✅ | Skeleton project, TypeScript |
| 2 | Firebase SDK instalado | ✅ | `npm install firebase` |
| 3 | `.env` creado | ✅ | Keys reales configuradas |
| 4 | `src/lib/firebase.ts` | ✅ | Singleton, modular SDK v9, exports db + auth |
| 5 | Cloudflare config | ✅ | `@sveltejs/adapter-cloudflare` en svelte.config.js |
| 6 | `.gitignore` correcto | ✅ | node_modules, .env, .svelte-kit, build |
| 7 | `npm run build` exitoso | ✅ | Build en 144ms client + 2.3s SSR |
| 8 | Primer commit + push | ✅ | `a36f8f9` pushed to main |
| 9 | `npm run dev` funciona | ✅ | localhost:5173 carga correctamente |

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
