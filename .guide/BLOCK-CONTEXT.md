# 🎯 BLOCK-CONTEXT.md — Bloque Actual

> **Se REESCRIBE cada vez que cambiamos de bloque.**

## Bloque Actual: 1 — Store Visual Fix

```yaml
bloque: "1"
nombre: "Hero + Banner + Footer con datos reales de Firebase"
estado: "pendiente"
problema: "Migration layer commiteado (4f8452a) pero NO testeado en deploy"
sesión: "2026-04-22"
commits_totales: 22
```

## Checklist del Bloque

- [ ] Hero muestra título de `settings.siteName` ('YUGEN')
- [ ] Hero muestra eyebrow de `theme.heroEyebrow` ('En vivo · Puebla, MX')
- [ ] Hero muestra glow word de `theme.heroTitleCustom` ('S')
- [ ] Hero muestra subtitle
- [ ] Banner se muestra (lee `settings.bannerActive` = true)
- [ ] Divider se muestra (`settings.dividerTitle`)
- [ ] Footer muestra nombre de marca
- [ ] Nav logo carga (`theme.logoUrl`)
- [ ] Nav links (Instagram, WhatsApp) funcionan
- [ ] CTA se muestra si hay datos

## Estado General

| Bloque | Status |
|--------|--------|
| 0 — Data Layer | ✅ commiteado, necesita test |
| 1 — Store Visual | ⬜ pendiente |
| 2 — Beats | ❌ sin beats en DB |
| 3 — Admin | ⚠️ abre pero no muestra datos |
| 4 — Effects | ⬜ pendiente |
| 5 — Content/Labels | ⬜ pendiente |
| 6 — Final Audit | ⬜ pendiente |

## Datos Reales en Firebase

```bash
# Verificar settings:
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json"

# Verificar theme:
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/theme.json"

# Verificar beats:
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"

# Verificar admins (permission denied = normal, usa adminWhitelist):
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/adminWhitelist.json"
```

## Referencia

| Archivo | Qué tiene |
|---------|-----------|
| `AUDIT-MASTER.md` | Plan completo, protocolo, archivos clave |
| `REAL-AUDIT.md` | Mapeo exacto paths código vs Firebase |
| `BLOCK-CONTEXT.md` | Este archivo — bloque actual |
| `DESIGN-PLAN.md` | Plan de diseño visual (catalog vs store) |
| `PROJECT_STATE.md` | Estado legacy (desactualizado) |
