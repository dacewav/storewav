# 📋 AUDIT-MASTER.md — Guía Maestra

> **Última actualización: 2026-04-22 04:16**
> **Lee este archivo primero en cualquier sesión nueva.**

---

## ⚠️ REGLAS DE ORO

### 1. Siempre auditar antes de codear

**NUNCA fixear sin entender.** Antes de tocar cualquier código:

1. **Leer** el código relevante completo (no solo el diff)
2. **Leer** los datos reales de Firebase (curl)
3. **Entender** qué espera el código vs qué hay
4. **Identificar** TODOS los puntos de fallo
5. **Recién ahí** codear

Si un audit de 10 minutos te ahorra 30 minutos de fixes incorrectos, el audit gana.

**Ejemplo malo:** "El hero no se ve, voy a cambiar el template del hero"
**Ejemplo bueno:** "El hero no se ve. Primero: ¿qué lee el código? ¿Qué tiene Firebase? ¿El migration layer está transformando bien? Ah, el problema es X. Ahora fixeo."

### 2. Construir bien, no rápido

- No fixear rápido → investigar, entender, fixear correcto
- No asumir que funciona → testear después de deploy
- No marcar ✅ sin test confirmado por el usuario
- No saltar bloques → uno a la vez
- No commitear basura

**Límite real: 50 minutos por sesión de chat.** Ese es el tiempo que tenemos los dos — vos preguntás, yo codeo, deployeamos, testeamos. Todo dentro de esos 50 min. Los bloques están diseñados para completarse en 1 o 2 sesiones.

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
INICIO — AUDIT (10-15 min):
1. Leer este archivo
2. Leer BLOCK-CONTEXT.md → qué sesión toca
3. Verificar Firebase → qué hay realmente
4. Leer el código relevante COMPLETO
5. Entender qué espera vs qué hay
6. Identificar TODOS los puntos de fallo
7. Planear la fix (no codear todavía)

TRABAJO — FIXEAR (25-30 min):
8. Fixear UN problema a la vez
9. npm run build → 0 errores después de CADA cambio
10. npx svelte-check → 0 errores
11. Commit

CIERRE — PUSH (5-10 min):
12. git push
13. Actualizar BLOCK-CONTEXT.md
14. Decir qué se hizo, qué falta, qué quedó pendiente

NO HACER:
- Codear sin audit primero
- Más de lo que dice la sesión
- Commitear sin build limpio
- Marcar ✅ sin test
- Saltar sesiones
- Fixear "por si acaso" sin confirmar el problema
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

---

## 🚫 Lo que NO hacer

| ❌ No hacer | Por qué |
|-------------|---------|
| Agregar dependencias sin preguntar | Puede romper el build |
| Refactorizar código que no se pidió tocar | "Si funciona, no lo toques" |
| Crear abstracciones prematuras | Over-engineering |
| Optimizar sin que haya problema real | YAGNI |
| Cambiar estructura de archivos | Rompe imports |
| Agregar logging en producción | Quitar antes de commit |
| Codear sin audit primero | Perdés más tiempo fixeando |

---

## ❌ Errores Comunes

### Firebase
- **"Permission denied"** → Las rules bloquean. Verificar `firebase.rules.json`
- **"Firebase config error"** → `.env` falta o mal configurado. Prefijo `PUBLIC_` obligatorio
- **"onValue no actualiza la UI"** → Usar `$store` syntax en Svelte

### SvelteKit
- **"500 Internal Server Error"** → Firebase en SSR. Usar `browser` check
- **"Cannot find module"** → `npm install` faltante
- **"Hydration mismatch"** → Datos del server ≠ client. Usar `{#if browser}`
- **Layout no aplica** → Verificar jerarquía de `+layout.svelte`

### Build
- **`npm run build` falla** → Leer el error (dice archivo + línea)
- **Cloudflare deploy falla** → Verificar `@sveltejs/adapter-cloudflare` en `svelte.config.js`

### Audio
- **No reproduce** → CORS o autoplay bloqueado. Verificar URL en nueva pestaña
- **Waveform no se muestra** → Audio no carga o canvas no listo

### Admin
- **Login no funciona** → Google Auth no habilitado en Firebase Console
- **Cambios no se reflejan** → Admin escribe en path diferente al que lee la tienda

---

## 🚨 Emergencia

### Build roto
```bash
npm run build 2>&1 | tail -20      # Ver error
rm -rf node_modules package-lock.json && npm install  # Reinstalar si es necesario
```

### Git descompuesto
```bash
git stash                            # Guardar cambios rotos
git reset --soft HEAD~1              # Deshacer último commit
git pull origin main --rebase        # Sincronizar con remote
```

### Firebase corrupto
```bash
# Ver datos actuales
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/.json" | python3 -m json.tool
# Firebase Console → Realtime Database → Import/Export JSON
```
