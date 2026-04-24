# 🔧 POLISH MASTER — Guía de Pulición Completa

> **Objetivo**: Llevar el proyecto de "funciona" a "funciona BIEN".
> **Regla de oro**: Un bloque a la vez. Verificar que funciona ANTES de pasar al siguiente.
> **Tiempo estimado por bloque**: 15-25 min. No rush.

---

## 📋 Estado actual (post sesiones 11-16 + Bloque 1 completo)

Se hicieron mejoras de performance, a11y, SEO, content editors, particles y polish. Build limpio, Firebase conectado.

---

## Bloque 1 — Build + Environment (Primero, siempre)

**Objetivo**: Que el build funcione sin trucos.

- [x] Verificar que `$env/static/public` funciona con `.env` real del usuario
- [x] Si el usuario no tiene `.env`, crear uno desde `.env.example` con datos reales de Firebase
- [x] `npm run build` limpio — 0 errores
- [x] `npm run dev` arranca y carga la tienda
- [x] Verificar que Firebase se conecta (ver consola del navegador) — credenciales reales en .env ✅

**Posible issue**: `firebase.ts` usa `$env/static/public` — esto requiere las env vars en build time. Si el deploy en Cloudflare Workers no las tiene, no funciona. Verificar `wrangler.jsonc` o dashboard de Cloudflare.

---

## Bloque 2 — Store / Index (La tienda principal)

**Objetivo**: Que la página principal cargue y muestre beats.

- [x] Hero se renderiza con título, subtítulo, eyebrow
- [x] Hero glow word funciona (si está configurado)
- [x] Hero color segments funcionan (si hay segmentos)
- [x] Hero gradient de fondo se muestra
- [x] Stats (beats, géneros, licencias) se muestran
- [x] Filtros funcionan: búsqueda, género, tonalidad, tags, sort
- [x] Beat cards se renderizan con imagen, nombre, precio
- [x] Click en card → navega a `/beat/[id]`
- [x] Play button → player reproduce audio
- [x] Testimonials se renderizan (si hay datos)
- [x] CTA se muestra (si está configurado)
- [x] Section divider se muestra
- [x] Footer con links funciona
- [x] Loader se muestra y desaparece

**Debug tip**: Si no se ven beats, revisar `beats.subscribeFirebase()` en consola. Puede que Firebase no esté conectado.

**Fix aplicado**: JSON-LD en beat detail usaba `beat.duration` y `beat.price` que no existen en el tipo `Beat`. Corregido a `beat.licenses` para el precio y eliminado duration.

---

## Bloque 3 — Beat Detail Page

**Objetivo**: Que la página de beat individual funcione.

- [x] Título, artista, género, BPM, key se muestran
- [x] Cover image se carga
- [x] Play button funciona
- [x] Waveform se renderiza
- [x] Licencias se muestran con precios
- [x] Wishlist button funciona (añadir/quitar)
- [x] Platform links (Spotify, YouTube, SoundCloud) se muestran
- [x] Back link funciona
- [x] SEO: JSON-LD está inyectado (ver source de la página) — fixeado en Bloque 2
- [x] SEO: OG tags presentes

---

## Bloque 4 — Admin Dashboard

**Objetivo**: Que el admin cargue y muestre datos.

- [x] Auth redirect funciona (no logueado → login, no admin → home)
- [x] Dashboard stats se muestran (beats, activos, plays, top beat)
- [x] Quick actions funcionan (nuevo beat, tema, contenido, beats, export, import, seed)
- [x] Seed demo beats funciona
- [x] Export/Import funciona
- [x] Keyboard shortcuts: Ctrl+D (dashboard), Ctrl+B (beats), Ctrl+H (hero), Ctrl+T (theme), Ctrl+G (go to store)
- [x] Ctrl+Z / Ctrl+Shift+Z (undo/redo) funciona en editors
- [x] Toast notifications aparecen al guardar

---

## Bloque 5 — Admin Beats CRUD

**Objetivo**: Que el CRUD de beats funcione.

- [x] Lista de beats se muestra
- [x] Búsqueda filtra correctamente
- [x] Filtro por género funciona
- [x] Sort funciona (newest, oldest, name, bpm, price)
- [x] Click en beat → navega a editor
- [x] Nuevo beat → navega a `/admin/beats/new`
- [x] Duplicar beat funciona
- [x] Borrar beat funciona (con confirmación)
- [x] Bulk actions: activar, desactivar, borrar, limpiar selección
- [x] Reorder con flechas ↑↓ funciona
- [x] Skeleton loading se muestra mientras carga

---

## Bloque 6 — Admin Content Editors

**Objetivo**: Que todos los editores de contenido funcionen.

### Brand
- [x] Nombre de marca se guarda
- [x] Logo URL se guarda
- [x] Favicon URL se guarda
- [x] WhatsApp se guarda
- [x] Footer text se guarda
- [x] Meta description se guarda
- [x] Loader toggle funciona
- [x] Loader text se guarda

### Hero
- [x] Título se guarda
- [x] Glow word se guarda
- [x] Subtítulo se guarda
- [x] Eyebrow se guarda
- [x] Título estilos (size, spacing, line height) funcionan
- [x] Glow settings (on/off, intensidad, blur, color) funcionan
- [x] Stroke settings funcionan
- [x] Color segments funcionan (añadir, editar, eliminar, reorder)
- [x] Eyebrow badge settings funcionan
- [x] Background gradient settings funcionan

### Content
- [x] Section title se guarda
- [x] Divider title se guarda
- [x] Divider subtitle se guarda
- [x] CTA (title, subtitle, button text, url) se guarda
- [x] Labels se guardan (todos los campos)

### Banner
- [x] Toggle funciona
- [x] Text se guarda
- [x] URL se guarda
- [x] Animation type se guarda
- [x] Speed, easing, direction, delay funcionan
- [x] Colors (bg, text) funcionan

### Layout
- [x] Cards per row funciona
- [x] Wishlist toggle funciona
- [x] Logo settings (scale, width, height, rotation, show text) funcionan
- [x] Hero padding funciona
- [x] Player bottom offset funciona

### Theme
- [x] Accent color se guarda
- [x] Fonts se guardan
- [x] Light/dark mode toggle funciona
- [x] Card effects (opacity, blur, grain, shadow) funcionan
- [x] Opacidades (nav, card, overlay) funcionan
- [x] Border radius funciona
- [x] Glow settings funcionan
- [x] Particles settings funcionan (toggle, count, speed, type, color, opacity, text, image)

### Animations
- [x] Animation presets se guardan por elemento
- [x] Preview de animaciones funciona

### Links (NUEVO — sesión 13)
- [x] Añadir link funciona
- [x] Editar label, url, icon funciona
- [x] Eliminar link funciona
- [x] Reorder con flechas funciona
- [x] Vista previa del footer se actualiza
- [x] Se guardan en Firebase
- [x] Se reflejan en la tienda (footer, nav mobile)

### Testimonials (NUEVO — sesión 13)
- [x] Añadir testimonio funciona
- [x] Editar name, role, text, stars, avatar funciona
- [x] Eliminar testimonio funciona
- [x] Reorder con flechas funciona
- [x] Se guardan en Firebase
- [x] Se reflejan en la tienda

---

## Bloque 7 — Effects (Particles + Orbs + Cursor)

**Objetivo**: Que los efectos visuales funcionen.

### Particles (NUEVO — sesión 14) ✅ BUGS ARREGLADOS
- [x] Canvas se renderiza (verificar que no esté vacío)
- [x] Particles se mueven
- [x] Type: circle funciona
- [x] Type: square funciona
- [x] Type: line funciona
- [x] Type: text funciona (con texto custom)
- [x] Re-resize funciona (cambiar tamaño de ventana)
- [x] No hay memory leak (verificar que cancelAnimationFrame funciona al desmontar)
- [x] **BUG FIX**: `resolvedColor` ahora resuelve `--accent` a hex real via getComputedStyle
- [x] **BUG FIX**: `ctx.scale(dpr, dpr)` reemplazado por `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` para evitar acumulación

### Orbs
- [x] 3 orbs se renderizan
- [x] Animación de float funciona
- [x] Se ocultan en mobile (orb3) y con prefers-reduced-motion

### Cursor Glow
- [x] Se sigue al mouse
- [x] Se oculta en mobile y con prefers-reduced-motion

---

## Bloque 8 — Panels (Wishlist + Mobile Menu)

**Objetivo**: Que los paneles funcionen.

### Wishlist Panel
- [x] Se abre al click en heart icon
- [x] Se cierra al click en backdrop
- [x] Se cierra con Escape
- [x] Beats se muestran
- [x] Empty state se muestra si no hay beats
- [x] Click en beat → reproduce audio (play button en cover)
- [x] Remove de wishlist funciona
- [x] Contador se actualiza

### Mobile Menu
- [x] Se abre al click en hamburger
- [x] Se cierra al click en overlay
- [x] Se cierra al click en link
- [x] Links se muestran (section title, admin si es admin, nav links)
- [x] Theme toggle funciona
- [x] Wishlist button funciona
- [x] Focus trap funciona (Tab cicla dentro del menú)
- [x] Auto-focus primer elemento al abrir

---

## Bloque 9 — Player

**Objetivo**: Que el player funcione.

- [x] Se muestra cuando hay beat reproduciéndose
- [x] Cover image se muestra
- [x] Nombre y artista se muestran
- [x] Play/Pause funciona
- [x] Stop funciona (cierra player)
- [x] Mute toggle funciona
- [x] Progress bar funciona (click para seek)
- [x] Volume slider funciona
- [x] Time display funciona (current / total)
- [x] Keyboard: arrows para seek en progress bar
- [x] Responsive: se adapta en mobile (time hidden, volume hidden)

---

## Bloque 10 — Login + Auth

**Objetivo**: Que el login funcione.

- [x] Página de login se carga
- [x] Google sign-in button funciona
- [x] Redirect a Google OAuth funciona
- [x] Callback vuelve a la app
- [x] Admin check funciona (PUBLIC_ADMIN_UIDS)
- [x] No admin → redirect a home
- [x] Admin → redirect a /admin
- [x] Logout funciona
- [x] "Volver a la tienda" link funciona

---

## Bloque 11 — SEO + Meta

**Objetivo**: Que el SEO esté completo.

- [x] Homepage: title, og:title, og:description, og:type
- [x] Beat detail: title, description, og:title, og:description, og:image, og:type, JSON-LD
- [x] Login: title, description
- [x] Error: title
- [x] Store layout: canonical, og:url, og:site_name, og:image, twitter:card
- [x] robots.txt: correct domain, disallow admin
- [x] sitemap.xml: correct domain

---

## Bloque 12 — A11y + Keyboard

**Objetivo**: Que la accesibilidad esté completa.

- [ ] Skip to content link funciona
- [ ] All images have alt text
- [ ] Icon buttons have aria-label
- [ ] :focus-visible outline visible on keyboard nav
- [ ] Mobile menu focus trap works
- [ ] Player slider keyboard nav (arrows)
- [ ] Beat editor Ctrl+S save
- [ ] Admin Ctrl+Z/Shift+Z undo/redo
- [ ] prefers-reduced-motion disables animations
- [ ] prefers-color-scheme respects system theme

---

## Bloque 13 — Mobile Responsive

**Objetivo**: Que todo se vea bien en mobile.

- [ ] Homepage: hero, stats, filters, beat grid
- [ ] Beat detail: single column, square cover
- [ ] Player: compact, no time/volume
- [ ] Admin: sidebar collapses, grids reflow
- [ ] Beat editor: single column, stacked save bar
- [ ] Mobile menu: full height, touch-friendly links
- [ ] Wishlist panel: 90vw width
- [ ] Touch targets ≥ 44px everywhere

---

## Bloque 14 — Final Verification

**Objetivo**: Última pasada completa.

- [ ] Build limpio
- [ ] Deploy a Cloudflare Workers funciona
- [ ] Tienda carga en producción
- [ ] Admin carga en producción
- [ ] Todos los bloques anteriores verificados en producción
- [ ] Git status limpio (todo committed y pushed)
- [ ] BLOCK-CONTEXT.md actualizado

---

## 🔑 Notas importantes

### Firebase
- Los datos viven en Firebase Realtime Database
- Sin conexión a Firebase, la tienda no muestra beats
- El admin requiere auth + UID en PUBLIC_ADMIN_UIDS

### Deploy
- Cloudflare Workers via wrangler
- Env vars configuradas en dashboard de Cloudflare (no en wrangler.jsonc)
- Domain: dacewav.store + dacewav-store.daceidk.workers.dev

### Order matters
1. Primero build + env
2. Luego store (sin esto no puedes verificar nada)
3. Luego admin
4. Luego effects/polish

### Debug commands
```bash
# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Check git status
git status
git log --oneline -5
```

### Common issues
- **No se ven beats**: Firebase no conectado. Verificar .env y consola del navegador.
- **Admin no carga**: Auth no inicializado. Verificar PUBLIC_ADMIN_UIDS.
- **Build falla**: Faltan env vars. Copiar .env.example a .env.
- **Particles vacío**: Canvas no tiene dimensiones. Verificar que el componente se monta correctamente.
- **Transiciones raras**: Verificar que CSS variables están definidas en app.css.

---

## ⏱️ Ritmo

- **No corras.** Un bloque a la vez.
- **Verifica en el navegador** después de cada bloque.
- **Si algo no funciona**, no lo salves — arréglalo antes de seguir.
- **Haz commit** después de cada bloque exitoso.
- **Actualiza este archivo** marcando los checkboxes completados.
