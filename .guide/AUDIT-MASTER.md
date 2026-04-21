# 📋 AUDIT-MASTER.md — Guía Maestra

> **Última actualización: 2026-04-22 04:13**
> **Lee este archivo primero en cualquier sesión nueva.**

---

## ⚠️ REGLA DE ORO

**NO hacer las cosas por hacer. Cada bloque se construye BIEN.**

- No fixear rápido → investigar, entender, fixear correcto
- No asumir que funciona → testear en browser real después de deploy
- No marcar ✅ sin test manual confirmado por el usuario
- No saltar bloques → uno a la vez, en orden
- No commitear basura → cada commit debe ser limpio

**Una tienda no se fixea en 5 minutos.** Si un bloque dice "2-3h", es 2-3h de trabajo real. No intentes hacer 3 bloques en un chat corto.

---

## Estado del Proyecto

```
Código:    SvelteKit + Cloudflare Pages + Firebase RTDB
Repo:      dacewav/storewav
Firebase:  dacewav-store-3b0f5
Líneas:    ~13,500 | Archivos: 68 | Commits: 23
```

### ¿Qué funciona?

| Área | Status | Detalle |
|------|--------|---------|
| Auth | ✅ | Google login + adminWhitelist check |
| Theme engine | ✅ | Lee accent, glow, fonts desde Firebase theme/ |
| Build | ✅ | 0 errores, svelte-check 0/0 |
| Firebase rules | ✅ | Validación estricta |
| Design system | ✅ | 1191 líneas CSS, 65 keyframes, 28 icons |
| Componentes | ✅ | 29 componentes, 10 stores, 7 actions |

### ¿Qué está roto?

| Área | Status | Detalle |
|------|--------|---------|
| Store visual | ❌ | No muestra datos reales de Firebase |
| Settings | ❌ | Código lee paths nested, Firebase tiene flat |
| Beats | ❌ | Vacío en Firebase |
| Admin editors | ❌ | No muestran valores actuales |
| Banner/CTA/Divider | ❌ | No se muestran (paths no matchean) |

---

## Estructura de Firebase (Datos Reales)

```
settings/              (estructura VIEJA — flat)
├── heroTitle: ''
├── heroSubtitle: ''
├── siteName: 'YUGEN'
├── bannerActive: true
├── bannerText: 'saca un toque . <3 !'
├── whatsapp: '+527551492054'
├── instagram: 'dace.wav'
├── dividerTitle: '<em>CALIDAD</em> AEGURADA'
├── dividerSub: '...'
├── globalCardStyle: { glow, hover, shadow, filter, border, style, transform }
├── testimonials: [{ name, text, role }]
└── sections: { featured: true, testimonials: true }

theme/                 (estructura FLAT — toda la config visual)
├── accent: '#dc2626'
├── fontBody: 'JetBrains Mono'
├── fontDisplay: 'Manrope'
├── logoUrl: '...BLANCO_Dace.wav_PNG_Logo.png'
├── heroEyebrow: 'En vivo · Puebla, MX'
├── heroGlowBlur: 83, heroGlowInt: 3.4
├── heroTitleCustom: 'S', heroSubCustom: ':/'
├── radiusGlobal: 12, padSection: 4.5
├── glowColor: '#ff0026', glowAnim: 'flicker'
├── particles*: (partículas configuradas)
├── animLogo/Cards/Buttons/Player/Title/Waveform: { type, dur, del }
└── ... 95+ keys

beats/                 → NULL
adminWhitelist/        → { 'daceidk@gmail,com': true, 'prodxce@gmail,com': true, 'xiligamesz@gmail,com': true }
```

### Verificar datos en Firebase

```bash
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/theme.json" | python3 -m json.tool
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/beats.json"
```

---

## Plan de Reconstrucción

### BLOQUE 0: Data Layer — Migration (3-4h) ✅ HECHO
**Objetivo:** Que el código lea datos reales de Firebase sin importar la estructura.
- [x] Migration layer en settings.ts (flat→nested)
- [x] Auth lee adminWhitelist/{email}
- [x] Build + svelte-check limpios
- [ ] **TEST PENDIENTE** — verificar en deploy real que hero/banner/divider se muestran

**Nota:** Commiteado pero no verificado en browser. El siguiente chat debe testear esto primero.

---

### BLOQUE 1: Store Visual — Que se vea (4-6h)
**Objetivo:** Que la tienda se vea viva con datos reales al entrar.

**Sub-bloque 1A: Hero (1-2h)**
- [ ] Título se lee de `siteName` o `heroTitle`
- [ ] Eyebrow se lee de `theme.heroEyebrow`
- [ ] Glow word se lee de `theme.heroTitleCustom`
- [ ] Subtitle se muestra
- [ ] Stats animados (beats count, géneros, licencias)
- [ ] Hero links desde settings (Instagram, WhatsApp)
- [ ] Gradiente de fondo funciona

**Sub-bloque 1B: Banner + Divider + Footer (1-2h)**
- [ ] Banner visible si `bannerActive` = true
- [ ] Banner text, color, animación correctos
- [ ] Divider con título y subtítulo
- [ ] Footer con nombre de marca y links

**Sub-bloque 1C: Nav (1h)**
- [ ] Logo carga desde `theme.logoUrl`
- [ ] Links del nav (sección, Instagram, WhatsApp)
- [ ] Wishlist button
- [ ] Theme toggle (dark/light)
- [ ] Mobile hamburger menu

**Sub-bloque 1D: Test manual (1h)**
- [ ] Deploy → abrir tienda en browser
- [ ] Verificar cada elemento visual
- [ ] Verificar mobile (480px, 768px)
- [ ] Fixear lo que no se vea bien
- [ ] Commit + push

---

### BLOQUE 2: Beats — Seed + Grid (4-6h)
**Objetivo:** Que la tienda tenga beats y el catálogo funcione.

**Sub-bloque 2A: Seed (1h)**
- [ ] Crear 6-8 beats de ejemplo en Firebase
- [ ] Cada beat: title, artist, bpm, key, genre, tags, licenses, active, featured
- [ ] Usar el seed.html o escribir via REST API

**Sub-bloque 2B: Beat Grid (2h)**
- [ ] Cards renderizan con datos reales
- [ ] Cover image (placeholder si no hay)
- [ ] Título, artista, precio, BPM, key
- [ ] Tags visibles
- [ ] Genre badge
- [ ] Featured badge "TOP"

**Sub-bloque 2C: Interacciones (1-2h)**
- [ ] Play button reproduce audio
- [ ] Wishlist toggle funciona
- [ ] Filters (search, genre, key, sort, tags) filtran
- [ ] Counter "X de Y beats"
- [ ] Empty state cuando no hay resultados
- [ ] Skeleton loading mientras carga

**Sub-bloque 2D: Test (1h)**
- [ ] Deploy → verificar beats en tienda
- [ ] Probar cada filtro
- [ ] Probar play/wishlist
- [ ] Probar click → beat page
- [ ] Fixear bugs
- [ ] Commit + push

---

### BLOQUE 3: Admin Panel (5-7h)
**Objetivo:** Panel admin completamente funcional.

**Sub-bloque 3A: Auth + Dashboard (1h)**
- [ ] Login funciona
- [ ] Dashboard muestra stats reales
- [ ] Quick actions funcionan
- [ ] Export/import funciona

**Sub-bloque 3B: Beats CRUD (2-3h)**
- [ ] Lista muestra beats existentes
- [ ] Búsqueda/filtros/sort funcionan
- [ ] Editar beat → carga datos actuales
- [ ] Guardar → escribe a Firebase
- [ ] Crear nuevo beat funciona
- [ ] Borrar beat funciona
- [ ] Bulk actions (activate/deactivate/delete)
- [ ] Move up/down reordena
- [ ] Auto-save funciona

**Sub-bloque 3C: Content Editors (2h)**
- [ ] Hero editor: muestra valores actuales, guarda cambios
- [ ] Content editor: section, CTA, labels
- [ ] Theme editor: colores, glow, fonts
- [ ] Brand editor: nombre, logo, whatsapp
- [ ] Banner editor: toggle, text, animation
- [ ] Layout editor: cards per row, spacing
- [ ] Animations editor: slots

**Sub-bloque 3D: Test (1h)**
- [ ] Cada editor: cambiar valor → guardar → verificar en tienda
- [ ] Undo/redo funciona
- [ ] Keyboard shortcuts funcionan
- [ ] Commit + push

---

### BLOQUE 4: Effects & Polish (3-4h)
**Objetivo:** Que la tienda se sienta premium.

- [ ] Cursor glow lerp suave
- [ ] Scroll progress bar (gradiente 3 colores)
- [ ] Floating orbs (3 orbs)
- [ ] Card glow desde `globalCardStyle`
- [ ] Card animation/hover effects
- [ ] Card shimmer overlay
- [ ] Hero parallax on scroll
- [ ] Sibling blur en grid
- [ ] Stagger reveal animations
- [ ] Loader con brand name
- [ ] Grain overlay
- [ ] Play pulse ring en cards
- [ ] Waveform bars cuando reproduce

---

### BLOQUE 5: Content & Labels (2-3h)
**Objetivo:** Todo editable desde admin.

- [ ] 24 labels editables funcionan
- [ ] CTA section configurable
- [ ] Testimonials editables
- [ ] Banner animation types
- [ ] Animation slots aplican en tienda

---

### BLOQUE 6: Final Audit (2-3h)
**Objetivo:** Tienda lista para producción.

- [ ] Build: 0 errores
- [ ] svelte-check: 0 errores
- [ ] Todos los links funcionan
- [ ] Mobile responsive (480px, 768px, 1024px)
- [ ] SEO meta tags en todas las páginas
- [ ] robots.txt + sitemap.xml
- [ ] 0 console.log debug
- [ ] 0 TODOs/FIXMEs
- [ ] No hardcoded colors/sizes
- [ ] prefers-reduced-motion funciona
- [ ] focus-visible funciona
- [ ] ARIA labels presentes
- [ ] Performance OK (sin jank)
- [ ] Lighthouse audit (si es posible)

---

## Protocolo por Bloque

```
ANTES DE EMPEZAR:
1. Leer este archivo completo
2. Leer BLOCK-CONTEXT.md → qué bloque toca
3. Leer REAL-AUDIT.md → datos reales de Firebase
4. curl a Firebase → ver qué hay

DURANTE EL BLOQUE:
5. Entender el problema (no asumir)
6. Planear la solución (no codear a ciegas)
7. Implementar bien (no parches)
8. npm run build → 0 errores
9. npx svelte-check → 0 errores
10. Commit con mensaje claro

DESPUÉS DEL BLOQUE:
11. git push origin main
12. Esperar deploy (1-2 min)
13. TESTEAR EN BROWSER REAL
14. Si algo no funciona → volver al paso 5
15. Cuando TODO funcione → marcar ✅ en BLOCK-CONTEXT.md
16. Actualizar BLOCK-CONTEXT.md con siguiente bloque

NO HACER:
- Commitear sin build limpio
- Marcar ✅ sin test real
- Hacer 2 bloques a la vez
- Fixear rápido sin entender
- Saltar el protocolo
```

---

## Archivos Clave

```
src/lib/stores/settings.ts       — Settings + migration layer ★
src/lib/stores/auth.ts           — Auth + adminWhitelist
src/lib/stores/beats.ts          — Beats CRUD
src/lib/stores/player.ts         — Audio player
src/lib/stores/theme.ts          — Theme → CSS vars
src/lib/theme.ts                 — Theme engine
src/routes/(store)/+page.svelte  — Store index ★
src/routes/(store)/+layout.svelte— Store layout ★
src/routes/(store)/beat/[id]/+page.svelte — Beat page
src/routes/(admin)/+layout.svelte— Admin auth guard
src/routes/(admin)/admin/+page.svelte — Dashboard
src/routes/(admin)/admin/beats/+page.svelte — Beats list
src/lib/components/BeatCard.svelte — Beat card
src/lib/components/BeatEditor.svelte — Beat editor (643 líneas)
src/lib/components/Filters.svelte — Filters
src/lib/components/Player.svelte — Player bar
src/app.css                      — Design tokens (1191 líneas)
firebase.rules.json              — DB rules
```

---

## Instrucciones para Chat Nuevo

1. **Clonar repo:** `git clone https://github.com/dacewav/storewav.git`
2. **Leer** `.guide/AUDIT-MASTER.md` (este archivo)
3. **Leer** `.guide/BLOCK-CONTEXT.md` — qué bloque estamos
4. **Leer** `.guide/REAL-AUDIT.md` — mapeo paths código vs Firebase
5. **Verificar Firebase:** `curl -s "URL/settings.json"`
6. **Empezar** por el bloque "pendiente" en BLOCK-CONTEXT.md
7. **Seguir** el protocolo de arriba
8. **No hacer 2 bloques en un chat** — uno bien hecho > tres hechos rápido
9. **Actualizar** BLOCK-CONTEXT.md al terminar
10. **Actualizar** este archivo si descubrís cosas nuevas
