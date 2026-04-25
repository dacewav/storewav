# 🎨 MEGA PROMPT — Rebuild Card Style Customization System

## Contexto

El sistema de Card Style de dacewav.store tiene un motor potente (`cardStyleEngine.ts`) con 30+ propiedades CSS, pero la UI de personalización está extremadamente básica. El BeatEditor solo tiene 3 controles (glow, animation, shimmer checkbox). Necesitamos una UI completa que exponga todo el poder del motor.

**Repo:** `dacewav-store` (SvelteKit 2 + Firebase + Cloudflare)
**Archivos clave:**
- `src/lib/cardStyleEngine.ts` — motor CSS (426 líneas, 30+ props)
- `src/lib/components/BeatEditor.svelte` — editor de beats (solo 3 controles de estilo)
- `src/routes/(admin)/admin/theme/+page.svelte` — settings globales (usa theme.*, NO cardStyle.*)
- `src/lib/components/BeatCard.svelte` — renderiza cards con `cardStyleToCSS()`
- `src/lib/stores/settings.ts` — settings store con `CardStyleConfig`

## Problema Actual

### Lo que el motor soporta (`CardStyleConfig`):
```
Glow:       glow, glowColor, glowIntensity, glowBlur, glowAnim, glowAnimSpeed
Filters:    brightness, contrast, saturate, grayscale, sepia, hueRotate, invert
Border:     borderWidth, borderStyle, borderColor, borderRadius
Shadow:     boxShadow
Transform:  rotate, scale, skew, translateY
Hover:      hoverScale, hoverBrightness, hoverBlur, hoverSaturate
Animation:  animation, animationDuration, animationDelay
Cover:      coverOverlay, coverBlur
Shimmer:    shimmer, shimmerColor, shimmerDuration, shimmerOpacity
```

### Lo que la UI muestra (BeatEditor Card Style tab):
```
1. Glow → select (none/soft/strong/neon/custom) — NO expone color, blur, intensity
2. Animation → select (6 opciones de 35+ disponibles)
3. Shimmer → checkbox sin controles de color/opacity/duration
```

**Resultado:** Los beats se ven todos iguales porque no hay forma de personalizarlos.

## Objetivo

Crear una UI de Card Style en el BeatEditor que exponga TODAS las propiedades del motor, organizada en secciones colapsables, con preview en tiempo real. También necesitamos una página de admin para el globalCardStyle (settings).

## Especificación de la UI

### Sección 1: 🌟 Glow
```
- Tipo:       select (none, soft, strong, neon, pulse, breathe, rgb, custom)
- Color:      color picker + text input
- Intensity:  range 0-3, step 0.1 (default: 1)
- Blur:       range 0-60px, step 1 (default: 20)
- Animación:  select (none, pulse, breathe, spin)
- Anim speed: range 0.5-10s, step 0.5 (default: 2)
```

### Sección 2: 🎨 Filtros CSS
```
- Brightness: range 0-2, step 0.05 (default: 1)
- Contrast:   range 0-2, step 0.05 (default: 1)
- Saturate:   range 0-3, step 0.1 (default: 1)
- Grayscale:  range 0-1, step 0.05 (default: 0)
- Sepia:      range 0-1, step 0.05 (default: 0)
- Hue Rotate: range 0-360°, step 5 (default: 0)
- Invert:     range 0-1, step 0.05 (default: 0)
```

### Sección 3: 🖼️ Borde
```
- Width:      range 0-5px, step 1 (default: 0)
- Style:      select (none, solid, dashed, dotted, double)
- Color:      color picker + text input
- Radius:     range 0-24px, step 1 (default: 0)
```

### Sección 4: 🌑 Sombra
```
- X offset:   range -20-20px, step 1 (default: 0)
- Y offset:   range -20-20px, step 1 (default: 4)
- Blur:       range 0-60px, step 1 (default: 12)
- Spread:     range -20-20px, step 1 (default: 0)
- Color:      color picker (default: #000000)
- Opacity:    range 0-1, step 0.05 (default: 0.35)
- Inset:      checkbox (default: false)
```

### Sección 5: 🔄 Transform
```
- Rotate:     range -180-180°, step 1 (default: 0)
- Scale:      range 0.5-1.5, step 0.01 (default: 1)
- Skew X:     range -30-30°, step 1 (default: 0)
- Skew Y:     range -30-30°, step 1 (default: 0)
- Translate Y: range -20-20px, step 1 (default: 0)
```

### Sección 6: 🖱️ Hover
```
- Scale:       range 0.8-1.3, step 0.01 (default: 1.02)
- Brightness:  range 0.5-2, step 0.05 (default: 1.05)
- Blur:        range 0-10px, step 0.5 (default: 0)
- Saturate:    range 0-3, step 0.1 (default: 1)
- Transition:  range 0.1-1s, step 0.05 (default: 0.3)
```

### Sección 7: ✨ Animación
```
- Tipo:        select (35+ presets — ver lista abajo)
- Duration:    range 0.5-10s, step 0.5 (default: 3)
- Delay:       range 0-5s, step 0.1 (default: 0)
```

### Sección 8: 💫 Shimmer
```
- Activo:      checkbox (default: false)
- Color:       color picker (default: rgba(255,255,255,0.12))
- Opacity:     range 0-1, step 0.05 (default: 1)
- Duration:    range 1-10s, step 0.5 (default: 2.5)
```

### Sección 9: 🖼️ Cover Effects
```
- Overlay:     textarea para CSS gradient personalizado
- Blur:        range 0-20px, step 1 (default: 0)
```

## Presets de Animación Disponibles (35+)

El motor ya soporta TODOS estos, pero la UI solo muestra 6:

**Suaves:** float, drift, sway, breathe, pulse, fadeIn, slideUp, slideDown, scaleIn
**Energéticos:** bounce, shake, headShake, jello, wobble, rubberBand, swing, tada, flash
**3D:** rotate3d, tilt, flip, flipX, flipY, hologram, glitch
**Especiales:** shimmer, borderGlow, colorShift, neonFlicker, heartbeat, lightSpeed, blurIn, zoomPulse, gradientBorder, dropIn, riseUp, popIn, elastic, squeeze, rubber

## Implementación

### Archivo nuevo: `src/lib/components/CardStyleEditor.svelte`

Componente reutilizable que se usa en:
1. **BeatEditor** — para per-beat cardStyle overrides
2. **Admin theme page** — para globalCardStyle settings

Props:
```ts
let {
  value = $bindable({}),
  mode = 'per-beat'  // 'per-beat' | 'global'
}: {
  value: Partial<CardStyleConfig>;
  mode?: 'per-beat' | 'global';
}
```

- En modo `per-beat`: cada campo tiene opción "(usar global)" como default
- En modo `global`: todos los campos tienen valores por defecto del motor

### Cambios en BeatEditor

Reemplazar la sección `{#if activeTab === 'style'}` (3 controles) con:
```svelte
{#if activeTab === 'style'}
  <CardStyleEditor bind:value={beat.cardStyle} mode="per-beat" />
{/if}
```

### Nueva página admin: `src/routes/(admin)/admin/cardstyle/+page.svelte`

Página dedicada para globalCardStyle con preview en tiempo real:
- CardStyleEditor en modo global
- Preview card que muestra los cambios en vivo
- Botón "Reset a defaults"
- Botón "Copiar a todos los beats" (aplica globalCardStyle como base)

### Cambios en BeatCard

Asegurar que `mergeCardStyles()` mergea correctamente:
1. globalCardStyle (settings) → base
2. beat.cardStyle → overrides por beat
3. custom → overrides adicionales

Ya funciona, solo verificar.

### Cambios en settings.ts

Agregar `globalCardStyle` como campo exportado y writable:
```ts
export const globalCardStyle = derived(settings, ($s) => $s.data?.cardStyle ?? {});
```

### Navegación admin

Agregar "Card Style" al nav del admin layout:
```ts
{ id: 'cardstyle', label: 'Card Style', icon: '🎨' }
```

## Datos de Firebase

El globalCardStyle se guarda en `settings.globalCardStyle` (ya existe en Firebase). La migración en `migrateOldData()` ya convierte el formato viejo al nuevo.

Ejemplo de formato Firebase:
```json
{
  "globalCardStyle": {
    "glow": { "enabled": true, "type": "active", "color": "#dc2626", "intensity": 1 },
    "filter": { "brightness": 1, "contrast": 1, "saturate": 1 },
    "border": { "enabled": true, "width": 1, "style": "solid", "color": "#333" },
    "shadow": { "enabled": true, "x": 0, "y": 4, "blur": 12, "opacity": 0.35 },
    "hover": { "scale": 1.02, "brightness": 1.05 },
    "style": { "shimmer": false, "borderRadius": 8 },
    "transform": { "rotate": 0, "scale": 1 }
  }
}
```

## Validación

Después de implementar:
1. `npx svelte-check` → 0 errores, 0 warnings
2. `npm test` → todos los tests pasando
3. `npm run build` → clean
4. Admin → crear beat → tab Card Style → TODAS las secciones visibles
5. Admin → Theme → Card Style section → funcional
6. Store → beat card refleja los estilos aplicados
7. Cambiar globalCardStyle → todos los beats se actualizan
8. Per-beat override → solo ese beat cambia

## Prioridad

1. `CardStyleEditor.svelte` — componente base
2. BeatEditor — integrar componente
3. Admin cardstyle page — página nueva
4. Admin nav — agregar link
5. Tests — verificar que no rompe nada
6. Build + deploy

---

**Empezá por crear `CardStyleEditor.svelte`. Es el componente base que todo lo demás usa.**
