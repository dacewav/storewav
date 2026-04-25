# 🎯 BLOCK-CONTEXT.md — Sesión Actual

> **Se REESCRIBE cada vez que cambiamos de sesión.**
> **Límite: 50 min por chat.**

## Sesión Actual: 29 — Theme Presets + Soft Delete + Rules Deploy

```yaml
sesión: "29"
bloque: "Theme Presets + Soft Delete/Restore + Firebase Rules + Audit"
objetivo: "Portar features del catalog, verificar admin→store flow"
tiempo: "~50 min"
estado: "✅ COMPLETADO"
último_commit: "d5f14ff"
tests_total: 117
svelte_check: "0 errors, 0 warnings"
```

### Session 29 — Resumen

**Theme Presets (NUEVO)**
- Store: `themePresets.ts` — CRUD con Firebase RTDB
- UI: Sección "💾 Presets de Tema" en admin/theme
- Guardar tema actual, aplicar, renombrar, eliminar
- 3 dots de color como preview
- Init lifecycle en stores/init.ts

**Soft Delete / Restore (NUEVO)**
- Beat type: campos `deleted` + `deletedAt`
- `trashBeat()` / `restoreBeat()` / `permanentDelete()`
- `trashedBeatsList` derived store
- Admin beats: tabs "🎵 Beats / 🗑️ Papelera"
- Papelera: restaurar o eliminar permanente con confirmación

**Card Style Fix (Session 28 follow-up)**
- CardStyleEditor: prop `onchange` + notify en cada set/reset
- cardstyle admin: `bind:value` + `onchange` para persistir
- BeatEditor: `cardStyle` en auto-save snapshot
- BeatCard: `layoutCSS` wired a `.beat-info`
- cardStyleEngine: `cardBg` + `cardBgOpacity` generan CSS

**Firebase Rules**
- `themePresets/` — read (auth) + write (admin)
- `beats/$beatId/deleted` — boolean
- `beats/$beatId/deletedAt` — number
- `settings/cardStyle/$key` — primitives
- Rules en `firebase.rules.json` — usuario debe deployar desde Firebase Console

**Guías actualizadas**
- `MEGA-REBUILD-PLAN.md` — 8 sesiones planificadas
- `PROJECT_STATE.md` — actualizado a Session 29

## Próxima sesión: 30 — Floating Elements + Scroll-aware Nav

Ver `MEGA-REBUILD-PLAN.md` Session 2.

## Estado de Sesiones

| Sesión | Bloque | Estado |
|--------|--------|--------|
| 1-28 | Anteriores | ✅ |
| 29 | Presets + Soft Delete + Rules | ✅ |
| 30 | Floating Elements + Scroll Nav | ⬜ Siguiente |

## Datos clave
- Deploy: Cloudflare Pages auto-deploy desde Git push
- Firebase: dacewav-store-3b0f5
- Dev server: `npm run dev -- --host 0.0.0.0 --port 5173`
- Login: `/login` → "🧪 Entrar como tester (anónimo)" (dev bypass)
- Firebase rules: usuario debe deployar manualmente desde Console
