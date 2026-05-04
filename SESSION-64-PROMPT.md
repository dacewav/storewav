# DACEWAV.STORE — SESIÓN 64
> Repo: https://github.com/dacewav/storewav
> Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages/Workers + R2 + TypeScript

## Estado actual

228 tests, 0 errors, 0 warnings, build clean. Session 63 hizo: Lucide icons (29 migrados), user profiles (banner/avatar/username/admin users), drumkits (/kits, /kit/[id], admin CRUD, cart integration).

**Deploy pendiente:** `firebase deploy --only database` — rules de users (public read para /u/[username]) y kits (nuevo path).

## Objetivo: Pulir todo lo que se construyó

No features nuevos. Solo pulir, testear, y asegurar que todo funciona bien.

### 1. Lucide Icons — verificar que nada se rompió
- [ ] Revisar que todos los iconos renderizan bien en store (search, cart, heart, play, share, chevrons, tag, bell, export, import, save, undo, redo, logout, settings, trash, plus, edit, warning, error, check, close, volumeOn, volumeOff, music, sun, moon, skipBack, skipForward, whatsapp, instagram, youtube)
- [ ] Revisar que el filled state del heart funciona (wishlist toggle)
- [ ] Verificar que brand icons (whatsapp/instagram/youtube) siguen como inline SVG
- [ ] Mobile: iconos no se cortan ni se ven pequeños de más

### 2. User Profiles — probar flujo completo
- [ ] Login anónimo → /account/profile → llenar datos → guardar → verificar en Firebase
- [ ] Banner upload: seleccionar imagen → crop 3:1 → subir a R2 → mostrar en perfil
- [ ] Avatar upload: seleccionar imagen → crop cuadrado → subir a R2 → mostrar
- [ ] Username: escribir "testuser" → verificar check en tiempo real (✓ o ✕)
- [ ] Username duplicado: intentar usar el mismo username que otro usuario → debe mostrar error
- [ ] Bio: escribir más de 160 chars → debe cortar
- [ ] Guardar → ir a /u/[username] → verificar que muestra perfil público (banner, avatar, bio, badges)
- [ ] Admin users: /admin/users → ver usuario → expandir → editar badges → banear/desbanear
- [ ] Account layout: verificar que muestra avatar R2 en vez de Google photoURL

### 3. Drumkits — probar flujo completo
- [ ] Admin: /admin/kits → crear kit nuevo → llenar nombre, género, precio, samples → guardar
- [ ] Store: /kits → verificar que aparece el kit creado
- [ ] Buscar kit por nombre
- [ ] Filtrar por género
- [ ] Click en kit → /kit/[id] → verificar detalle (cover, nombre, precio, samples)
- [ ] Play sample → verificar que suena audio
- [ ] Add to cart → verificar que se agrega al carrito
- [ ] Cart page → verificar que el kit aparece con precio correcto
- [ ] Admin: editar kit → cambiar nombre/precio → guardar → verificar cambios
- [ ] Admin: desactivar kit → verificar que no aparece en store
- [ ] Admin: eliminar kit → verificar que desaparece

### 4. Responsive — verificar en mobile
- [ ] 375px: /kits grid 2 columnas
- [ ] 375px: /kit/[id] layout apilado (cover arriba, info abajo)
- [ ] 375px: /account/profile form usable
- [ ] 375px: /admin/users lista legible
- [ ] 375px: /admin/kits CRUD usable
- [ ] 375px: nav "Kits" link visible

### 5. Edge cases
- [ ] /kits sin kits en Firebase → empty state
- [ ] /kit/[id] con ID inválido → "Kit no encontrado"
- [ ] /u/[username] con username inexistente → "Usuario no encontrado"
- [ ] Admin users sin usuarios → "Sin usuarios"
- [ ] Admin kits sin kits → "Sin kits"
- [ ] Username con caracteres especiales → debe sanitizar a lowercase alphanumeric

### 6. Firebase rules (ya escritas, necesitan deploy)
- [ ] Deploy: `firebase deploy --only database`
- [ ] Verificar que /u/[username] funciona después del deploy
- [ ] Verificar que admin puede leer todos los usuarios
- [ ] Verificar que kits son legibles públicamente

## Constraints
- Svelte 5: $state, $derived, $effect, $props (NO Svelte 4 stores en componentes nuevos)
- 0 TypeScript errors
- 228+ tests passing
- No tocar: firebase.json, wrangler.jsonc
- Usar CSS vars existentes
- Browser test después de cada cambio

## Archivos clave
- `src/lib/components/Icon.svelte` — Lucide wrapper
- `src/lib/icons.ts` — IconName type
- `src/lib/stores/kits.ts` — drumkit store
- `src/lib/components/KitCard.svelte` — kit card
- `src/routes/(store)/kits/+page.svelte` — /kits page
- `src/routes/(store)/kit/[id]/+page.svelte` — kit detail
- `src/routes/(store)/account/profile/+page.svelte` — profile editor
- `src/routes/(store)/u/[username]/+page.svelte` — public profile
- `src/routes/(admin)/admin/users/+page.svelte` — admin users
- `src/routes/(admin)/admin/kits/+page.svelte` — admin kits
- `src/routes/api/upload/banner/+server.ts` — banner upload
- `firebase.rules.json` — rules (deploy pendiente)
