# 📦 DACEWAV.STORE — Mega Guía de Reconstrucción (v2)

> Todo lo que necesitas para reconstruir tu tienda desde cero, bloque por bloque,
> con IA como co-piloto, sin importar cuántos chats se reinicien.

---

## Archivos Incluidos

| Archivo | Qué hace | Cuándo usarlo |
|---------|----------|---------------|
| `MEGA-PROMPT.md` | Prompt para copiar/pegar en cada chat nuevo | **SIEMPRE** al inicio de cada sesión |
| `QUICK-START.md` | Prompts cortos para arrancar rápido | Cuando no quieres copiar el mega prompt |
| `PROTOCOLO-SESION.md` | Flujo paso a paso de cada sesión | Referencia de la IA |
| `PROTOCOLO-TESTS.md` | Cómo testear cada tipo de cambio | Después de cada implementación |
| `PROJECT_STATE.md` | Memoria compartida entre chats | **SIEMPRE** — se lee y se actualiza |
| `BLOCK-CONTEXT.md` | Contexto rápido del bloque actual | **SIEMPRE** — más rápido que PROJECT_STATE |
| `CHANGELOG.md` | Log de sesiones — qué hicimos, qué aprendimos | Al final de cada sesión |
| `LIVE-STATUS.md` | Health check en tiempo real de la guía | Al inicio y final de cada sesión |
| `REVIEW-GUIDE.md` | Protocolo para actualizar la guía chat con chat | Al final de cada sesión |
| `INTERRUPTION-HANDLER.md` | Cómo manejar peticiones fuera del bloque | Cuando el usuario pide algo puntual |
| `PARKING-LOT.md` | Ideas en espera — sin interrumpir el flujo | Cuando tengas una idea para después |
| `BOOTSTRAP.sh` | Script que clona, skills y muestra estado + health check | Al inicio de cada sesión |
| `INSTALL-SKILLS.sh` | Instala skills de diseño (frontend-design, composio) | En bootstrap o manual |
| `PRE-COMMIT.sh` | Validación antes de cada commit | Antes de cada commit |
| `GUIA-COMPLETA.md` (este archivo) | Visión general + arquitectura + prompts por bloque | Referencia de diseño |
| `ERRORES-COMUNES.md` | Errores conocidos y sus soluciones | Cuando algo falla |
| `docs/DESIGN-REFERENCES.md` | Referencias de diseño y anti-slop rules | Antes de diseñar |

---

## Flujo de una Sesión (resumen rápido)

```
1. Copiar MEGA-PROMPT.md → pegar en chat nuevo
2. IA clona repo y ejecuta BOOTSTRAP.sh
3. IA lee PROJECT_STATE.md → dice dónde estamos
4. Confirmas → IA toma UNA tarea pendiente
5. IA implementa, TESTEA, reporta
6. IA actualiza PROJECT_STATE.md → commit → push
7. Repetir hasta completar el bloque o cerrar sesión
8. IA resume qué hicimos y qué falta
```

---

## El Problema y la Solución

### ¿Por qué el flujo tienda ↔ admin está roto en catalog?

Tu `catalog` v5.2 tiene un problema de **arquitectura**, no de código:

1. **Admin usa scripts inline**, tienda usa módulos → dos sistemas de build
2. **No hay estado compartido** → `state.js` solo vive en la tienda
3. **Firebase config hardcodeada en repo público** → riesgo de seguridad
4. **`admin-main.js` es un stub** → admin.html sigue cargando inline
5. **CSS duplicado** → `store-styles.css` y `admin-styles.css` sin tokens compartidos

### La Solución: UNA app, dos rutas

```
/          → Tienda (lectura, performance, SEO)
/admin     → Admin (escritura, control total)
Firebase   → Single source of truth (tienda ESCUCHA, admin ESCRIBE)
```

**Stack:** SvelteKit + Firebase + Cloudflare Pages

### ¿Por qué SvelteKit?

Tu `state.js` ya se parece a un Svelte store. La transición es natural:
- SSR para SEO
- Routing file-based
- Hot module replacement
- Firebase + Svelte = reactividad limpia

---

## Arquitectura

```
┌─────────────────────────────────────────────┐
│                 FIREBASE                      │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │ RealtimeDB │  │ Storage  │  │   Auth    │ │
│  │ (beats,    │  │ (audio,  │  │  (admin   │ │
│  │  settings) │  │  images) │  │   only)   │ │
│  └─────┬──────┘  └────┬─────┘  └─────┬─────┘ │
└────────┼──────────────┼──────────────┼───────┘
         │              │              │
   ┌─────┴─────┐  ┌────┴─────┐  ┌────┴──────┐
   │  TIENDA    │  │  ADMIN   │  │ CLOUDFLARE│
   │  / (read)  │  │  /admin  │  │  Pages    │
   └────────────┘  └──────────┘  └───────────┘
```

### Control creativo en tiempo real

```
Admin cambia accent color → Firebase: settings/theme/accentColor = "#ff0066"
Tienda tiene onValue() listener → aplica CSS var --accent = "#ff0066"
Resultado: cambio instantáneo sin recargar
```

---

## Plan de Bloques

### BLOQUE 0: Setup ⬜
SvelteKit + Firebase + Cloudflare + Git. Todo arranca sin errores.

### BLOQUE 1: Design System ⬜
Tokens CSS + componentes base (Button, Input, Card, Modal) + layout + fonts.

### BLOQUE 2: Firebase Layer ⬜
Stores reactivos (beats, settings, auth) + reglas de seguridad.

### BLOQUE 3: Tienda — Principal ⬜
Hero + beat grid + player + filtros + wishlist + animaciones.

### BLOQUE 4: Tienda — Beat Page ⬜
Ruta `/beat/[id]` + detalles + player + licencias.

### BLOQUE 5: Admin — Auth ⬜
Login Google + protección rutas + dashboard + layout.

### BLOQUE 6: Admin — Beats CRUD ⬜
Lista + formulario + upload audio/cover + edit + delete + auto-save.

### BLOQUE 7: Admin — Theme Editor ⬜
Color pickers + font selector + preview en vivo + guardar/deshacer.

### BLOQUE 8: Admin — Contenido ⬜
Hero editor + links manager + gallery.

### BLOQUE 9: Admin — Extras ⬜
Blog + drumkits + presets + contratos + analytics.

### BLOQUE 10: Polish & Deploy ⬜
SEO + Lighthouse + deploy Cloudflare + dominio custom.

**Cada bloque termina con commit + push. No se avanza sin tests pasados.**

---

## Reglas de Oro

1. **UNA tarea a la vez** — no saltar, no agrupar
2. **TESTEAR antes de marcar [x]** — verificar en navegador/Firebase
3. **Commit después de cada [x]** — `git add -A && git commit -m "feat: ..." && git push`
4. **PROJECT_STATE.md = memoria** — se lee al inicio, se actualiza al final
5. **No tocar bloques futuros** — solo el bloque actual
6. **No inventar features** — solo lo listado en PROJECT_STATE.md
7. **Si falla, arreglar primero** — no avanzar con tests fallidos
8. **npm run build debe pasar** — antes de cada commit

---

## Estructura del Proyecto (target)

```
store/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              ← Tienda
│   │   ├── beat/[id]/+page.svelte    ← Beat individual
│   │   ├── admin/
│   │   │   ├── +page.svelte          ← Dashboard
│   │   │   ├── beats/+page.svelte    ← CRUD beats
│   │   │   ├── settings/+page.svelte ← Theme editor
│   │   │   └── pages/+page.svelte    ← Blog/páginas
│   │   └── +layout.svelte            ← Layout raíz
│   ├── lib/
│   │   ├── firebase.ts               ← Config centralizada
│   │   ├── stores/                   ← Svelte stores reactivos
│   │   ├── components/               ← UI components
│   │   └── utils/                    ← Funciones puras
│   └── app.css                       ← Design tokens
├── static/                           ← Assets
├── PROJECT_STATE.md                  ← Memoria compartida
├── BOOTSTRAP.sh                      ← Setup script
└── package.json
```

---

## Design Tokens

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #161616;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --accent: #00ff88;
  --accent-dim: #00cc6a;
  --danger: #ff4444;
  --warning: #ffaa00;
  --font-display: 'Syne', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
}
```

---

## Firebase Structure (target)

```json
{
  "beats": {
    "beat-id-1": {
      "title": "Midnight",
      "artist": "DACEWAV",
      "bpm": 140,
      "key": "Cm",
      "genre": "Trap",
      "tags": ["dark", "hard"],
      "coverUrl": "https://...",
      "audioUrl": "https://...",
      "licenses": {
        "basic": 29.99,
        "premium": 79.99,
        "unlimited": 149.99,
        "exclusive": 499.99
      },
      "createdAt": 1713484800000,
      "active": true
    }
  },
  "settings": {
    "theme": { "accentColor": "#00ff88", "bgColor": "#0a0a0a" },
    "hero": { "title": "DACEWAV", "subtitle": "Beats que rompen" },
    "layout": { "cardsPerRow": 3, "showWishlist": true },
    "links": [{ "label": "Instagram", "url": "https://...", "icon": "instagram" }],
    "brand": { "logo": "https://...", "favicon": "https://..." }
  }
}
```

---

## Deploy (Cloudflare Pages)

```bash
# Build
npm run build

# Deploy (con Wrangler)
npx wrangler pages deploy build/

# O conectar repo en Cloudflare Dashboard:
# Build command: npm run build
# Output dir: build
```

---

*Guía v2 — Abril 2026 — @dacewav*
