# ⏳ LOADING-STATATES.md — Estados de Carga

> Cada estado de la app tiene que verse bien, incluso cuando los datos no han llegado.

---

## Estados por componente

### Beat Grid (carga inicial)

```
Estado: skeleton
Mostrar: 3-6 skeleton cards con shimmer animation
Duración: hasta que Firebase devuelva los beats
Transición: fade-in de skeleton → cards reales
```

Svelte:
```svelte
{#if loading}
  <div class="beat-grid">
    {#each Array(6) as _}
      <div class="skeleton-card">
        <div class="skeleton-img shimmer"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w60 shimmer"></div>
          <div class="skeleton-line w40 shimmer"></div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="beat-grid">
    {#each filteredBeats as beat (beat.id)}
      <BeatCard {beat} />
    {/each}
  </div>
{/if}
```

### Player (sin audio cargado)

```
Estado: empty
Mostrar: barra de player con nombre "—" y botones deshabilitados
Cuando se selecciona un beat: spinner mientras carga el audio
```

### Hero (settings no cargados)

```
Estado: fallback
Mostrar: título por defecto "DACEWAV" y subtítulo vacío
Cuando llegan settings: transición suave al contenido real
```

### Admin (no autenticado)

```
Estado: login overlay
Mostrar: pantalla de login con Google
No mostrar NADA del admin hasta autenticar
```

### Imagen de cover (cargando)

```
Estado: placeholder
Mostrar: div con color de fondo + icono ♦
Cuando carga: fade-in de la imagen real
Si falla: mostrar placeholder permanentemente
```

### Audio preview (cargando)

```
Estado: buffering
Mostrar: spinner en el botón play
Cuando está listo: botón play normal
Si falla: toast "No se pudo reproducir" + botón retry
```

---

## Errores de carga

| Error | UX |
|-------|----|
| Firebase timeout | Toast "Conexión lenta. Reintentando..." + auto-retry cada 5s |
| Audio no carga | Toast "No se pudo reproducir este beat" + botón retry |
| Imagen no carga | Placeholder silencioso (sin error visible) |
| Auth falla | "Error de autenticación. Intenta de nuevo." |
| Beats vacíos | "No hay beats aún. ¡Sube el primero!" (solo en admin) |

---

## Skeleton CSS (base)

```css
.skeleton-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.skeleton-img {
  aspect-ratio: 1;
  background: var(--bg-secondary);
}
.skeleton-body { padding: var(--space-md); }
.skeleton-line {
  height: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-sm);
}
.skeleton-line.w60 { width: 60%; }
.skeleton-line.w40 { width: 40%; }
.skeleton-line.w80 { width: 80%; }

.shimmer {
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-card) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
