# 🎯 Sesión 56 — Prompt

> Copiar y pegar al inicio del próximo chat.

---

Leé estos archivos en orden:
1. `.guide/INDEX.md`
2. `.guide/BLOCK-CONTEXT.md`
3. `.guide/PROJECT_STATE.md`
4. `.guide/MEGA-PLAN-ECOMMERCE.md`

Repo: https://github.com/dacewav/storewav

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads en R2 (cdn.dacewav.store), 197 tests
- Fase 2 COMPLETADA: zip packaging, discount codes, email templates, sales analytics
- Fase 3 PARCIAL: likes, comments, wishlist sync, account page, profile edit
- Auth: signInWithRedirect + Email Link (passwordless) + Google One Tap (config pendiente)
- Contratos: 5 niveles, PDF generator, editor con 31 variables en Firebase
- Admin: /admin/contracts, /admin/contracts/editor, /admin/comments, /admin/analytics con likes

## SESIÓN 56 — Prioridad:

### 🔴 URGENTE
1. **AUTH FIX — múltiples cuentas Google**:
   - `signInWithRedirect` no funciona cuando el usuario tiene múltiples cuentas de Google
   - Selecciona cuenta en Google → redirige → sin login
   - Fix: agregar `dacewav.store` + `*.pages.dev` a Firebase Authorized Domains
   - O cambiar a `signInWithPopup` como fallback cuando redirect falla
   - Testear con cuenta que NO sea daceidk

### 🟡 ALTA
2. **Google One Tap activar en Cloudflare**:
   - Cloudflare Pages → Environment variables → agregar:
   - `PUBLIC_GOOGLE_CLIENT_ID = 163354805352-v4jmd8qnck443j2qca4t405c0ciem9h3.apps.googleusercontent.com`
   - Ya está integrado en `src/lib/oneTap.ts` + store layout

3. **Firebase Rules deploy**:
   - `firebase deploy --only database:rules`
   - Reglas nuevas en `firebase.rules.json` (users, likes, comments, wishlist, contractTemplates)

### 🟢 MEDIA
4. **Avatar upload** — R2 crop o foto de Google
5. **Zip con stems** — beat + stems + contrato en un zip

⚠️ Copiar .env con Firebase keys antes de npm run dev
