# StoreWav — Guía de Auditoría & Mejoras
**Fecha:** 2026-05-01 | **Session 61** | **Commits:** `e144da1` → `d0e944c`

---

## 📋 Resumen Ejecutivo

Sesión enfocada en 3 bugs críticos en producción: logo no se mostraba, Firebase no conectaba (banner offline), y CSP bloqueando Google One Tap.

**Estado final:** 222 tests pasando, svelte-check 0 errores, 4 deploys a producción.

---

## 🔧 Fixes Implementados

### 1. Logo no se muestra (commit `7e2c421`)
**Root cause:** `migrateOldData` en `settings.ts` solo leía `brand.logo` desde `t.logoUrl` (path `theme/` de Firebase), pero `updateField('brand.logo', url)` escribe a `settings/logoUrl` (flat key en path `settings/`). El flat key se ignoraba silenciosamente → `brand.logo` quedaba vacío → fallback de texto "DACEWAV".

**Fix:** `settings.ts` línea ~1164: check `d.logoUrl` primero, fallback a `t.logoUrl`. Mismo fix para `faviconUrl` y `ogImageUrl`.

**Tests nuevos:** 5 tests cubriendo migración logo/favicon/ogImage.

### 2. Firebase no conecta — banner "Sin conexión" (commit `d1ab4a6`)
**Root cause:** CSP `connect-src` tenía `wss://*.firebaseio.com` para WebSocket pero NO `https://*.firebaseio.com` para long-polling fallback. Cuando WebSocket está bloqueado (ISP, firewall, extensión), Firebase RTDB intenta HTTPS long-polling a `https://s-usc1b-nss-*.firebaseio.com/.lp` — que no estaba en el CSP → conexión fallaba silenciosamente.

**Fix:** Agregado `https://*.firebaseio.com` a `connect-src` en `hooks.server.ts`.

### 3. CSP — Google One Tap + Cloudflare Analytics (commits `d1ab4a6`, `752ac86`)
**Root cause:** `script-src` no incluía `accounts.google.com` ni `static.cloudflareinsights.com`. `style-src` no incluía `accounts.google.com` para el stylesheet de GSI.

**Fix:** Agregados ambos dominios a sus directivas CSP correspondientes.

### 4. Offline banner timeout agresivo (commit `d0e944c`)
**Root cause:** Timeout de 3 segundos para mostrar banner offline. En conexiones lentas o durante re-autenticación post-login, Firebase tarda más de 3s en conectar → banner falso positivo.

**Fix:** Timeout subido de 3s → 8s en `OfflineBanner.svelte`.

---

## 🚀 Deploys Realizados

| Commit | Contenido | Deploy |
|--------|-----------|--------|
| `7e2c421` | Logo migration fix | ❌ GitHub Actions falló (secrets faltantes) |
| `d1ab4a6` | CSP firebaseio + Google One Tap | ✅ Manual via wrangler |
| `752ac86` | CSP cloudflareinsights + style | ✅ Manual via wrangler |
| `d0e944c` | Offline timeout 8s | ✅ Manual via wrangler |

**Nota:** GitHub Actions deploy falla porque faltan secrets (`PUBLIC_*`, `CF_API_TOKEN`, `CF_ACCOUNT_ID`). Deploy manual con wrangler funciona.

---

## ⚠️ Issues Pendientes

### Admin Login — se queda cargando post-Google auth
**Status:** No resuelto en esta sesión. El `signInWithPopup` abre el popup correctamente, pero al volver al sitio, algo causa que Firebase RTDB desconecte temporalmente. El banner offline aparece (ahora con timeout 8s, puede que desaparezca). Necesita debug más profundo del flujo post-auth.

**Posibles causas:**
- Firebase RTDB re-autenticación post-login causa desconexión temporal
- `checkAdmin` hace un `get()` a Firebase que puede fallar si auth token no está listo
- CSP puede estar bloqueando algún endpoint de re-autenticación

**Archivos relevantes:**
- `src/lib/stores/auth.ts` — `loginWithGoogle()`, `checkAdmin()`
- `src/lib/stores/connection.ts` — `initConnection()`, `.info/connected`
- `src/lib/components/OfflineBanner.svelte` — timeout logic
- `src/routes/(store)/+layout.svelte` — init flow post-auth

### GitHub Actions Deploy roto
**Status:** No resuelto. Los secrets no están configurados en el repo.
**Fix:** Configurar en GitHub → Settings → Secrets → Actions:
- `CF_API_TOKEN`, `CF_ACCOUNT_ID`
- Todos los `PUBLIC_*` (Firebase keys, Google Client ID, Admin UIDs)

---

## 📊 Estado Actual

- **Tests:** 222 passing (217 originales + 5 nuevos)
- **svelte-check:** 0 errores
- **Producción:** Deployed via Cloudflare Workers (manual)
- **CSP:** Limpio — Firebase, Google Auth, Stripe, Cloudflare Analytics cubiertos
