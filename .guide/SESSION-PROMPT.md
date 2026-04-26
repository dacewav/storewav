# 🚀 SESSION PROMPT — Copiar y pegar en chat nuevo

---

Lee estos archivos en orden:
1. .guide/INDEX.md
2. .guide/PROJECT_STATE.md
3. .guide/BLOCK-CONTEXT.md

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — 9 beats en Firebase, 117 tests, build limpio, svelte-check 0 errors
- MEGA-REBUILD-PLAN Sessions 1-8 completadas (media gallery, presets, feature toggles, emojis, changelog, cleanup)
- Admin: 20 páginas, 100+ controles
- GitHub Action listo para deploy Workers (agregar manual + secrets)
- Firebase UID whitelist activa

Pendientes principales:
1. Subir audio/cover a los 9 beats desde admin
2. GitHub Action: agregar workflow + secrets desde GitHub UI
3. Deploy Firebase rules para paths nuevos (themePresets/, gallery/, customEmojis/, changelog/)
4. Hero glow default color (negro → accent)
5. Stats productores (contar artistas únicos)

Para acceder al admin:
npm install && npm run dev
→ http://localhost:5173/login → "🧪 Entrar como tester (anónimo)"
→ UID anónimo debe estar en adminWhitelist/approved/ en Firebase

Lee la guía, verifica el estado, y espera mi OK antes de codear.
