# SESSION-53-PROMPT.md — Prompt para próxima sesión

Copia esto como primer mensaje en el nuevo chat:

---

**Repo**: https://github.com/dacewav/storewav

Leé estos archivos en orden:
1. `.guide/INDEX.md`
2. `.guide/BLOCK-CONTEXT.md`
3. `.guide/PROJECT_STATE.md`
4. `contracts/README.md`

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads en R2 (cdn.dacewav.store), 153 tests, build limpio
- Admin: 20 páginas, 100+ controles
- **Fase 0 ✅ COMPLETADA**: play counts API, .indexOn rules, rate limiting
- **Fase 1 ✅ COMPLETADA**: Cart, Stripe checkout, webhook, contracts PDF, email delivery, secure downloads, orders page
- Contratos de licencia en `contracts/` (5 niveles: MP3, WAV, Premium, Ilimitada, Exclusiva)
- GitHub token en `.env` como `GITHUB_TOKEN`
- Resend API configurado, dominio dacewav.store verificado
- Firebase rules: paidOrders .read=true (ya deployada)

**SESIÓN 53 — Fase 2: E-Commerce Mejoras**

Prioridad:
1. **Zip packaging** — Beat + stems + contrato en un zip para descarga
2. **Discount codes** — Admin page para CRUD + validación en checkout
3. **Email templates** — Customizables desde admin
4. **Sales analytics** — Revenue dashboard en admin

Licencias y precios (ya definidos):
- MP3: $350 MXN / $20 USD
- WAV: $750 MXN / $45 USD
- Premium: $1,500 MXN / $90 USD
- Ilimitada: $5,000 MXN / $300 USD
- Exclusiva: cotización por WhatsApp

Para acceder al admin:
```
cd storewav && npm install && npm run dev
→ http://localhost:5173/login → "🧪 Entrar como tester (anónimo)"
```
