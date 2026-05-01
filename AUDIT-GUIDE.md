# StoreWav — Guía de Auditoría & Mejoras
**Fecha:** 2026-05-01 | **Session 62** | **Commits:** `d0e944c` → `1552af7`

---

## 📋 Resumen Ejecutivo

Sesión enfocada en 3 issues: admin login roto post-Google auth, CSP bloqueando Firebase auth iframe, y configuración de env vars faltantes.

**Estado final:** 222 tests passing, deployed (`d9bb45a`), login NO funciona todavía — falta autorizar `dacewav.store` en Google Cloud Console OAuth client.

---

## 🔧 Fixes Implementados

### 1. Admin Login — checkAdmin retry + timeout (commit `8055151`)
**Root cause:** `checkAdmin()` hacía un `get()` a Firebase RTDB que podía colgarse indefinidamente si la conexión no estaba lista post-auth (token refresh).

**Fix:** 
- `getWithTimeout()` helper con timeout de 5s por lectura RTDB
- `checkAdmin()` reintenta hasta 3 veces con backoff (1s, 2s, 3s)
- Si la RTDB devuelve null (timeout), reintenta. Si devuelve datos válidos (user not admin), no reintenta.

### 2. Connection grace period (commit `8055151`)
**Root cause:** Firebase RTDB se desconecta brevemente durante `signInWithPopup` para refrescar el auth token. `.info/connected` dispara `false` inmediatamente → banner "Sin conexión" aparece en cada login.

**Fix:** 3s de delay en `connection.ts` antes de marcar como desconectado. Reconexión es instantánea (cancela timer pendiente).

### 3. Login page UX (commit `8055151`)
- Muestra "Verificando permisos..." spinner mientras `adminChecked` es false
- Redirect a `/admin` espera `adminChecked && isAdmin` (antes solo `isAdmin`)

### 4. signInWithRedirect directo (commit `0d8ca48`)
**Root cause:** `signInWithPopup` abre popup → Google pone `COOP: same-origin` en sus páginas OAuth → `firebaseapp.com/__/auth/handler` no puede hacer `postMessage` al opener → popup se cuelga. El fallback a redirect también falla porque el popup ya consumió el código OAuth.

**Fix:** `loginWithGoogle()` ahora usa `signInWithRedirect` directo. Sin popup. Navega la página completa.

### 5. CSP frame-src — firebaseapp.com (commit `1552af7`)
**Root cause:** Firebase SDK usa un iframe a `dacewav-store-3b0f5.firebaseapp.com/__/auth/iframe` para auth. CSP `frame-src` no incluía `firebaseapp.com` → iframe bloqueado → auth no funciona.

**Fix:** Agregado `https://*.firebaseapp.com` a `frame-src` en `hooks.server.ts`.

### 6. CSP connect-src — firebaseapp.com (commit `d62ba28`)
**Fix:** Agregado `https://*.firebaseapp.com` a `connect-src`.

### 7. .env configuración
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID=163354805352`
- `PUBLIC_FIREBASE_APP_ID=1:163354805352:web:d8a99d1d71323de1ed27dd`
- `PUBLIC_GOOGLE_CLIENT_ID=163354805352-v4jmd8qnck443j2qca4t405c0ciem9h3.apps.googleusercontent.com`
- `PUBLIC_ADMIN_UIDS=Uks9YGSd6rS40zqlRujoe6pE6N22`

---

## 🚀 Deploys Realizados

| Commit | Contenido | Deploy |
|--------|-----------|--------|
| `8055151` | auth retry + connection grace + login UX | ✅ wrangler |
| `6485377` | .env.example populated | ✅ wrangler |
| `d62ba28` | popup timeout + admin UID + firebaseapp CSP | ✅ wrangler |
| `0d8ca48` | signInWithRedirect directo | ✅ wrangler |
| `1552af7` | CSP frame-src firebaseapp.com | ✅ wrangler (current) |

---

## ⚠️ Issues Pendientes

### 1. Login NO funciona — falta autorizar origen en Google OAuth
**Status:** No resuelto. Error en consola:
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

**Root cause:** El OAuth 2.0 Client ID (`163354805352-v4jmd8qnck443j2qca4t405c0ciem9h3.apps.googleusercontent.com`) no tiene `https://dacewav.store` como Authorized JavaScript Origin.

**Fix manual (el usuario tiene que hacerlo):**
1. Google Cloud Console → APIs & Services → Credentials
2. Buscar OAuth 2.0 Client ID
3. Agregar `https://dacewav.store` a Authorized JavaScript origins
4. Firebase Console → Authentication → Settings → Authorized domains → agregar `dacewav.store`

### 2. GitHub Actions Deploy roto
**Status:** No resuelto. Secrets no configurados en el repo.
**Fix:** GitHub → Settings → Secrets → Actions:
- `CF_API_TOKEN`, `CF_ACCOUNT_ID`
- `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_DATABASE_URL`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_STORAGE_BUCKET`, `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_GOOGLE_CLIENT_ID`, `PUBLIC_ADMIN_UIDS`

---

## 📊 Estado Actual

- **Tests:** 222 passing
- **Producción:** Deployed via Cloudflare Workers (manual wrangler) — `d9bb45a`
- **CSP:** Firebase auth iframe habilitado (`frame-src` + `connect-src` incluyen `firebaseapp.com`)
- **Auth flow:** `signInWithRedirect` directo (sin popup)
- **Admin UID:** Configurado (`Uks9YGSd6rS40zqlRujoe6pE6N22`)
- **Login:** ❌ Bloqueado — falta autorizar origen en Google Cloud Console

---

## 📁 Archivos Modificados (Session 62)

| Archivo | Cambios |
|---------|---------|
| `src/lib/stores/auth.ts` | `getWithTimeout()`, `checkAdmin()` retry 3x, `loginWithGoogle()` → redirect directo, logging verbose |
| `src/lib/stores/connection.ts` | Grace period 3s antes de marcar desconectado |
| `src/routes/(store)/login/+page.svelte` | Spinner "Verificando permisos...", redirect espera `adminChecked` |
| `src/hooks.server.ts` | CSP: `firebaseapp.com` en `connect-src` + `frame-src` |
| `.env.example` | Poblado con Firebase keys, Google Client ID, Admin UID |
