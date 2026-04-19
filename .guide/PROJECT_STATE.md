# 🧠 PROJECT_STATE.md — Memoria Compartida del Proyecto

> **Este archivo es la memoria persistente entre sesiones de IA.**
> Cada chat nuevo DEBE leer este archivo antes de hacer cualquier cosa.
> Cada chat que termina una tarea DEBE actualizar este archivo.

---

## Estado Actual

```yaml
proyecto: dacewav/store
version: 0.0.1
framework: SvelteKit
firebase_project: dacewav-store-3b0f5
ultimo_chat: "2026-04-19"
bloque_actual: "ninguno — proyecto no iniciado"
ultima_tarea: "guía creada, falta setup real"
```

## Progreso de Bloques

### BLOQUE 0: Setup del Proyecto
- [ ] `npm create svelte@latest` ejecutado
- [ ] Firebase SDK instalado y configurado
- [ ] `.env` creado con Firebase keys (NO commiteado)
- [ ] `firebase.ts` módulo central creado
- [ ] Cloudflare Pages config (`wrangler.toml` o `svelte.config.js`)
- [ ] `.gitignore` correcto (node_modules, .env, dist, .svelte-kit)
- [ ] Primer `npm run build` exitoso
- [ ] Primer commit: "chore: project setup"
- [ ] Primer push a GitHub
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** nada
- **Notas:** —

### BLOQUE 1: Design System
- [ ] `tokens.css` con todas las variables CSS
- [ ] Componente `Button.svelte` (variantes: primary, secondary, ghost, danger)
- [ ] Componente `Input.svelte` (text, number, textarea, select)
- [ ] Componente `Card.svelte`
- [ ] Componente `Modal.svelte`
- [ ] Componente `Badge.svelte`
- [ ] Layout base (`+layout.svelte`) con header flotante
- [ ] Footer base
- [ ] Sistema dark/light desde Firebase
- [ ] Fonts importadas (Syne, Space Grotesk, DM Mono)
- [ ] Responsive test (320px, 768px, 1024px, 1440px)
- [ ] **TEST:** Verificar que todos los componentes renderizan sin errores
- [ ] **TEST:** Verificar responsive en DevTools
- [ ] Commit: "feat: design system base"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 0
- **Notas:** —

### BLOQUE 2: Firebase Layer
- [ ] Store `beats.ts` — lee/escribe `beats/` en Firebase
- [ ] Store `settings.ts` — lee/escribe `settings/` en Firebase, aplica CSS vars
- [ ] Store `auth.ts` — login/logout, expone `isAdmin`
- [ ] Reglas de seguridad Firebase desplegadas
- [ ] **TEST:** Escribir un dato desde consola y leerlo en otro store
- [ ] **TEST:** Verificar que settings aplica CSS variables al DOM
- [ ] **TEST:** Verificar que auth rechaza escritura sin login
- [ ] Commit: "feat: firebase layer with reactive stores"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 0
- **Notas:** —

### BLOQUE 3: Tienda — Página Principal
- [ ] Hero section (lee de `settings/hero`)
- [ ] Beat card component
- [ ] Beat grid (lee de `beats/`)
- [ ] Player de audio global
- [ ] Sistema de filtros (género, BPM, key)
- [ ] Wishlist (localStorage)
- [ ] Animaciones de entrada
- [ ] Responsive completo
- [ ] **TEST:** Crear un beat fake en Firebase → aparece en la tienda
- [ ] **TEST:** Cambiar hero title en Firebase → se actualiza sin recargar
- [ ] **TEST:** Filtros funcionan correctamente
- [ ] **TEST:** Player reproduce audio sin errores
- [ ] **TEST:** Wishlist persiste entre recargas
- [ ] **TEST:** Responsive en móvil (320px)
- [ ] Commit: "feat: store homepage with hero, cards, player, filters"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloques 1, 2
- **Notas:** —

### BLOQUE 4: Tienda — Página de Beat
- [ ] Ruta `/beat/[id]`
- [ ] Detalles del beat (BPM, key, tags, descripción)
- [ ] Player integrado
- [ ] Opciones de licencia/contrato
- [ ] Botón de compra (placeholder)
- [ ] **TEST:** Navegar a `/beat/test-id` con beat fake
- [ ] **TEST:** Player funciona en página individual
- [ ] **TEST:** Deep link funciona (compartir URL)
- [ ] Commit: "feat: individual beat page with licensing"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 3
- **Notas:** —

### BLOQUE 5: Admin — Auth + Dashboard
- [ ] Login con Google (Firebase Auth)
- [ ] Protección de rutas `/admin/*`
- [ ] Dashboard con métricas básicas (total beats, vistas, etc.)
- [ ] Layout admin (sidebar + contenido)
- [ ] **TEST:** Sin login → redirige a login
- [ ] **TEST:** Con login correcto → acceso al dashboard
- [ ] **TEST:** Con login incorrecto → mensaje de error
- [ ] Commit: "feat: admin auth and dashboard"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 2
- **Notas:** —

### BLOQUE 6: Admin — Beats CRUD
- [ ] Lista de beats con búsqueda
- [ ] Formulario crear beat (título, BPM, key, tags, precio, licencia)
- [ ] Upload audio → Firebase Storage/R2
- [ ] Upload cover image → Firebase Storage/R2
- [ ] Editar beat existente
- [ ] Eliminar beat con confirmación
- [ ] Preview de audio en admin
- [ ] Auto-save con debounce
- [ ] **TEST:** Crear beat → aparece en la lista admin
- [ ] **TEST:** Crear beat → aparece en la tienda (sin recargar)
- [ ] **TEST:** Editar beat → cambios se reflejan en tienda
- [ ] **TEST:** Eliminar beat → desaparece de tienda
- [ ] **TEST:** Upload audio → se sube correctamente
- [ ] **TEST:** Upload cover → se sube y muestra preview
- [ ] Commit: "feat: admin beats CRUD with upload"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 5
- **Notas:** —

### BLOQUE 7: Admin — Theme Editor
- [ ] Color pickers (accent, bg, text, card)
- [ ] Font selector con preview
- [ ] Border-radius slider
- [ ] Glow/brillo slider
- [ ] Toggle dark/light
- [ ] Live preview (iframe de tienda)
- [ ] Botón guardar (publica a Firebase)
- [ ] Botón deshacer
- [ ] **TEST:** Cambiar accent color → se refleja en preview
- [ ] **TEST:** Guardar → visitantes de tienda real ven el cambio
- [ ] **TEST:** Deshacer → revierte al estado anterior
- [ ] Commit: "feat: admin theme editor with live preview"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 6
- **Notas:** —

### BLOQUE 8: Admin — Contenido
- [ ] Editor de hero (título, sub, imagen, video)
- [ ] Gestor de links (redes sociales, custom)
- [ ] Gallery de imágenes
- [ ] **TEST:** Cambiar hero → se refleja en tienda
- [ ] **TEST:** Agregar link → aparece en tienda
- [ ] Commit: "feat: admin content editor"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 7
- **Notas:** —

### BLOQUE 9: Admin — Extras
- [ ] Blog / páginas estáticas
- [ ] Drumkits / presets CRUD
- [ ] Editor de contratos/licencias
- [ ] Analytics básico
- [ ] Cada sub-feature testeada individualmente
- [ ] Commit: "feat: blog, drumkits, contracts, analytics"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 8
- **Notas:** —

### BLOQUE 10: Polish & Deploy
- [ ] SEO audit (meta tags, sitemap, OG)
- [ ] Lighthouse > 90 en todas las métricas
- [ ] Mobile testing real
- [ ] Deploy a Cloudflare Pages
- [ ] Dominio custom
- [ ] **TEST:** Lighthouse score verificado
- [ ] **TEST:** Deploy funciona correctamente
- [ ] **TEST:** Acceso por dominio custom
- [ ] Commit: "chore: production deploy"
- **Estado:** ⬜ NO INICIADO
- **Bloqueado por:** Bloque 9
- **Notas:** —

## Errores y Soluciones (log)

| Fecha | Error | Solución |
|-------|-------|----------|
| — | — | — |

## Decisiones Técnicas

| Decisión | Razón | Fecha |
|----------|-------|-------|
| SvelteKit como framework | Transición natural desde vanilla JS, SSR, routing | 2026-04-19 |
| Firebase Realtime DB | Ya está configurado, sincronización en tiempo real nativa | 2026-04-19 |
| Cloudflare Pages | Gratis, rápido, el usuario ya usa Cloudflare | 2026-04-19 |
| Firebase modular SDK v9+ | Tree-shaking, más ligero que compat SDK del catalog | 2026-04-19 |
| Migrar player, filters, effects, waveform, analytics | Funcionan bien en catalog, solo necesitan port a Svelte | 2026-04-19 |
| Descartar hash-router | SvelteKit tiene file-based routing nativo | 2026-04-19 |
| Descartar window globals | Svelte events + component props reemplazan onclick inline | 2026-04-19 |
| Descartar localStorage bridge | Firebase onValue() es el puente real-time, no localStorage | 2026-04-19 |
| Simplificar card-style-engine v1 | Catalog tiene glow/anim/filter MUY complejo. v1 = básico | 2026-04-19 |
| R2 para audio, Firebase Storage para images | R2 es más barato para archivos grandes (audio) | 2026-04-19 |
| Admin = iframe preview + Firebase writes | Admin escribe a Firebase, store escucha. Iframe para preview instantáneo | 2026-04-19 |

## Configuración del Entorno

```bash
# Requisitos previos
node >= 18
npm >= 9
git
cuenta Firebase (ya tiene)
cuenta Cloudflare (asumido)

# Clonar y empezar
git clone https://github.com/dacewav/store.git
cd store
npm install
cp .env.example .env  # llenar con Firebase keys
npm run dev
```

## Skills Instaladas

| Skill | Fuente | Propósito | Estado |
|-------|--------|-----------|--------|
| frontend-design | steipete/frontend-design | Diseño production-grade, anti-AI-slop | ⬜ no instalada |
| anthropic-frontend-design | qrucio/anthropic-frontend-design | Design intelligence, paletas, fonts | ⬜ no instalada |
| composio | composiohq/skills | Integraciones externas (GitHub, etc.) | ⬜ no instalada |

> Las skills se instalan automáticamente con `bash INSTALL-SKILLS.sh`
> o durante el bootstrap (`bash BOOTSTRAP.sh`).

## Recursos de Referencia (no skills)

| Recurso | URL | Para qué |
|---------|-----|----------|
| Awesome Design Systems | github.com/alexpate/awesome-design-systems | Inspiración de componentes y patrones |
| skills.sh frontend-design | skills.sh/anthropics/skills/frontend-design | Guía anti-slop de Anthropic |
| Composio docs | docs.composio.dev/docs | Integraciones con apps externas |

---

**ÚLTIMA ACTUALIZACIÓN:** 2026-04-19 — Guía inicial creada, proyecto no iniciado aún.
