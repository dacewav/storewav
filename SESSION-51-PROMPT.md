# SESSION-51-PROMPT.md — Prompt para próxima sesión

Copia esto como primer mensaje en el nuevo chat:

---

**Repo**: https://github.com/dacewav/storewav

Leé estos archivos en orden:
1. `.guide/INDEX.md`
2. `.guide/BLOCK-CONTEXT.md`
3. `.guide/PROJECT_STATE.md`
4. `contracts/README.md`
5. `SESSION-50-PROMPT.md` (contexto de Fase 0 completada)

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads en R2 (cdn.dacewav.store), 153 tests, build limpio
- Admin: 20 páginas, 100+ controles
- **Fase 0 ✅ COMPLETADA**: play counts API, .indexOn rules, rate limiting (commit 1936246)
- Contratos de licencia en `contracts/` (5 niveles: MP3, WAV, Premium, Ilimitada, Exclusiva)
- GitHub token en `.env` como `GITHUB_TOKEN` (para push)

**SESIÓN 51 — Ejecutar Fase 1 del plan: E-Commerce**

## Fase 1 — E-Commerce (Carrito + Checkout + Delivery)

### 1. Carrito de compras
- Store `cart.ts` con persistencia localStorage
- UI: botón "Agregar al carrito" en BeatCard y BeatDetail
- Selector de licencia (MP3/WAV/Premium/Ilimitada/Exclusiva) con precios
- Cart panel/drawer con items, totales, quitar
- Badge contador en nav

### 2. Checkout Stripe
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` en `.env` (pedir al usuario si no los tiene)
- `/api/checkout` — crea Stripe Checkout Session con line items del carrito
- `/api/webhook` — confirma pago, genera contrato, envía email
- Success/Cancel pages

### 3. Licencias + Contratos
- Precios por licencia (definir con el usuario):
  - MP3: $?
  - WAV: $?
  - Premium: $?
  - Ilimitada: $?
  - Exclusiva: $?
- Generar PDF del contrato con datos del comprador + beat + fecha
- Guardar contrato en Firebase RTDB `orders/` + PDF en R2

### 4. Instant Delivery
- Email post-pago con:
  - Link de descarga (R2 signed URL o directo)
  - Contrato PDF adjunto
  - Confirmación de compra
- Servicio: Cloudflare Email Workers o Resend

### Prioridad de sesión:
1. Definir precios de licencias (preguntar al usuario)
2. Cart store + UI
3. Stripe checkout integration
4. Webhook + order processing
5. Contract PDF generation
6. Email delivery

### Notas técnicas:
- Cloudflare Workers tiene limits en body size — PDFs deben ser ligeros
- Stripe Checkout es server-side, no necesitamos Stripe.js en frontend
- Firebase RTDB para orders: `{orderId, buyerEmail, beatId, licenseType, amount, contractUrl, downloadUrl, timestamp}`
- Usar `pdf-lib` o similar para generar PDFs (compatible con Workers)

Para acceder al admin:
```
cd storewav && npm install && npm run dev
→ http://localhost:5173/login → "🧪 Entrar como tester (anónimo)"
```
