# MEGA AUDIT PROMPT — dacewav.store

Copia todo esto ↓

---

## Tarea principal

**Haz un audit EXTREMO de https://github.com/dacewav/storewav.** Cada página, cada botón, cada flujo. Nada se queda sin revisar.

Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages + R2 + TypeScript.
Live: https://dacewav.store
Lee `.guide/AUDIT-NEXT.md` y `.guide/MEGA-AUDIT-PROMPT.md` para contexto.

---

## FASE 1: NAVEGACIÓN COMPLETA CON BROWSER

Abre CADA una de estas URLs en browser, haz screenshot, y documenta lo que ves:

### Store (público)
- `/` — Homepage: hero, featured beats, catalogo, filtros, testimonios, footer
- `/kits` — Kits page: cards, precios, samples
- `/beat/[cualquiera]` — Beat detail: player, licencias, precio, relacionados, comentarios
- `/cart` — Carrito: items, cantidades, descuento, checkout button
- `/login` — Login: Google, email link, tester anónimo
- `/account/orders` — Mis órdenes (sin auth, debería pedir login)
- `/account/notifications` — Notificaciones
- `/verify/[hash]` — Verificación de contrato (testea con hash inválido y busca uno real en Firebase)
- `/checkout/success` y `/checkout/cancel` — Páginas de resultado

### Admin (necesita login como admin)
- `/admin` — Dashboard principal
- `/admin/beats` — Lista de beats, CRUD
- `/admin/beats/new` — Crear beat (si existe ruta)
- `/admin/kits` — Kits management
- `/admin/orders` — Órdenes
- `/admin/brand` — Logo, favicon, OG image
- `/admin/settings` — Configuración general
- `/admin/team` — Equipo/admins
- `/admin/subscribers` — Suscriptores
- `/admin/changelog` — Changelog

Para CADA página documenta:
1. ¿Carga correctamente? ¿Errores en consola?
2. ¿Todos los elementos visuales se renderizan bien?
3. ¿Links rotos o botones que no hacen nada?
4. ¿Responsive? (prueba a reducir el ancho del browser)
5. ¿Accesibilidad? (tab navigation, aria-labels, contraste de color)

---

## FASE 2: TEST DE CADA INTERACCIÓN

Haz click en TODO. Prueba TODO. Documenta qué funciona y qué no:

### Audio Player
- Click en play de un beat card → ¿suena?
- Click en otro beat → ¿cambia el audio?
- Pause → ¿se detiene?
- Progress bar → ¿se mueve? ¿es clickeable?
- ¿Qué pasa si das play en 2 beats rápido?

### Filtros y Búsqueda
- Buscar por nombre de beat → ¿filtra?
- Seleccionar cada género → ¿filtra?
- Seleccionar tonalidad → ¿filtra?
- Cambiar orden (recientes, populares, precio) → ¿reordena?
- Tags → ¿funcionan?
- Precio slider → ¿filtra por rango?
- Combinar filtros → ¿funciona junto?
- Limpiar filtres → ¿resetea?

### Likes y Favoritos
- Click en corazón de un beat → ¿cambia a lleno?
- Click otra vez → ¿togglea?
- ¿Persiste al recargar?
- Botón "Favoritos" en nav → ¿abre lista?

### Carrito
- "Agregar al carrito" desde beat card → ¿se agrega?
- "Agregar al carrito" desde beat detail → ¿se agrega con licencia seleccionada?
- Mismo beat dos veces → ¿maneja duplicados?
- Cambiar licencia en el carrito → ¿actualiza precio?
- Eliminar item → ¿se quita?
- Código de descuento → ¿valida? ¿aplica?
- Checkout → ¿redirige a Stripe?

### Auth
- "Iniciar sesión" → ¿abre modal/página?
- Google One Tap → ¿aparece? (en HTTPS/producción)
- Login como tester anónimo → ¿funciona?
- Después de login → ¿cambia el nav? ¿muestra avatar/logout?
- Acceder a /admin sin login → ¿redirige a /login?
- Acceder a /admin como no-admin → ¿muestra error?

### Admin CRUD
- Crear beat → ¿guarda en Firebase? ¿aparece en la tienda?
- Editar beat → ¿actualiza?
- Eliminar beat → ¿elimina? ¿confirmación?
- Subir audio → ¿upload a R2? ¿funciona el preview?
- Subir imagen de cover → ¿upload? ¿preview?
- Crear kit → ¿funciona? ¿con samples?
- Reordenar beats/kits → ¿drag & drop?
- Ver órdenes → ¿muestra datos?
- Brand settings → ¿cambiar logo/favicon?

### Theme
- Toggle dark/light → ¿cambia todo? ¿algún elemento no cambia?
- Custom themes (si existen) → ¿se aplican?

---

## FASE 3: E2E FLOW TEST

Simula un comprador real:

1. Abre `/` como visitante
2. Escucha un beat (play)
3. Añádelo al carrito
4. Ve al carrito
5. Aplica un código de descuento (si hay uno de test)
6. Click en checkout → ¿lleva a Stripe?
7. En Stripe test mode: usa tarjeta `4242 4242 4242 4242`, exp `12/34`, CVC `123`
8. Después del pago → ¿redirige a success page?
9. Verifica en Firebase: ¿order creada? ¿status=paid?
10. Verifica: ¿download token creado?
11. Verifica: ¿contract generado?
12. Click en download → ¿descarga el archivo?
13. Ve a `/verify/[hash]` con el hash del contrato → ¿verifica?

---

## FASE 4: CÓDIGO Y ARQUITECTURA

```bash
# Tests
npx vitest run

# Type check
npx svelte-check --tsconfig ./tsconfig.json

# Build
npx vite build
```

Revisa:
- ¿Tests fallan? ¿Cuántos? ¿Por qué?
- ¿TS errors? ¿Warnings?
- ¿Build OK?
- `grep -r "TODO\|FIXME\|HACK\|XXX" src/` — ¿hay code debt?
- ¿Hay `console.log` de debug que no deberían ir a producción?
- ¿Svelte 5 runes? (`$state`, `$derived`, `$effect`) o aún hay Svelte 4 patterns (`$:`)?
- ¿Error handling? ¿todos los fetch tienen try-catch?
- ¿Loading states? ¿skeletons?
- ¿empty states cuando no hay datos?

---

## FASE 5: SEO, PERFORMANCE, ACCESIBILIDAD

### SEO
- ¿Meta tags en cada página? (title, description, og:image, og:type)
- ¿Structured data? (JSON-LD para Organization, Product, etc.)
- ¿Sitemap completo? (todos los beats, kits, páginas estáticas)
- ¿robots.txt correcto?
- ¿Canonical URLs?

### Performance
- ¿Lazy loading de imágenes?
- ¿Imágenes optimizadas? (WebP, srcset)
- ¿Bundle size razonable?
- ¿Code splitting?
- ¿Preload de recursos críticos?

### Accesibilidad
- ¿Todas las imágenes tienen alt text?
- ¿Navegación por teclado funcional?
- ¿Contraste de color suficiente? (WCAG AA)
- ¿Form labels correctos?
- ¿Focus indicators visibles?
- ¿Screen reader friendly?

---

## OUTPUT ESPERADO

Genera un reporte organizado así:

### 🔴 CRÍTICO (bloquea ventas o funcionalidad)
- [Página] — [Problema] → [Solución]

### 🟡 MEDIO (afecta UX pero no bloquea)
- [Página] — [Problema] → [Solución]

### 🟢 MEJORA (nice-to-have, polish)
- [Página] — [Sugerencia] → [Implementación]

### 📊 MÉTRICAS
- Tests: X/Y passing
- TS errors: X
- Build: OK/FALLA
- Páginas testeadas: X
- Botones probados: X
- Issues encontrados: X (🔴X 🟡X 🟢X)

---

## NOTAS TÉCNICAS IMPORTANTES

- **Firebase rules están simplificadas** — `.write: true` en orders, downloadTokens, contracts, processedEvents, contractHashes. Sin validación estricta de campos.
- **R2 presigned URLs** — GET funciona, HEAD da 403 (comportamiento normal de R2)
- **Firebase REST API** — funciona sin auth para read/write (reglas abiertas para server-side)
- **Admin UIDs** — `PUBLIC_ADMIN_UIDS` env var en Cloudflare Pages (vacío en .env.example, configurado en producción)
- **.env** — copia `.env.example` a `.env` para variables de entorno locales
- **Stripe test key** — `sk_test_*` configurado en Cloudflare Pages env vars
- **No publiques Firebase rules** — el usuario ya las publicó 5+ veces, no lo vuelvas a pedir

## COMMITS RECIENTES
- `691c980` — mega audit prompt
- `651c0bc` — Firebase rules simplificadas
- `2bfc34c` — null values fix + contracts .read: true
- `efbabb7` — null values in Firebase writes
- `38d546c` — orders .read: true
- `9f27a6c` — download key fallback for legacy R2 keys
- `c63b20b` — webhook idempotency, download token TTL, favicon
