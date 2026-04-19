# 📱 MOBILE.md — Consideraciones Móvil

> La mayoría de visitantes vienen de celular. La tienda DEBE ser perfecta en móvil.

---

## Datos del usuario (inferidos de catalog)

- Catálogo de beats → audiencia joven (18-30) → 70%+ móvil
- México → alta penetración de Android
- Audio streaming → conexiones variables (3G/4G/WiFi)

## Prioridades móvil

### P0: Funcionalidad
- [ ] Player funciona en móvil (audio autoplay bloqueado → click para play)
- [ ] Beat cards son tappeables (no hover-dependent)
- [ ] Filtros funcionan con touch
- [ ] Wishlist funciona con touch
- [ ] Modal se puede cerrar con swipe down o tap fuera

### P1: UX móvil
- [ ] Bottom player bar (fixed, no tapa contenido)
- [ ] Filtros en horizontal scroll (no dropdowns apilados)
- [ ] Hero adaptado (font size, padding)
- [ ] Touch targets ≥ 44px (Apple HIG)
- [ ] No hay scroll horizontal accidental

### P2: Performance móvil
- [ ] Lazy loading de imágenes
- [ ] Audio preload mínimo (solo el que está sonando)
- [ ] Skeleton loading (no pantalla en blanco)
- [ ] Reduce motion si `prefers-reduced-motion`

### P3: Audio móvil (PROBLEMA GRANDE)

```
PROBLEMA: Navegadores móviles bloquean autoplay de audio.
iOS Safari: bloquea completamente hasta interacción del usuario.
Android Chrome: permite muted autoplay, bloquea con sonido.

SOLUCIÓN:
1. NUNCA intentar autoplay
2. Primer play SIEMPRE requiere click del usuario
3. Mostrar indicador claro: "Toca para reproducir"
4. After first interaction → siguiente track puede auto-next
5. Si el audio falla → mostrar toast + botón retry
```

### P4: Gestos táctiles

| Gesto | Acción |
|-------|--------|
| Swipe left/right en beat card | (futuro) Navegar entre beats |
| Swipe down en modal | Cerrar modal |
| Pull to refresh | Refrescar catálogo |
| Long press en beat card | Preview rápido (futuro) |

---

## Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| < 480px | 1 columna, bottom player, collapsed nav |
| 480-768px | 2 columnas, bottom player |
| 768-1024px | 2-3 columnas, sidebar player |
| > 1024px | 3+ columnas, sidebar player |

## Touch target sizes

```css
/* Mínimo 44x44px para elementos interactivos en móvil */
.btn, .filter-btn, .wish-btn, .play-hint {
  min-width: 44px;
  min-height: 44px;
}
```

## CSS para móvil

```css
@media (max-width: 768px) {
  .beat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .hero-title { font-size: 2rem; }
  .nav-links { display: none; } /* hamburger menu */
  .player-bar { position: fixed; bottom: 0; left: 0; right: 0; }
}

@media (max-width: 480px) {
  .beat-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 1.6rem; }
}
```
