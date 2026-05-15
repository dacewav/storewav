# 🔍 MEGA AUDIT — YUGEN STORE (dacewav.store)

> Auditoría completa: store, admin, componentes, diseño, UX, features.
> Fecha: 2026-05-16

---

## 📋 RESUMEN EJECUTIVO

El proyecto tiene una **base técnica sólida** (SvelteKit + Firebase + Cloudflare, design system con CSS variables, temas claro/oscuro, animaciones, etc.) pero hay **muchas áreas de mejora** tanto en UX como en features y polish visual.

**Puntuación general: 6.5/10** — Buen foundation, necesita polish y contenido.

---

## 🚨 CRÍTICOS (Arreglar ya)

### 1. Beat Detail Page — URLs rotas
- **Problema**: La URL `/beat/reggaeton-1747268707458` devuelve "Beat no encontrado". El slug no funciona correctamente.
- **Causa probable**: La función `getBeatSlug()` genera slugs que no coinciden con los parámetros de URL. Los beats se muestran en el catálogo pero al hacer click no cargan.
- **Fix**: Verificar que `getBeatSlug()` produce slugs consistentes y que el lookup en `+page.svelte` funciona tanto por slug como por ID.

### 2. Contenido mínimo / placeholders visibles
- **Problema**: Solo hay 1 beat, 1 género, 1 kit, 1 testimonio. El hero dice "pensando cosas..." como subtítulo del divider.
- **Impacto**: La tienda se ve vacía y poco profesional.
- **Fix**: Agregar contenido real o usar el seed de demo para poblar.

### 3. Hero Stats muestran datos crudos
- **Problema**: Los stats del hero muestran "1 beats", "1 géneros", "4 licencias" — se ve pobre.
- **Fix**: Cuando hay < 5 beats, ocultar stats o mostrar un diseño alternativo (ej: "Próximamente más beats").

---

## 🎨 DISEÑO — STORE (Customer-facing)

### 4. Navbar — Iconos sin labels claros
- **Problema**: Los iconos de la nav (carrito, órdenes, favoritos, notificaciones, tema) son solo iconos circulares sin texto. Para nuevos usuarios no es obvio qué hace cada uno.
- **Fix**: Agregar tooltips más descriptivos o labels visibles en hover (ya hay `title` pero no se ven).

### 5. BeatCard — Acciones ocultas en desktop
- **Problema**: Los botones de play, favorito y carrito solo aparecen on hover en desktop. En mobile están visibles (bien), pero en desktop un usuario nuevo no sabe que existen.
- **Fix**: Mostrar al menos el botón de play siempre visible (con opacidad reducida), o agregar un sutil indicador visual.

### 6. BeatCard — Tags genéricos
- **Problema**: Los tags muestran el género repetido ("Reggaeton" como tag Y como genre badge).
- **Fix**: Los tags deberían ser descriptivos (ej: "melódico", "dark", "summer") no el género repetido.

### 7. Sección "CALIDAD ASEGURADA" — vacía
- **Problema**: El divider dice "CALIDAD ASEGURADA !" y debajo "pensando cosas..." — es un placeholder obvio.
- **Fix**: Completar con contenido real o eliminar esta sección.

### 8. Testimonios — Mínimos
- **Problema**: Solo 1 testimonio con texto "duro" — se ve poco profesional.
- **Fix**: Agregar más testimonios o usar un diseño de "próximamente" cuando hay < 3.

### 9. CTA WhatsApp — Podría ser más atractivo
- **Problema**: El botón de CTA es simple (borde + texto). Podría tener un efecto más engaging.
- **Fix**: Agregar animación de pulso, icono de WhatsApp más grande, o un diseño tipo "floating action button" en mobile.

### 10. Footer — Demasiado mínimo
- **Problema**: Solo tiene brand name, copyright y 2 links. No hay links a páginas legales, FAQ, etc.
- **Fix**: Agregar secciones: "Tienda" (Catálogo, Kits), "Soporte" (FAQ, Contacto), "Legal" (Términos, Privacidad).

### 11. Kits page — Sin featured/hero section
- **Problema**: La página de kits va directo al grid sin hero o introducción.
- **Fix**: Agregar un mini-hero con descripción de qué son los kits.

### 12. Cart — Sin indicador de moneda
- **Problema**: Los precios se muestran en MXN pero no hay toggle de moneda (MXN/USD) visible.
- **Fix**: Agregar selector de moneda o mostrar ambas monedas siempre.

### 13. Account page — Tarjeta de "Catálogo" duplicada
- **Problema**: Hay una tarjeta "Catálogo" en el dashboard de cuenta que es redundante (ya están en la nav).
- **Fix**: Reemplazar con algo más útil (ej: "Historial de reproducciones" o "Configuración de privacidad").

---

## 🎨 DISEÑO — ADMIN

### 14. Admin Dashboard — Versión hardcodeada
- **Problema**: Muestra "v1.0.0" como badge y en system info. Esto debería venir de `package.json` o un config.
- **Fix**: Hacer la versión dinámica.

### 15. Admin Sidebar — Emojis como iconos
- **Problema**: Usa emojis genéricos (🎵, 🎨, 📊, etc.) en lugar de iconos consistentes. Se ve desalineado con el resto del diseño.
- **Fix**: Usar los mismos iconos Lucide que usa el store (ya están importados en `Icon.svelte`). Crear un mapa de iconos para el sidebar.

### 16. Admin — Falta breadcrumbs en todas las páginas
- **Problema**: Los breadcrumbs solo aparecen en sub-rutas, no en el dashboard principal.
- **Fix**: Mostrar breadcrumbs consistentemente.

### 17. Admin Beats Editor — No se pudo verificar
- **Problema**: No pude acceder al editor de beats porque requiere login.
- **Recomendación**: Asegurar que el editor tenga preview en tiempo real, validación de campos, y auto-save.

### 18. Admin Quick Actions — Seed button siempre visible
- **Problema**: El botón "Seed X beats" está visible en producción. Solo debería aparecer en desarrollo o cuando no hay beats.
- **Fix**: Ocultar en producción o agregar flag de entorno.

---

## ⚡ FEATURES FALTANTES (Store)

### 19. Search — Sin autocompletado visual en store
- **Problema**: El componente `Filters.svelte` tiene typeahead, pero el search del hero/nav no lo muestra visualmente.
- **Fix**: Mostrar dropdown de sugerencias al buscar.

### 20. Sin página de "About" o "Artista"
- **Problema**: No hay página que cuente quién es el artista, su historia, etc.
- **Fix**: Crear `/about` con bio, foto, links a redes, logros.

### 21. Sin página de FAQ
- **Problema**: Los clientes potenciales pueden tener preguntas sobre licencias, derechos, etc.
- **Fix**: Crear `/faq` con preguntas frecuentes.

### 22. Sin sistema de descuentos visible en store
- **Problema**: El admin tiene sección de descuentos pero no hay forma de aplicar códigos de descuento en el carrito visible en la UI (el código existe pero no hay input visible).
- **Wait**: Revisando el código del carrito, SÍ hay input de descuento. Verificar que funcione.

### 23. Sin "Recently Viewed" persistente
- **Problema**: Los "Escuchado recientemente" se pierden al recargar (localStorage). Podría ser más persistente.
- **Nota**: Esto es un trade-off de privacidad. Está bien como está.

### 24. Sin PWA / Install prompt
- **Problema**: No hay manifest.json ni service worker para instalar como app.
- **Fix**: Agregar PWA support para mejor experiencia mobile.

### 25. Sin loading skeleton en beat detail
- **Problema**: Cuando cargas `/beat/[id]` no hay skeleton mientras carga (solo "Beat no encontrado" si no carga rápido).
- **Fix**: Mostrar skeleton mientras se resuelve el beat.

### 26. Sin share buttons en beat detail
- **Problema**: Solo hay un botón de compartir que usa `navigator.share` o copia el link. No hay share directo a Twitter/WhatsApp/Instagram.
- **Fix**: Agregar share buttons específicos por plataforma.

### 27. Sin reviews/ratings en beats
- **Problema**: No hay sistema de calificación por beat (solo likes).
- **Fix**: Agregar rating con estrellas o sistema de "🔥 Heat" basado en plays + likes.

### 28. Sin "Beats similares" mejorado
- **Problema**: Los beats relacionados usan un algoritmo simple. Podría mostrar "Fans también compraron" basado en datos reales.

---

## ⚡ FEATURES FALTANTES (Admin)

### 29. Sin drag & drop para reordenar beats
- **Problema**: No hay forma de reordenar beats en el catálogo desde el admin.
- **Fix**: Agregar drag & drop o campo de "orden" en el editor.

### 30. Sin bulk actions en beats
- **Problema**: No se pueden seleccionar múltiples beats para activar/desactivar/eliminar en batch.
- **Fix**: Agregar checkboxes + acciones bulk.

### 31. Sin preview de email templates
- **Problema**: La sección de emails existe pero no se pudo verificar su contenido.
- **Recomendación**: Asegurar que haya preview de emails de confirmación de compra.

### 32. Sin dashboard de ventas real
- **Problema**: Analytics muestra datos básicos pero no hay gráficos de ventas over time, revenue, etc.
- **Fix**: Agregar charts con Chart.js o similar (ya hay bar charts, expandir).

### 33. Sin gestión de inventario
- **Problema**: No hay forma de poner un beat como "agotado" o limitar licencias exclusivas.
- **Fix**: Agregar campo `stock` para licencias exclusivas.

---

## 🎯 MEJORAS VISUALES (Store)

### 34. Hero — Agregar video/animación de fondo
- **Sugerencia**: El hero tiene un gradiente estático. Un video loop sutil o animación de ondas de audio sería más engaging.
- **Implementación**: Video MP4 loop de 3-5s como background con overlay oscuro.

### 35. BeatCard — Efecto 3D tilt mejorado
- **Problema**: Ya hay un `use:tilt` action pero es sutil (max 6deg).
- **Sugerencia**: Agregar efecto de "shine" (reflejo de luz que sigue al cursor) además del tilt.

### 36. Scroll animations — Más variety
- **Problema**: Solo hay `reveal` (fade up). El `staggerReveal` ayuda pero es monotono.
- **Fix**: Agregar variantes: `reveal-left`, `reveal-right`, `reveal-scale`, `reveal-rotate`.

### 37. Loader — Muy simple
- **Problema**: El loader es solo un spinner circular rojo. No refleja la marca.
- **Fix**: Agregar logo animado o un efecto de ondas de audio mientras carga.

### 38. Cursor glow — Muy sutil
- **Problema**: El glow del cursor es casi invisible (0.06 opacity).
- **Sugerencia**: Aumentar a 0.1 o hacer que el color cambie con el accent.

### 39. Floating orbs — Podrían ser más dinámicos
- **Problema**: Los orbs son estáticos en posición. Solo flotan suavemente.
- **Sugerencia**: Hacer que reaccionen al scroll (parallax) o al cursor.

### 40. Waveform del player — Podría ser más visual
- **Problema**: La waveform es solo barras verticales. Podría ser una forma de onda real.
- **Sugerencia**: Agregar opción de waveform tipo "oscilloscope" con gradiente.

### 41. Cards — Sin glassmorphism option
- **Sugerencia**: Agregar opción de cards con backdrop-filter: blur() + fondo semi-transparente para un look más moderno.

### 42. Particles — Ya existen pero poco usados
- **Nota**: El sistema de partículas está bien implementado. Activarlo por defecto con configuración sutil (pocas partículas, opacidad baja) podría mejorar la atmósfera.

---

## 🔧 MEJORAS DE CÓDIGO

### 43. app.css — Demasiado grande (1211 líneas)
- **Problema**: Todo el design system está en un solo archivo CSS.
- **Sugerencia**: Modularizar en `variables.css`, `animations.css`, `utilities.css`, `components.css`.

### 44. Animaciones duplicadas
- **Problema**: Las keyframes de animación están definidas tanto en `app.css` como en `+layout.svelte` y `+page.svelte`.
- **Fix**: Centralizar todas las keyframes en `app.css` y importar.

### 45. Store layout — Demasiado complejo (1406 líneas)
- **Problema**: El `+layout.svelte` del store maneja too much: nav, mobile menu, loader, particles, floating elements, cursor glow, scroll progress, etc.
- **Sugerencia**: Extraer a componentes: `Nav.svelte`, `MobileMenu.svelte`, `Loader.svelte`, `ScrollProgress.svelte`.

### 46. Beat detail page — 1122 líneas
- **Problema**: Mezcla lógica de negocio con presentación.
- **Sugerencia**: Extraer la lógica de licencias y carrito a un composable/store.

### 47. CSS Variables — Muchas sin uso
- **Problema**: Hay muchas variables CSS definidas que probablemente no se usan (ej: `--leading-relaxed`, `--tracking-wider`).
- **Fix**: Audit de uso y limpieza.

### 48. Icon.svelte — Importaciones individuales
- **Problema**: Cada icono se importa individualmente. Con 30+ iconos, esto podría impactar el bundle.
- **Nota**: Tree-shaking debería manejarlo, pero verificar con un bundle analyzer.

---

## 🌐 SEO & PERFORMANCE

### 49. OG Image — SVG genérico
- **Problema**: `og:image` apunta a `/og-image.svg` — probablemente un placeholder.
- **Fix**: Crear una imagen OG real (1200x630px) con el nombre del artista y branding.

### 50. Sitemap — Existe pero verificar
- **Nota**: Hay `sitemap.xml/+server.ts`. Verificar que incluya todas las páginas y beats.

### 51. Structured Data — Bien implementado
- **Nota**: JSON-LD para WebSite, MusicRecording, BreadcrumbList está bien. 👍

### 52. Lazy loading — Implementado correctamente
- **Nota**: BeatCard usa IntersectionObserver para lazy loading. Bien hecho. 👍

---

## 📱 MOBILE

### 53. Mobile menu — Bien implementado
- **Nota**: Focus trap, keyboard navigation, search, recent searches. Muy bien. 👍

### 54. Touch targets — Correctos (44px min)
- **Nota**: `--touch-min: 44px` se aplica consistentemente. 👍

### 55. Hamburger animation — Smooth
- **Nota**: La animación del hamburger a X está bien. 👍

### 56. Admin bottom nav — Solo 5 items
- **Problema**: El bottom nav del admin solo tiene 5 items. Las demás secciones son inaccesibles en mobile sin abrir el sidebar.
- **Fix**: Agregar "más" button o reorganizar.

---

## ♿ ACCESSIBILITY

### 57. ARIA labels — Bien implementados
- **Nota**: Los botones tienen aria-labels, el nav tiene aria-label, los sliders tienen role="slider". 👍

### 58. Focus visible — Implementado
- **Nota**: `:focus-visible` con outline rojo. Bien. 👍

### 59. Reduced motion — Implementado
- **Nota**: `@media (prefers-reduced-motion: reduce)` desactiva animaciones. 👍

### 60. Skip to content — Implementado
- **Nota**: Link "Saltar al contenido" existe. 👍

### 61. Color contrast — Verificar
- **Problema**: `--text-secondary` tiene 0.55 opacity sobre fondo oscuro. Podría fallar WCAG AA en algunos casos.
- **Fix**: Verificar contraste con herramienta y ajustar.

---

## 🎨 SISTEMA DE DISEÑO — Evaluación

### Lo que está BIEN:
- ✅ CSS Variables system completo
- ✅ Tema claro/oscuro
- ✅ Transiciones suaves
- ✅ Design tokens consistentes
- ✅ Responsive breakpoints
- ✅ Animaciones con reduced-motion support
- ✅ Card style engine (muy flexible)
- ✅ Emoji system con custom emojis
- ✅ Google Fonts (Syne, Space Grotesk, DM Mono)

### Lo que MEJORAR:
- ❌ No hay sistema de spacing consistente (usa rem + px mix)
- ❌ No hay design tokens para sombras de cards específicas
- ❌ No hay sistema de iconos unificado (emojis + Lucide mix)
- ❌ No hay componente de skeleton loading genérico reutilizable
- ❌ No hay sistema de breadcrumbs para el store (solo admin)

---

## 📊 PRIORIDAD DE IMPLEMENTACIÓN

### 🔴 P1 — Críticos (Hacer ya)
1. Fix beat detail page URLs
2. Completar contenido mínimo (más beats, testimonios)
3. Fix "pensando cosas..." placeholder
4. Fix hero stats para contenido mínimo

### 🟠 P2 — Importante (Próxima semana)
5. Mejorar footer con links útiles
6. Agregar tooltips descriptivos a nav icons
7. Mostrar play button siempre en BeatCard (al menos con opacidad)
8. Crear página About/Artista
9. Crear FAQ page
10. Fix admin sidebar icons (emojis → Lucide)

### 🟡 P3 — Mejoras (Próximo mes)
11. Agregar video/animación al hero
12. Efecto shine en cards
13. Más variantes de scroll animations
14. Loader con logo animado
15. PWA support
16. Share buttons específicos por plataforma
17. Sistema de ratings/reviews
18. Bulk actions en admin
19. Drag & drop para reordenar beats

### 🟢 P4 — Nice to have
20. Glassmorphism cards option
21. Cursor glow más visible
22. Floating orbs reactivos
23. Waveform oscilloscope
24. Modularizar CSS
25. Extraer componentes del layout
26. Bundle analysis
27. OG image real

---

## 🧪 TESTING CHECKLIST

- [ ] Beat detail page carga correctamente
- [ ] Cart funciona con descuentos
- [ ] Checkout flow completo (Stripe)
- [ ] Mobile menu en todos los breakpoints
- [ ] Theme toggle persiste
- [ ] Player keyboard shortcuts
- [ ] Admin save/undo/redo
- [ ] Import/Export funciona
- [ ] Lazy loading no rompe nada
- [ ] Animaciones no causan layout shifts

---

*Audit generado automáticamente por MIMO Claw*
