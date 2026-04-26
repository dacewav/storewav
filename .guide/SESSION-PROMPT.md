# Session 46 Prompt — Security + Admin Reorganize

Pegar esto al inicio del próximo chat:

---

Leé estos archivos en orden:
1. .guide/INDEX.md
2. .guide/PROJECT_STATE.md  
3. .guide/BLOCK-CONTEXT.md

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads en R2 (cdn.dacewav.store), 153 tests, build limpio
- Admin: 15 páginas (reducido de 17), 4 grupos claros

## Sesión 45 completada:

### Security fixes (commit ec0ffdc):
- Upload endpoint: Firebase ID token verification + admin whitelist check
- Upload: MIME whitelist (image/audio/video), blocked dangerous extensions
- Firebase rules: analytics counts/daily restricted to admins
- Storage rules: admin whitelist on all paths
- sanitizeCSS(): blocks xss vectors in customCSS
- .gitignore: exclude memory/, .guide/, AI workspace files

### animIntensity system (commit ec0ffdc):
- `--anim-int` CSS var (0-1) per card, modulates ALL animation keyframes
- 55+ keyframes updated with `calc()` + `var(--anim-int, 1)`
- CardStyleEditor: slider 0-100% in Animation section
- BeatCard: reads `cardAnim.intensity` and maps to animIntensity
- 6 new tests

### Admin reorganize (commits 65ee61c, bfc44da):
- Nav: 4 groups (Tienda, Secciones, Visual, Sistema)
- Content page merged into Hero & Contenido
- Changelog → redirects to Features
- Links → redirects to Brand
- siblingHoverEffect default changed from 'blur' to 'none'
- Hovered card: blur(0px) !important

### Hover blur fix (commit fb81798):
- Removed `blur()` from BeatCard hover filter
- hoverBlur mapped to hoverSiblingsBlur (backward compat)
- CardStyleEditor: "Blur siblings" control with hint

## Pendientes para sesión 46:
1. **Browser testing** con Google auth — verificar login, admin access, upload flow
2. **Más merge de páginas finas** — banner+floating, brand+layout
3. **Theme page split** — separar en "Colores & Fuentes" y "Effects" (glow, particles, hero glow/stroke)
4. **Polish de UX** — tooltips, help text en controles confusos

Para acceder al admin:
npm install && npm run dev
→ http://localhost:5173/login → Google auth

Leé la guía, verifica el estado, y espera mi OK antes de codear.
