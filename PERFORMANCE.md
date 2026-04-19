# ⚡ PERFORMANCE.md — Budget de Performance

> Límites que NO se pueden superar. Si un cambio rompe estos números, NO se mergea.

---

## Budget por página

| Métrica | Tienda (/) | Admin (/admin) | Herramienta |
|---------|-----------|---------------|-------------|
| **Lighthouse Performance** | ≥ 90 | ≥ 80 | Chrome Lighthouse |
| **LCP** (Largest Contentful Paint) | < 2.5s | < 3.5s | Lighthouse |
| **FID** (First Input Delay) | < 100ms | < 100ms | Lighthouse |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | Lighthouse |
| **TTFB** (Time to First Byte) | < 800ms | < 800ms | Network tab |
| **Bundle size (JS)** | < 150KB | < 200KB | `npm run build` output |
| **Bundle size (CSS)** | < 50KB | < 80KB | `npm run build` output |
| **First load (total)** | < 500KB | < 600KB | Network tab |

## Budget de assets

| Asset | Límite | Notas |
|-------|--------|-------|
| Cover images | < 200KB cada una | WebP preferido, lazy loading |
| Audio preview | < 5MB por track | Comprimir a 128kbps para preview |
| Audio full | < 20MB por track | Solo descarga, no streaming |
| Fonts | < 100KB total | Subset de caracteres si es posible |
| Favicon | < 10KB | SVG inline preferido |

## Reglas de performance

### Imágenes
- SIEMPRE `loading="lazy"` en imágenes below the fold
- SIEMPRE `width` y `height` para evitar CLS
- Usar `<picture>` con WebP + fallback si es necesario
- Cover art: 400x400px máximo
- Hero image: 1920x1080, comprimido

### JavaScript
- Lazy import de módulos que no son críticos
- `requestIdleCallback` para tareas no urgentes
- Throttle/debounce en scroll handlers
- No re-renderizar toda la grid al cambiar un beat (solo el afectado)
- Usar `$:` reactivity de Svelte, no polling

### CSS
- No usar `@import` (bloqueante)
- Critical CSS inline en `<head>`
- Animaciones solo con `transform` y `opacity` (GPU-accelerated)
- `will-change` solo donde sea necesario
- No más de 3 capas de `backdrop-filter`

### Firebase
- Escuchar solo los paths necesarios (no toda la DB)
- Usar `limitToLast()` en queries grandes
- Cache de lecturas frecuentes en Svelte stores
- Debounce de writes (auto-save cada 2s, no cada keystroke)

### Audio
- Pre-cargar solo el siguiente beat (no todos)
- `preload="none"` en audio por defecto
- Waveform: usar cache en localStorage
- No generar waveform para beats sin preview

---

## Cómo verificar

```bash
# Build
npm run build
# Verificar tamaño del output

# Lighthouse
# Chrome → F12 → Lighthouse → Analyze page load
# Target: Performance ≥ 90, Accessibility ≥ 90

# Bundle analyzer (opcional)
npx vite-bundle-visualizer
```

---

## Si se rompe el budget

1. NO mergear el cambio
2. Identificar qué lo rompió (Lighthouse → Diagnostics)
3. Optimizar ANTES de continuar
4. Re-verificar
5. Documentar en CHANGELOG.md
