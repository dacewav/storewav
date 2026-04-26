# SESSION-50-PROMPT.md — Prompt para próxima sesión

Copia esto como primer mensaje en el nuevo chat:

---

**Repo**: https://github.com/dacewav/storewav

Leé estos archivos en orden:
1. `.guide/INDEX.md`
2. `.guide/BLOCK-CONTEXT.md`
3. `.guide/PROJECT_STATE.md`
4. `.guide/MEGA-PLAN-CONSOLIDATED.md`
5. `contracts/README.md`

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads en R2 (cdn.dacewav.store), 153 tests, build limpio
- Admin: 20 páginas, 100+ controles
- Sesión 49 completada: upload fix + countUp + mobile sidebar + HelpTips + audit completo
- Contratos de licencia subidos en `contracts/` (5 niveles: MP3, WAV, Premium, Ilimitada, Exclusiva)

**SESIÓN 50 — Ejecutar Fase 0 + Fase 1 del MEGA-PLAN-CONSOLIDATED.md**

Prioridad:
1. **Fase 0 — Seguridad**: Fix play counts security, .indexOn rules, rate limiting
2. **Fase 1 — E-Commerce**: Carrito + Checkout Stripe, Licencias + Contratos, Instant Delivery

Leé la guía, verificá el estado, y arrancá con Fase 0.

Para acceder al admin:
```
cd storewav && npm install && npm run dev
→ http://localhost:5173/login → "🧪 Entrar como tester (anónimo)"
```
