# 🎯 BLOCK-CONTEXT.md — Bloque Actual

> **Se REESCRIBE cada vez que cambiamos de bloque.**

## Bloque Actual: 1 — Store Visual Fix

```yaml
bloque: "1"
nombre: "Que la tienda se vea con datos reales"
estado: "pendiente"
tiempo_estimado: "4-6 horas"
sesión: "2026-04-22"
commits: 23
commit_actual: "d78bd9b"
```

## Estado de Bloques

| Bloque | Estado | Tiempo |
|--------|--------|--------|
| 0 — Data Layer | ✅ hecho (sin test) | 3-4h |
| 1 — Store Visual | ⬜ pendiente | 4-6h |
| 2 — Beats | ❌ sin beats en DB | 4-6h |
| 3 — Admin Panel | ⚠️ abre, no funciona | 5-7h |
| 4 — Effects | ⬜ pendiente | 3-4h |
| 5 — Content/Labels | ⬜ pendiente | 2-3h |
| 6 — Final Audit | ⬜ pendiente | 2-3h |
| **TOTAL** | | **23-33h** |

## Qué hacer en Bloque 1

Primero testear que Bloque 0 funciona en deploy real. Si no, fixear primero.

Luego, sub-bloques:
- **1A: Hero** (1-2h) — título, eyebrow, glow, subtitle, stats, links
- **1B: Banner + Divider + Footer** (1-2h)
- **1C: Nav** (1h) — logo, links, mobile menu
- **1D: Test** (1h) — deploy, browser test, fix bugs

## Referencia

Lee `AUDIT-MASTER.md` para el plan completo y protocolo.
Lee `REAL-AUDIT.md` para el mapeo de datos Firebase.
