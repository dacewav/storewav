# 🔬 DEEP AUDIT — Browser Testing Results

> Testeado en browser real (Chromium) — desktop 1440px + mobile 375x812
> Fecha: 2026-05-16

---

## 🚨 BUGS CRÍTICOS (Encontrados en browser)

### 1. ❌ BEAT DETAIL PAGE — COMPLETAMENTE ROTO
- **URL probada**: `/beat/reggaeton-1747268707458`
- **Resultado**: "Beat no encontrado"
- **Impacto**: **CRÍTICO** — Los clientes NO pueden ver detalles de beats, licencias, ni comprar
- **Causa raíz**: El slug generado por `getBeatSlug()` no se resuelve en el lookup de `+page.svelte`
- **Reproducción**: Click en cualquier BeatCard → siempre muestra "Beat no encontrado"
- **Fix urgente**: Verificar que `allBeats` se popula correctamente en la beat detail page antes del lookup

### 2. ❌ AUDIO CORS — Preview no reproduce
- **Error en consola**: `MediaElementAudioSource outputs zeroes due to CORS access restrictions for https://cdn.dacewav.store/beats/previews/...`
- **Impacto**: **CRÍTICO** — Los previews de audio NO se reproducen
- **Causa**: El CDN `cdn.dacewav.store` no envía headers `Access-Control-Allow-Origin`
- **Fix**: Configurar CORS en Cloudflare R2/CDN para permitir el dominio `dacewav.store`

### 3. ❌ CART — Imagen del beat no se muestra
- **Observado**: El carrito muestra "Sin imagen" placeholder para el beat agregado
- **Esperado**: Debería mostrar la imagen del beat
- **Causa**: El `imageUrl` se pasa al cart pero puede ser string vacío si el beat no tiene imagen, O la imagen del beat no carga en el contexto del carrito
- **Fix**: Verificar que `beat.imageUrl` tiene valor antes de agregar al cart; fallback a gradient del género

### 4. ❌ PLAYER — Cubre el botón de checkout en desktop
- **Observado**: El player bar fijo en el bottom cubre parcialmente el botón "Comprar" del carrito
- **Impacto**: Los usuarios no pueden hacer click en "Pagar con Stripe" cuando el player está activo
- **Fix**: Agregar `padding-bottom` al `.cart-page` cuando el player está visible (similar al `.main.has-player`)

### 5. ❌ GOOGLE ONE TAP — Error en cada carga
- **Error en consola**: `Not signed in with the identity provider.`
- **Impacto**: Se ejecuta en CADA página load, ruido en consola, posible impacto en performance
- **Causa**: `initOneTap()` se llama sin verificar si el usuario ya rechazó One Tap
- **Fix**: Guardar rechazo en localStorage y no reintentar

### 6. ⚠️ META TAG — Deprecado
- **Warning**: `<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated`
- **Fix**: Cambiar a `<meta name="mobile-web-app-capable" content="yes">`

### 7. ⚠️ PRELOAD — Unsupported `as` value
- **Warning**: `<link rel=preload> uses an unsupported 'as' value`
- **Causa**: El BeatCard crea `<link rel="preload" as="audio">` dinámicamente pero `as="audio"` no es válido
- **Fix**: Cambiar a `as="media"` o eliminar el preload dinámico

---

## 🎨 BUGS VISUALES (Encontrados en screenshots)

### 8. LIGHT THEME — Contraste pobre en secciones
- **Secciones afectadas**:
  - "CALIDAD ASEGURADA !" → texto gris sobre fondo gris claro = ilegible
  - Testimonios → texto muy tenue
  - CTA "¿Listo para tu próximo hit?" → texto casi invisible
- **Fix**: Aumentar opacidad de `--text-secondary` en light mode de 0.55 a 0.7

### 9. PLACEHOLDER VISIBLE — "pensando cosas..."
- **Observado**: El divider "CALIDAD ASEGURADA" tiene subtítulo "pensando cosas..." que es claramente un placeholder
- **Impacto**: Se ve poco profesional, como si el sitio estuviera en desarrollo
- **Fix**: Completar con contenido real O eliminar la sección si no hay contenido

### 10. HERO STATS — Datos crudos
- **Observado**: "1 beats · 1 géneros · 4 licencias"
- **Problema**: Cuando hay pocos beats, los stats se ven vacíos y poco impresionantes
- **Fix**: Ocultar stats cuando hay < 3 beats, o mostrar "Próximamente"

### 11. BEATCARD — Tags repetitivos
- **Observado**: El beat "Reggaeton !" tiene:
  - Genre badge: "Reggaeton"
  - Tags: "Reggaeton" (repetido)
- **Fix**: No mostrar tags que sean iguales al género

### 12. TESTIMONIOS — Mínimos
- **Observado**: Solo 1 testimonio con texto "\"duro\"" — se ve poco profesional
- **Fix**: Agregar más testimonios o usar diseño de "próximamente" cuando hay < 3

### 13. FOOTER — Demasiado básico
- **Observado**: Solo brand + copyright + 2 links (Instagram, WhatsApp)
- **Fix**: Agregar secciones de links (Tienda, Soporte, Legal)

### 14. CTA WHATSAPP — Emoji genérico
- **Observado**: El botón usa un emoji de WhatsApp en lugar de un SVG real
- **Fix**: Usar SVG de WhatsApp para consistencia visual

---

## 📱 BUGS MOBILE (375x812)

### 15. PLAYER MOBILE — Controles limitados
- **Observado**: En mobile se ocultan:
  - Skip ±10s buttons
  - Volume slider
  - Waveform
  - Tiempos (current/total)
- **Resultado**: Solo queda cover + título + play/pause + close
- **Fix**: Mostrar al menos los skip buttons en mobile (son útiles para podcasts/beats largos)

### 16. MOBILE MENU — Links externos mezclados
- **Observado**: "Instagram" y "WhatsApp" aparecen como items de nav junto a "Catálogo" y "Kits"
- **Problema**: Links externos no deberían estar en el nav principal mobile
- **Fix**: Mover Instagram/WhatsApp a una sección "Social" separada en el mobile menu

### 17. MOBILE MENU — Emojis genéricos
- **Observado**: 🎵 (Catálogo), 🥁 (Kits), 🔗 (links externos)
- **Problema**: El emoji 🔗 es genérico y no informativo
- **Fix**: Usar iconos específicos o eliminar los emojis de links externos

### 18. CART MOBILE — Checkout bar vs Player
- **Observado**: El mobile checkout bar (`.mobile-checkout-bar`) está hidden por CSS pero el player cubre el botón de checkout desktop
- **Fix**: Asegurar que el mobile checkout bar se muestre y el player no lo cubra

---

## 🔧 ISSUES DE CÓDIGO

### 19. CONSOLE — Errores acumulados
- **Total de errores/warnings en consola**: 6+ por página load
- **Errores**: CORS, Google One Tap, meta deprecado, preload inválido
- **Impacto**: Suciedad en consola, posibles problemas de debugging futuro

### 20. AUDIO PRELOAD — Crea links dinámicos sin cleanup
- **Problema**: En `BeatCard.svelte`, el `onmouseenter` crea `<link rel="preload">` dinámicos pero nunca los limpia
- **Riesgo**: Memory leak si el usuario hover muchos beats
- **Fix**: Verificar si el link ya existe antes de crearlo (ya lo hace, pero podría fallar por query params)

### 21. SLUG SYSTEM — Inconsistente
- **Problema**: `getBeatSlug()` genera slugs desde el nombre, pero:
  - "Reggaeton !" → "reggaeton-" (trailing hyphen)
  - Caracteres especiales podrían generar slugs vacíos
  - El lookup no tiene fallback robusto
- **Fix**: 
  1. Limpiar trailing hyphens en `generateSlug()`
  2. Agregar fallback: slug → ID → partial match
  3. Guardar el slug como campo en Firebase para consistencia

### 22. CART STORE — Sync a Firebase sin throttle
- **Problema**: `syncToFirebase()` se dispara en CADA cambio del cart con debounce de 2s
- **Riesgo**: Si el usuario agrega/remueve items rápidamente, múltiples writes a Firebase
- **Fix**: Aumentar debounce a 5s o usar batch writes

### 23. SETTINGS — Carga desde Firebase sin retry
- **Problema**: Si Firebase falla al cargar settings, no hay retry mechanism
- **Resultado**: El loader podría quedarse visible hasta el safety timeout de 8s
- **Fix**: Agregar retry con backoff exponencial (max 3 intentos)

---

## 🎯 MEJORAS DE UX (Encontradas durante testing)

### 24. BEATCARD — Click en card vs click en botones
- **Problema**: Click en el card navega al beat detail, pero click en play/favorite/cart debería ser independiente
- **Observado**: Los `e.stopPropagation()` están implementados correctamente ✅
- **Pero**: El card completo es un `<button>` que captura todos los clicks — podría causar conflictos
- **Verificar**: Que los botones internos realmente previenen la navegación

### 25. WISHLIST — Sin feedback visual al añadir
- **Observado**: Al hacer click en favoritos, aparece un burst effect pero no hay badge persistente
- **Fix**: Mostrar el badge de wishlist count en la nav cuando hay items

### 26. RECENTLY PLAYED — Nombre del artista
- **Observado**: Muestra "Dace" como artista en lugar del nombre completo del beat
- **Causa**: `beat.artist` podría ser "Dace" o el campo podría estar vacío
- **Fix**: Usar `beat.artist ?? brandName` como fallback

### 27. CART — Sin indicador de "agregado recientemente"
- **Observado**: Al agregar un beat al carrito, el badge del carrito se actualia pero no hay highlight
- **Fix**: Agregar animación de pulso al badge del carrito cuando se agrega un item

### 28. SEARCH — Sin resultados en homepage
- **Observado**: El search del Filters component tiene typeahead pero solo funciona en la homepage
- **Problema**: Si el usuario busca desde otra página, no hay resultados
- **Fix**: Agregar search global que funcione desde cualquier página

### 29. ACCOUNT PAGES — Sin protección de ruta
- **Observado**: `/account/orders` muestra "Sin órdenes" incluso sin login
- **Fix**: Redirigir a login si el usuario no está autenticado, o mostrar "Inicia sesión para ver tus órdenes"

### 30. LOADER — Safety timeout muy largo
- **Observado**: El loader tiene un safety timeout de 8s
- **Problema**: Si Firebase está lento, el usuario ve un spinner por 8 segundos
- **Fix**: Reducir a 5s y mostrar un mensaje "Conectando..." después de 3s

---

## 📊 RESUMEN DE SEVERIDAD

| Severidad | Cantidad | Issues |
|-----------|----------|--------|
| 🔴 CRÍTICO | 4 | #1 Beat detail roto, #2 CORS audio, #4 Player cubre checkout, #3 Cart sin imagen |
| 🟠 ALTO | 5 | #5 One Tap error, #8 Light theme contrast, #9 Placeholder visible, #15 Player mobile, #21 Slug system |
| 🟡 MEDIO | 10 | #6 Meta deprecado, #7 Preload, #10 Hero stats, #11 Tags repetidos, #12 Testimonios, #13 Footer, #16 Menu externos, #18 Cart mobile, #20 Audio preload, #29 Account sin protección |
| 🟢 BAJO | 11 | #14 CTA emoji, #17 Menu emojis, #19 Console errors, #22 Cart sync, #23 Settings retry, #24 Card clicks, #25 Wishlist feedback, #26 Recently played, #27 Cart badge, #28 Search global, #30 Loader timeout |

---

## 🔧 FIXES INMEDIATOS (Código)

### Fix #1: Beat Detail Page — Agregar logging para debug
```typescript
// En src/routes/(store)/beat/[id]/+page.svelte
let beat = $derived.by(() => {
    const param = page.params.id;
    console.log('[BeatDetail] Looking up:', param);
    console.log('[BeatDetail] Available beats:', allBeats.length);
    
    const bySlug = allBeats.find(b => getBeatSlug(b) === param);
    if (bySlug) {
        console.log('[BeatDetail] Found by slug:', bySlug.name);
        return bySlug;
    }
    
    const byId = allBeats.find(b => b.id === param);
    if (byId) {
        console.log('[BeatDetail] Found by ID:', byId.name);
        return byId;
    }
    
    console.warn('[BeatDetail] Not found:', param);
    return null;
});
```

### Fix #2: CORS Audio — Headers en Cloudflare R2
```
En Cloudflare Dashboard → R2 → dacewav bucket → Settings → CORS policy:

[
  {
    "AllowedOrigins": ["https://dacewav.store", "https://www.dacewav.store"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

### Fix #4: Player overlap — Padding dinámico
```css
/* En cart/+page.svelte */
.cart-page {
    padding-bottom: var(--space-16);
}

/* Cuando el player está activo */
.main.has-player ~ .cart-page,
.cart-page.has-player {
    padding-bottom: calc(var(--space-16) + 80px);
}
```

### Fix #8: Light theme contrast
```css
/* En app.css, sección [data-theme="light"] */
[data-theme="light"] {
    --text-secondary: rgba(10, 10, 10, 0.7); /* Era 0.55 */
    --text-muted: rgba(10, 10, 10, 0.35);     /* Era 0.25 */
}
```

### Fix #21: Slug trailing hyphens
```typescript
// En src/lib/slug.ts
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .replace(/-+$/, '')  // ← NUEVO: eliminar trailing hyphens
        .slice(0, 80);
}
```

---

*Deep audit completado — Browser testing en Chromium*
