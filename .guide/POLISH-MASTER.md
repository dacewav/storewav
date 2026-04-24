# 🔧 POLISH MASTER — Guía de Pulición Completa

> **Objetivo**: Llevar el proyecto de "funciona" a "funciona BIEN".
> **Regla de oro**: Un bloque a la vez. Verificar que funciona ANTES de pasar al siguiente.
> **Tiempo estimado por bloque**: 15-25 min. No rush.

---

## 📋 Estado actual (post sesiones 11-16)

Se hicieron mejoras de performance, a11y, SEO, content editors, particles y polish. Pero hay cosas rotas o sin verificar que necesitan atención.

---

## Bloque 1 — Build + Environment (Primero, siempre)

**Objetivo**: Que el build funcione sin trucos.

- [ ] Verificar que `$env/static/public` funciona con `.env` real del usuario
- [ ] Si el usuario no tiene `.env`, crear uno desde `.env.example` con datos reales de Firebase
- [ ] `npm run build` limpio — 0 errores
- [ ] `npm run dev` arranca y carga la tienda
- [ ] Verificar que Firebase se conecta (ver consola del navegador)

**Posible issue**: `firebase.ts` usa `$env/static/public` — esto requiere las env vars en build time. Si el deploy en Cloudflare Workers no las tiene, no funciona. Verificar `wrangler.jsonc` o dashboard de Cloudflare.

---

## Bloque 2 — Store / Index (La tienda principal)

**Objetivo**: Que la página principal cargue y muestre beats.

- [ ] Hero se renderiza con título, subtítulo, eyebrow
- [ ] Hero glow word funciona (si está configurado)
- [ ] Hero color segments funcionan (si hay segmentos)
- [ ] Hero gradient de fondo se muestra
- [ ] Stats (beats, géneros, licencias) se muestran
- [ ] Filtros funcionan: búsqueda, género, tonalidad, tags, sort
- [ ] Beat cards se renderizan con imagen, nombre, precio
- [ ] Click en card → navega a `/beat/[id]`
- [ ] Play button → player reproduce audio
- [ ] Testimonials se renderizan (si hay datos)
- [ ] CTA se muestra (si está configurado)
- [ ] Section divider se muestra
- [ ] Footer con links funciona
- [ ] Loader se muestra y desaparece

**Debug tip**: Si no se ven beats, revisar `beats.subscribeFirebase()` en consola. Puede que Firebase no esté conectado.

---

## Bloque 3 — Beat Detail Page

**Objetivo**: Que la página de beat individual funcione.

- [ ] Título, artista, género, BPM, key se muestran
- [ ] Cover image se carga
- [ ] Play button funciona
- [ ] Waveform se renderiza
- [ ] Licencias se muestran con precios
- [ ] Wishlist button funciona (añadir/quitar)
- [ ] Platform links (Spotify, YouTube, SoundCloud) se muestran
- [ ] Back link funciona
- [ ] SEO: JSON-LD está inyectado (ver source de la página)
- [ ] SEO: OG tags presentes

---

## Bloque 4 — Admin Dashboard

**Objetivo**: Que el admin cargue y muestre datos.

- [ ] Auth redirect funciona (no logueado → login, no admin → home)
- [ ] Dashboard stats se muestran (beats, activos, plays, top beat)
- [ ] Quick actions funcionan (nuevo beat, tema, contenido, beats, export, import, seed)
- [ ] Seed demo beats funciona
- [ ] Export/Import funciona
- [ ] Keyboard shortcuts: Ctrl+D (dashboard), Ctrl+B (beats), Ctrl+H (hero), Ctrl+T (theme), Ctrl+G (go to store)
- [ ] Ctrl+Z / Ctrl+Shift+Z (undo/redo) funciona en editors
- [ ] Toast notifications aparecen al guardar

---

## Bloque 5 — Admin Beats CRUD

**Objetivo**: Que el CRUD de beats funcione.

- [ ] Lista de beats se muestra
- [ ] Búsqueda filtra correctamente
- [ ] Filtro por género funciona
- [ ] Sort funciona (newest, oldest, name, bpm, price)
- [ ] Click en beat → navega a editor
- [ ] Nuevo beat → navega a `/admin/beats/new`
- [ ] Duplicar beat funciona
- [ ] Borrar beat funciona (con confirmación)
- [ ] Bulk actions: activar, desactivar, borrar, limpiar selección
- [ ] Reorder con flechas ↑↓ funciona
- [ ] Skeleton loading se muestra mientras carga

---

## Bloque 6 — Admin Content Editors

**Objetivo**: Que todos los editores de contenido funcionen.

### Brand
- [ ] Nombre de marca se guarda
- [ ] Logo URL se guarda
- [ ] Favicon URL se guarda
- [ ] WhatsApp se guarda
- [ ] Footer text se guarda
- [ ] Meta description se guarda
- [ ] Loader toggle funciona
- [ ] Loader text se guarda

### Hero
- [ ] Título se guarda
- [ ] Glow word se guarda
- [ ] Subtítulo se guarda
- [ ] Eyebrow se guarda
- [ ] Título estilos (size, spacing, line height) funcionan
- [ ] Glow settings (on/off, intensidad, blur, color) funcionan
- [ ] Stroke settings funcionan
- [ ] Color segments funcionan (añadir, editar, eliminar, reorder)
- [ ] Eyebrow badge settings funcionan
- [ ] Background gradient settings funcionan

### Content
- [ ] Section title se guarda
- [ ] Divider title se guarda
- [ ] Divider subtitle se guarda
- [ ] CTA (title, subtitle, button text, url) se guarda
- [ ] Labels se guardan (todos los campos)

### Banner
- [ ] Toggle funciona
- [ ] Text se guarda
- [ ] URL se guarda
- [ ] Animation type se guarda
- [ ] Speed, easing, direction, delay funcionan
- [ ] Colors (bg, text) funcionan

### Layout
- [ ] Cards per row funciona
- [ ] Wishlist toggle funciona
- [ ] Logo settings (scale, width, height, rotation, show text) funcionan
- [ ] Hero padding funciona
- [ ] Player bottom offset funciona

### Theme
- [ ] Accent color se guarda
- [ ] Fonts se guardan
- [ ] Light/dark mode toggle funciona
- [ ] Card effects (opacity, blur, grain, shadow) funcionan
- [ ] Opacidades (nav, card, overlay) funcionan
- [ ] Border radius funciona
- [ ] Glow settings funcionan
- [ ] Particles settings funcionan (toggle, count, speed, type, color, opacity, text, image)

### Animations
- [ ] Animation presets se guardan por elemento
- [ ] Preview de animaciones funciona

### Links (NUEVO — sesión 13)
- [ ] Añadir link funciona
- [ ] Editar label, url, icon funciona
- [ ] Eliminar link funciona
- [ ] Reorder con flechas funciona
- [ ] Vista previa del footer se actualiza
- [ ] Se guardan en Firebase
- [ ] Se reflejan en la tienda (footer, nav mobile)

### Testimonials (NUEVO — sesión 13)
- [ ] Añadir testimonio funciona
- [ ] Editar name, role, text, stars, avatar funciona
- [ ] Eliminar testimonio funciona
- [ ] Reorder con flechas funciona
- [ ] Se guardan en Firebase
- [ ] Se reflejan en la tienda

---

## Bloque 7 — Effects (Particles + Orbs + Cursor)

**Objetivo**: Que los efectos visuales funcionen.

### Particles (NUEVO — sesión 14) ⚠️ POSIBLES BUGS
- [ ] Canvas se renderiza (verificar que no esté vacío)
- [ ] Particles se mueven
- [ ] Type: circle funciona
- [ ] Type: square funciona
- [ ] Type: line funciona
- [ ] Type: text funciona (con texto custom)
- [ ] Re-resize funciona (cambiar tamaño de ventana)
- [ ] No hay memory leak (verificar que cancelAnimationFrame funciona al desmontar)
- [ ] **BUG POTENCIAL**: `resolvedColor` usa `var(--accent)` — CSS variables NO funcionan en canvas. Necesita resolver el color real.
- [ ] **BUG POTENCIAL**: `ctx.scale(dpr, dpr)` se acumula en cada resize. Necesita `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` o resetear antes de escalar.

### Orbs
- [ ] 3 orbs se renderizan
- [ ] Animación de float funciona
- [ ] Se ocultan en mobile (orb3) y con prefers-reduced-motion

### Cursor Glow
- [ ] Se sigue al mouse
- [ ] Se oculta en mobile y con prefers-reduced-motion

---

## Bloque 8 — Panels (Wishlist + Mobile Menu)

**Objetivo**: Que los paneles funcionen.

### Wishlist Panel
- [ ] Se abre al click en heart icon
- [ ] Se cierra al click en backdrop
- [ ] Se cierra con Escape
- [ ] Beats se muestran
- [ ] Empty state se muestra si no hay beats
- [ ] Click en beat → navega al beat
- [ ] Remove de wishlist funciona
- [ ] Contador se actualiza

### Mobile Menu
- [ ] Se abre al click en hamburger
- [ ] Se cierra al click en overlay
- [ ] Se cierra al click en link
- [ ] Links se muestran (section title, admin si es admin, nav links)
- [ ] Theme toggle funciona
- [ ] Wishlist button funciona
- [ ] Focus trap funciona (Tab cicla dentro del menú)
- [ ] Auto-focus primer elemento al abrir

---

## Bloque 9 — Player

**Objetivo**: Que el player funcione.

- [ ] Se muestra cuando hay beat reproduciéndose
- [ ] Cover image se muestra
- [ ] Nombre y artista se muestran
- [ ] Play/Pause funciona
- [ ] Stop funciona (cierra player)
- [ ] Mute toggle funciona
- [ ] Progress bar funciona (click para seek)
- [ ] Volume slider funciona
- [ ] Time display funciona (current / total)
- [ ] Keyboard: space para play/pause, arrows para seek
- [ ] Responsive: se adapta en mobile (time hidden, volume hidden)

---

## Bloque 10 — Login + Auth

**Objetivo**: Que el login funcione.

- [ ] Página de login se carga
- [ ] Google sign-in button funciona
- [ ] Redirect a Google OAuth funciona
- [ ] Callback vuelve a la app
- [ ] Admin check funciona (PUBLIC_ADMIN_UIDS)
- [ ] No admin → redirect a home
- [ ] Admin → redirect a /admin
- [ ] Logout funciona
- [ ] "Volver a la tienda" link funciona

---

## Bloque 11 — SEO + Meta

**Objetivo**: Que el SEO esté completo.

- [ ] Homepage: title, og:title, og:description, og:type
- [ ] Beat detail: title, description, og:title, og:description, og:image, og:type, JSON-LD
- [ ] Login: title, description
- [ ] Error: title
- [ ] Store layout: canonical, og:url, og:site_name, og:image, twitter:card
- [ ] robots.txt: correct domain, disallow admin
- [ ] sitemap.xml: correct domain

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
