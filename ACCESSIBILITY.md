# ♿ ACCESSIBILITY.md — Plan de Accesibilidad

> La tienda debe ser usable por todos. Estos son los mínimos obligatorios.

---

## Mínimos obligatorios (cada componente)

| Requisito | Cómo |
|-----------|------|
| **Contraste** | Texto sobre fondo ≥ 4.5:1 (WCAG AA). Verificar con DevTools |
| **Focus visible** | Todos los elementos interactivos tienen `:focus-visible` outline |
| **Alt text** | Todas las imágenes tienen `alt` descriptivo o `alt=""` si decorativas |
| **Labels** | Todos los inputs tienen `<label>` o `aria-label` |
| **Keyboard** | Todo clickable es también navegable con Tab + Enter |
| **Semántica HTML** | `<nav>`, `<main>`, `<section>`, `<button>` en vez de `<div onclick>` |

## Componentes específicos

### Beat Card
- `role="article"` o `<article>`
- `aria-label="Beat: {nombre}, {bpm} BPM, {key}"`
- Botón play: `aria-label="Reproducir {nombre}"`
- Wishlist: `aria-label="Agregar {nombre} a favoritos"` + `aria-pressed`
- Click en card → abre modal → `aria-haspopup="dialog"`

### Player
- `role="region"` + `aria-label="Reproductor de audio"`
- Botones: `aria-label="Play"`, `aria-label="Siguiente"`, etc.
- Barra de progreso: `role="slider"` + `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Volumen: `role="slider"` + `aria-label="Volumen"`
- Tiempo: `aria-live="polite"` para actualizaciones

### Modal
- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` apuntando al título
- Focus trap: Tab solo cicla dentro del modal
- Escape cierra el modal
- Focus vuelve al elemento que abrió el modal al cerrar

### Filters
- `<form>` semántico
- `<select>` con `<label>` asociado
- Tag cloud: `role="group"` + `aria-label="Filtros de tags"`
- Search: `role="search"` + `aria-label="Buscar beats"`

### Navigation
- `<nav>` semántico
- `aria-label="Navegación principal"`
- Current page: `aria-current="page"`
- Mobile menu: `aria-expanded` toggle

### Wishlist panel
- `role="complementary"` + `aria-label="Favoritos"`
- Cada item: `role="listitem"`
- Botón remover: `aria-label="Quitar {nombre} de favoritos"`

## Skip links

```html
<a href="#main-content" class="skip-link">Saltar al contenido</a>
```

## Testing

| Check | Herramienta |
|-------|------------|
| Contraste | Chrome DevTools → Accessibility → Contrast |
| Lighthouse | `Lighthouse > Accessibility > 90+` |
| Screen reader | VoiceOver (Mac) o NVDA (Windows) |
| Keyboard only | Navegar toda la app sin mouse |
| axe DevTools | Extensión Chrome para auditoría |

## Prioridad

| Nivel | Qué | Cuándo |
|-------|-----|--------|
| P0 | Contraste, focus, keyboard, alt text | Cada componente, siempre |
| P1 | ARIA roles, labels, landmarks | Bloque 3 (tienda) |
| P2 | Focus trap en modal, skip links | Bloque 4 (beat page) |
| P3 | Screen reader testing | Bloque 10 (polish) |
