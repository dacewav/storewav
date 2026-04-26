# Session 54 Prompt — Auth Fix Verification + Remaining Tasks

Pegar esto al inicio del próximo chat:

---

Leé estos archivos en orden:
1. .guide/INDEX.md
2. .guide/BLOCK-CONTEXT.md
3. .guide/PROJECT_STATE.md
4. .guide/MEGA-PLAN-ECOMMERCE.md

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads en R2 (cdn.dacewav.store), 153 tests, build limpio
- Admin: 23 páginas (20 originales + 3 nuevas: analytics, discounts, emails)
- Fase 0 ✅ COMPLETADA: play counts API, .indexOn rules, rate limiting
- Fase 1 ✅ COMPLETADA: Cart, Stripe checkout, webhook, contracts PDF, email delivery, secure downloads, orders page
- Fase 2 ✅ COMPLETADA: Zip packaging, discount codes, sales analytics, email templates
- Contratos: 5 niveles sólidos, PDF generator completo con pdf-lib
- Auth: signInWithRedirect implementado (Vite 8 COOP fix) — NECESITA VERIFICACIÓN

## SESIÓN 54 — Prioridad:

1. **VERIFICAR AUTH** — El login con Google NO funciona aún. Se cambió de popup a redirect pero necesita testing real. Probar:
   - npm run dev → http://localhost:5173/login → "Continuar con Google"
   - Verificar que redirige a Google y vuelve logueado
   - Verificar que el admin access funciona
   - Si no funciona, debuggear con consola del browser

2. **Firebase rules deploy** — El usuario debe hacer deploy manual:
   - Link: https://raw.githubusercontent.com/dacewav/storewav/main/firebase.rules.json
   - Copiar → pegar en Firebase Console → Rules → Publish

3. **PDF Generator tests** — Unit tests para:
   - Genera PDF para cada licencia (5 tests)
   - Campos dinámicos se rellenan correctamente
   - Exclusiva tiene 14 cláusulas, no-exclusiva 13
   - PDF tiene múltiples páginas

4. **Build fix** — El build falla por env vars faltantes en Cloudflare Pages:
   - PUBLIC_FIREBASE_STORAGE_BUCKET
   - PUBLIC_ADMIN_UIDS
   - Verificar que todas las env vars están configuradas en Cloudflare

5. **Cualquier bug de Fase 2** — Testear:
   - Zip download (beat + contrato)
   - Discount codes (crear, aplicar en checkout)
   - Email templates (editar, preview, enviar)
   - Sales analytics (datos correctos)

Para acceder al admin:
cd storewav && npm install && npm run dev
→ http://localhost:5173/login → "Continuar con Google"

⚠️ IMPORTANTE: El archivo .env NO está en el repo. Copiar las Firebase keys al .env local:
```
PUBLIC_FIREBASE_API_KEY=AIzaSyCr2dekkLLifIg0_JlLfEleaV32b5XdvIQ
PUBLIC_FIREBASE_AUTH_DOMAIN=dacewav-store-3b0f5.firebaseapp.com
PUBLIC_FIREBASE_DATABASE_URL=https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
PUBLIC_FIREBASE_PROJECT_ID=dacewav-store-3b0f5
PUBLIC_FIREBASE_STORAGE_BUCKET=dacewav-store-3b0f5.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=163354805352
PUBLIC_FIREBASE_APP_ID=1:163354805352:web:d8a99d1d71323de1ed27dd
PUBLIC_ADMIN_UIDS=
```

Leé la guía, verificá el estado del auth, y arreglá lo que haga falta.
