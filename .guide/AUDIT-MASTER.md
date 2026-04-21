# 📋 AUDIT-MASTER.md — Guía Maestra

> **Última actualización: 2026-04-22 04:16**
> **Lee este archivo primero en cualquier sesión nueva.**

---

## ⚠️ REGLA DE ORO

**No hacer las cosas por hacer. Cada bloque se construye BIEN.**

- No fixear rápido → investigar, entender, fixear correcto
- No asumir que funciona → testear después de deploy
- No marcar ✅ sin test confirmado por el usuario
- No saltar bloques → uno a la vez
- No commitear basura

**Límite real: 50 minutos por chat.** Los bloques se estiman en chats, no en "horas de trabajo humano" (eso no existe).

---

## Estado del Proyecto

```
Código:    SvelteKit + Cloudflare Pages + Firebase RTDB
Repo:      dacewav/storewav
Firebase:  dacewav-store-3b0f5
Líneas:    ~13,500 | Archivos: 68 | Commits: 24
Límite:    50 min por sesión de chat
```

### ¿Qué funciona?

| Área | Status |
|------|--------|
| Auth | ✅ Google login + adminWhitelist |
| Theme engine | ✅ accent, glow, fonts desde Firebase |
| Build | ✅ 0 errores |
| Firebase rules | ✅ validación estricta |
| Design system | ✅ 1191 CSS, 65 keyframes, 28 icons |
| Componentes | ✅ 29 componentes, 10 stores, 7 actions |

### ¿Qué está roto?

| Área | Status |
|------|--------|
| Store visual | ❌ No muestra datos reales |
| Settings paths | ❌ Firebase flat, código nested |
| Beats | ❌ Vacío en Firebase |
| Admin editors | ❌ No muestran valores actuales |

---

## Estructura de Firebase (Datos Reales)

```bash
# Verificar:
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/theme.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"
```

**settings/** (flat, old):
- `heroTitle: ''`, `heroSubtitle: ''`, `siteName: 'YUGEN'`
- `bannerActive: true`, `bannerText: 'saca un toque . <3 !'`
- `whatsapp: '+527551492054'`, `instagram: 'dace.wav'`
- `dividerTitle: '<em>CALIDAD</em> AEGURADA'`
- `globalCardStyle: { glow, hover, shadow, filter, border, style, transform }`
- `testimonials: [{ name, text, role }]`

**theme/** (flat, all visual):
- `accent: '#dc2626'`, `fontBody: 'JetBrains Mono'`, `fontDisplay: 'Manrope'`
- `logoUrl: '...BLANCO_Dace.wav_PNG_Logo.png'`
- `heroEyebrow: 'En vivo · Puebla, MX'`, `heroTitleCustom: 'S'`
- `heroGlowBlur: 83`, `heroGlowInt: 3.4`, `glowAnim: 'flicker'`
- `radiusGlobal: 12`, `padSection: 4.5`, `beatGap: 19`
- `animLogo/Cards/Buttons/Player/Title/Waveform: { type, dur, del }`
- `particles*: { type: 'text', text: '𓆉', count: 17, ... }`
- 95+ keys total

**beats/** → NULL
**adminWhitelist/** → `{ email1: true, email2: true, email3: true }`

---

## Plan por Sesiones (50 min c/u)

### Sesión 1: Bloque 0 — Data Layer (ya hecho ✅)
- Migration layer en settings.ts
- Auth lee adminWhitelist
- ~30 min de trabajo real
- **Test pendiente:** ¿se muestran datos reales en deploy?

### Sesión 2: Bloque 1A — Hero
- [ ] Testear Bloque 0 en deploy (5 min)
- [ ] Fixear lo que no funcione del migration layer (15 min)
- [ ] Hero muestra título, eyebrow, glow word, subtitle (15 min)
- [ ] Hero links (Instagram, WhatsApp) (10 min)
- [ ] Commit + push + test (5 min)

### Sesión 3: Bloque 1B — Banner + Divider + Nav
- [ ] Banner visible con datos reales (10 min)
- [ ] Divider con título/subtítulo (10 min)
- [ ] Nav logo, links, mobile menu (15 min)
- [ ] Footer (5 min)
- [ ] Test + fix (10 min)

### Sesión 4: Bloque 2A — Beats Seed
- [ ] Crear seed de 6-8 beats en Firebase (20 min)
- [ ] Verificar que el grid renderiza (10 min)
- [ ] Fixear lo que no funcione (15 min)
- [ ] Test + commit (5 min)

### Sesión 5: Bloque 2B — Beat Interactions
- [ ] Play button (10 min)
- [ ] Wishlist toggle (5 min)
- [ ] Filters (search, genre, key, sort) (15 min)
- [ ] Featured section (5 min)
- [ ] Beat page links + navigation (10 min)
- [ ] Test + fix (5 min)

### Sesión 6: Bloque 3A — Admin Auth + Dashboard
- [ ] Verificar login funciona (5 min)
- [ ] Dashboard muestra stats reales (10 min)
- [ ] Beat list muestra beats existentes (15 min)
- [ ] Quick actions + export/import (15 min)
- [ ] Test (5 min)

### Sesión 7: Bloque 3B — Beat Editor
- [ ] Editar beat → carga datos actuales (15 min)
- [ ] Guardar → escribe a Firebase (10 min)
- [ ] Crear nuevo beat (10 min)
- [ ] Borrar beat (5 min)
- [ ] Test (10 min)

### Sesión 8: Bloque 3C — Content Editors
- [ ] Theme editor muestra/guarda valores (15 min)
- [ ] Content editor: hero, section, CTA (15 min)
- [ ] Brand editor: nombre, logo, whatsapp (10 min)
- [ ] Test cambios se reflejan en tienda (10 min)

### Sesión 9: Bloque 4 — Effects
- [ ] Cursor glow, scroll progress, orbs (15 min)
- [ ] Card glow/animation desde globalCardStyle (15 min)
- [ ] Hero parallax, sibling blur, stagger (15 min)
- [ ] Loader, grain overlay (5 min)

### Sesión 10: Bloque 5 — Labels + Polish
- [ ] Labels editables funcionan (15 min)
- [ ] CTA section configurable (10 min)
- [ ] Testimonials (10 min)
- [ ] Banner animations (5 min)
- [ ] Test general (10 min)

### Sesión 11: Bloque 6 — Final Audit
- [ ] Build + svelte-check (5 min)
- [ ] Todos los links (5 min)
- [ ] Mobile responsive (10 min)
- [ ] SEO meta tags (5 min)
- [ ] 0 console.log, 0 TODOs (5 min)
- [ ] A11y check (5 min)
- [ ] Limpieza final + commit (10 min)
- [ ] Deploy final + test (5 min)

**Total: 11 sesiones de 50 min = ~9 horas reales de chat**

---

## Protocolo por Sesión

```
INICIO (5 min):
1. Leer este archivo
2. Leer BLOCK-CONTEXT.md → qué sesión toca
3. Verificar Firebase → qué hay

TRABAJO (40 min):
4. Hacer SOLO lo que dice la sesión
5. npm run build → 0 errores
6. npx svelte-check → 0 errores
7. Commit

CIERRE (5 min):
8. git push
9. Actualizar BLOCK-CONTEXT.md
10. Decirle al usuario qué se hizo y qué falta

NO HACER:
- Más de lo que dice la sesión
- Commitear sin build limpio
- Marcar ✅ sin test
- Saltar sesiones
```

---

## Archivos Clave

```
src/lib/stores/settings.ts       ★ Settings + migration
src/lib/stores/auth.ts           ★ Auth + adminWhitelist
src/lib/stores/beats.ts          Beats CRUD
src/lib/stores/player.ts         Audio player
src/lib/theme.ts                 Theme engine
src/routes/(store)/+page.svelte  ★ Store index
src/routes/(store)/+layout.svelte★ Store layout
src/routes/(store)/beat/[id]/+page.svelte Beat page
src/routes/(admin)/+layout.svelte★ Admin auth guard
src/routes/(admin)/admin/beats/+page.svelte Beats list
src/lib/components/BeatEditor.svelte Beat editor
src/app.css                      Design tokens
```

---

## Instrucciones para Chat Nuevo

1. Clonar: `git clone https://github.com/dacewav/storewav.git`
2. Leer `.guide/AUDIT-MASTER.md` (este archivo)
3. Leer `.guide/BLOCK-CONTEXT.md` → qué sesión toca
4. Verificar Firebase: `curl -s "URL/settings.json"`
5. Hacer SOLO lo de la sesión actual
6. Commit + push
7. Actualizar BLOCK-CONTEXT.md
