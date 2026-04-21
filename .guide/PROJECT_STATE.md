# 🧠 PROJECT_STATE.md — Estado del Proyecto

> **Última actualización: 2026-04-22 04:11**

## Estado

```yaml
proyecto: dacewav/store (storewav)
repo: https://github.com/dacewav/storewav.git
framework: SvelteKit + Cloudflare Pages
firebase: dacewav-store-3b0f5
bloque_actual: "1 — Store Visual Fix"
commit_actual: "4f8452a"
problema_principal: "Firebase tiene estructura flat (vieja), código lee nested (nueva)"
```

## Lo que SÍ funciona

- ✅ Auth: Google login + adminWhitelist check
- ✅ Theme engine: accent, glow, fonts desde Firebase theme/
- ✅ Build: 0 errores, svelte-check: 0 errores
- ✅ Firebase rules: validación estricta
- ✅ Design system: 1191 líneas CSS, 65 keyframes, 28 icons
- ✅ 29 componentes, 10 stores, 7 actions
- ✅ Migration layer: flat→nested transform (no testeado en deploy)

## Lo que NO funciona

- ❌ Store visual: no muestra datos reales de Firebase
- ❌ Beats: vacío en Firebase
- ❌ Admin editors: no muestran valores actuales
- ❌ Cambios en admin no se reflejan (paths no matchean)

## Próximos pasos

Ver `AUDIT-MASTER.md` → Plan de Reconstrucción por bloques.
