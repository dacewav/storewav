# 🧠 PROJECT_STATE.md — Estado Rápido

> Referencia rápida. Para detalle, leer AUDIT-MASTER.md.

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Pages
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      11 planificadas (~50 min c/u)
sesión_actual: 2 (Bloque 1A — Hero)
commits:       26
```

## Quick Status

| Área | Status |
|------|--------|
| Build | ✅ 0 errores |
| svelte-check | ✅ 0/0 |
| Auth | ✅ adminWhitelist |
| Theme engine | ✅ |
| Settings migration | ⚠️ commiteado, sin test |
| Beats | ❌ vacío en Firebase |
| Store visual | ❌ no muestra datos reales |
| Admin | ⚠️ abre, no funciona bien |

## Commands útiles

```bash
# Build
npm run build

# Type check
npx svelte-check

# Verificar Firebase settings
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool

# Verificar Firebase theme
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/theme.json" | python3 -m json.tool

# Verificar Firebase beats
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"
```
