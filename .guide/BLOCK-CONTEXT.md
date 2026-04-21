# 🎯 BLOCK-CONTEXT.md — Contexto del Bloque Actual

> **REESCRITO 2026-04-22 04:06 — Reconstrucción desde cero**

## Bloque Actual: 0 — Data Layer Fix

```yaml
bloque: "0"
nombre: "Fix data layer — leer datos reales de Firebase"
estado: "en progreso"
problema: "Código lee paths nuevos (nested) pero Firebase tiene estructura vieja (flat)"
```

## Estado Real del Proyecto

- ✅ Auth: lee `adminWhitelist/{email}` (fixeado)
- ❌ Settings: estructura no matchea (flat vs nested)
- ❌ Beats: vacío en Firebase
- ✅ Theme engine: lee accent, glow, fonts correctamente
- ❌ Store visual: todo vacío porque settings no matchean
- ⚠️ Admin: abre pero no muestra datos actuales

## Referencia

| Archivo | Qué contiene |
|---------|-------------|
| `.guide/REAL-AUDIT.md` | Audit honesto contra Firebase real |
| `.guide/BLOCK-CONTEXT.md` | Este archivo |
| `src/lib/stores/settings.ts` | Settings store (lee de Firebase) |
