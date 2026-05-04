# DACEWAV.STORE — SESIÓN 64
> Repo: https://github.com/dacewav/storewav
> Stack: SvelteKit 2 + Svelte 5 + Firebase RTDB + Cloudflare Pages/Workers + R2 + TypeScript

---

## 📊 ESTADO ACTUAL (post-Session 63)

| Métrica | Valor |
|---|---|
| Tests | 228/228 passing |
| TypeScript errors | 0 |
| svelte-check | 0 errors, 0 warnings |
| Build | Clean (Cloudflare adapter) |
| Commits | 3b6634f (code), 6c6c6eb (prompt) |
| Firebase rules | ⚠️ ACTUALIZADAS LOCALMENTE, NO DEPLOYEADAS |

---

## 🏗️ LO QUE SE CONSTRUYÓ EN SESSION 63 (3 features)

### A) Lucide Icons Migration
- **Qué:** 29 iconos SVG inline → componentes `lucide-svelte`
- **Cómo:** Individual imports para tree-shaking (`import Heart from 'lucide-svelte/icons/heart'`)
- **Archivo clave:** `src/lib/components/Icon.svelte` — wrapper que mapea nombre→componente Lucide
- **Brand icons:** whatsapp, instagram, youtube quedaron como inline SVG (Lucide no tiene brand icons)
- **Tipo:** `src/lib/icons.ts` exporta `IconName` type
- **Consumidores:** 22 archivos importan Icon (ver grep abajo)
- **Riesgo:** Bajo — swap visual 1:1, no cambia lógica

**Archivos modificados:**
- `src/lib/components/Icon.svelte` — rewrite completo
- `src/lib/icons.ts` — de 380 líneas de SVG a 12 líneas de type export
- `package.json` — `lucide-svelte` agregado como dependency

**Iconos migrados:**
heart, play, pause, close(X), search, check, warning(TriangleAlert), error(CircleX), volumeOn(Volume2), volumeOff(VolumeX), music, tag, sun, moon, chevronDown, chevronLeft, chevronUp, settings, edit(Pencil), trash(Trash2), plus, undo(Undo2), redo(Redo2), save, export(Download), share(Share2), import(Upload), logout(LogOut), skipBack, skipForward, shoppingCart, bell

### B) User Profiles Completos
- **Qué:** Sistema de perfiles con banner upload, username uniqueness, admin users page
- **Firebase path:** `/users/{uid}/` con campos: displayName, email, artistName, username, bio, country, phone, avatarURL, bannerURL, badges[], banned, socials{}, createdAt, updatedAt

**Archivos nuevos:**
- `src/routes/api/upload/banner/+server.ts` — endpoint POST multipart → R2, crop 3:1 (1200×400), 4MB max
- `src/routes/(admin)/admin/users/+page.svelte` — admin users page

**Archivos modificados:**
- `src/routes/(store)/account/profile/+page.svelte` — banner upload UI, username validation con debounce
- `src/routes/(store)/account/+layout.svelte` — muestra avatar R2 custom en header
- `src/routes/(admin)/+layout.svelte` — link "👤 Usuarios" en sidebar
- `firebase.rules.json` — users: `.read: true`, `.write: owner+admin`, `.indexOn: ["username"]`, field validation

**Funcionalidades:**
1. **Banner upload:** Click → file picker → crop 3:1 con canvas → POST /api/upload/banner → R2 → save URL a Firebase
2. **Avatar upload:** Click → file picker → crop cuadrado 400×400 → POST /api/upload/avatar → R2 → save URL
3. **Username validation:** Input con @ prefix → debounce 500ms → fetch `users.json?orderBy="username"&equalTo="..."` → check uniqueness → ✓ o ✕ visual
4. **Admin users:** Lista todos los usuarios → expandir detalle → badge editor (toggle 6 badges) → ban/unban toggle
5. **Account layout:** Header muestra avatar R2 > Google photoURL > placeholder letter

### D) Drumkits Section
- **Qué:** Nueva sección /kits para drumkits y sample packs
- **Firebase path:** `/kits/{kitId}` con campos: name, description, genre, imageUrl, samples[], priceMXN, priceUSD, active, order, createdAt, updatedAt

**Archivos nuevos:**
- `src/lib/stores/kits.ts` — Firebase store con CRUD (createKit, updateKit, deleteKit, emptyKit)
- `src/lib/components/KitCard.svelte` — card con cover, genre badge, sample count, play, add-to-cart
- `src/routes/(store)/kits/+page.svelte` — store page con grid, search, genre pills
- `src/routes/(store)/kit/[id]/+page.svelte` — detail page con audio previews inline
- `src/routes/(admin)/admin/kits/+page.svelte` — admin CRUD con sample management

**Archivos modificados:**
- `src/lib/stores/index.ts` — exports kits, kitsList, allKitsList, kitsStats, kitGenres, createKit, updateKit, deleteKit, emptyKit, Kit, KitWithId, KitsMap, KitSample
- `src/lib/components/index.ts` — export KitCard
- `src/routes/(admin)/+layout.svelte` — link "🥁 Drumkits" en sidebar bajo Tienda
- `src/routes/(store)/+layout.svelte` — link "Kits" en nav desktop + mobile menu
- `firebase.rules.json` — kits: `.read: true`, `.write: admin`, field validation

**Funcionalidades:**
1. **KitCard:** Cover image, genre badge (accent color), sample count badge, play button overlay, add-to-cart button con estado in-cart
2. **/kits page:** Grid auto-fill minmax(220px), search input, genre pills con fade edge, empty state
3. **/kit/[id]:** Back link, 2-column layout (cover 300px + info), genre label, pricing, cart button, samples list con play/pause por sample (usa `new Audio()`)
4. **Admin CRUD:** Lista con thumb/nombre/genre/samples/precio, editor inline con sample management (add/remove/edit samples), active toggle, delete con confirm
5. **Cart integration:** Usa `kit-{id}` como beatId, mismo sistema cart que beats

---

## 🔍 CHECKLIST DE TESTING (lo que hay que hacer)

### 1. Lucide Icons — verificar rendering
```
Páginas a revisar:
- / (store) — search, cart, heart, play, share, chevronUp, export
- /beat/[id] — chevronLeft, play, heart (filled!), share, music, shoppingCart
- /cart — music, close
- /account — export, shoppingCart, heart, music (tabs)
- /account/profile — (no usa Icon directamente)
- /admin — save, undo, redo, export, import, logout (topbar)
- /admin/beats — (usa emojis, no Icon)
- /kits — search, close, music, play, shoppingCart, check
- /kit/[id] — chevronLeft, play, pause, music, shoppingCart, check
- Filters component — search, close, chevronDown, tag
- Player — skipBack, pause, play, skipForward, volumeOff, volumeOn, close
- ToastContainer — check, error, warning, close
- WishlistPanel — close
- BeatCard — play, heart (filled), shoppingCart
- BeatModal — music, heart, play
```

### 2. User Profiles — flujo completo
```
1. Ir a /login → click "🧪 Entrar como tester (anónimo)"
2. Ir a /account/profile
3. Verificar: banner placeholder "🖼️ Click para subir banner"
4. Verificar: avatar placeholder con letra
5. Click avatar → seleccionar imagen → crop → upload → verificar preview
6. Click banner → seleccionar imagen → crop 3:1 → upload → verificar preview
7. Escribir "testuser" en username → verificar ✓ verde (único)
8. Escribir nombre artístico, bio, país
9. Click "💾 Guardar perfil" → verificar "Perfil guardado" success
10. Ir a /u/testuser → verificar perfil público muestra avatar, banner, bio
11. Ir a /admin/users → verificar usuario aparece en lista
12. Expandir usuario → click "Editar" badges → togglear badges → guardar
13. Click "🚫 Banear" → verificar badge "Baneado" aparece
```

### 3. Drumkits — flujo completo
```
1. Ir a /admin/kits → click "+ Nuevo kit"
2. Llenar: nombre "Trap Kit Vol. 1", género "Trap", precio 350/20
3. Click "+ Agregar sample" → escribir nombre "808 Kick", URL de audio
4. Agregar 2-3 samples más
5. Click "💾 Guardar" → verificar kit aparece en lista
6. Ir a /kits → verificar kit aparece en grid
7. Buscar "Trap" → verificar filtro funciona
8. Click en kit → verificar /kit/[id] muestra detalle
9. Click play en un sample → verificar que suena audio
10. Click "Agregar al carrito" → verificar botón cambia a verde ✓
11. Ir a /cart → verificar kit aparece con precio correcto
12. Volver a /admin/kits → editar kit → cambiar nombre → guardar
13. Desactivar kit → verificar no aparece en /kits
14. Reactivar → verificar aparece de nuevo
15. Eliminar kit → verificar desaparece
```

### 4. Mobile 375px
```
- /kits: grid 2 columnas
- /kit/[id]: layout apilado
- /account/profile: form usable, inputs no se cortan
- /admin/users: lista legible, stats 2x2
- /admin/kits: CRUD usable
- Nav: link "Kits" visible en mobile menu
```

### 5. Edge cases
```
- /kits sin kits → empty state "🥁 Sin kits"
- /kit/abc123 ID inválido → "🥁 Kit no encontrado"
- /u/noexiste → "👤 Usuario no encontrado"
- /admin/users sin usuarios → "👤 Sin usuarios"
- /admin/kits sin kits → "🥁 Sin kits"
- Username "ABC!@#" → debe sanitizar a "abc"
- Username "ab" → debe mostrar "Mínimo 3 caracteres"
- Bio 200 chars → debe cortar a 160
```

### 6. Firebase deploy
```bash
firebase deploy --only database
```
Después del deploy:
- /u/[username] debe funcionar (regla `.read: true` en users)
- Admin puede leer todos los usuarios
- Kits son legibles públicamente

---

## 📁 ARCHIVOS CLAVE (para referencia rápida)

### Nuevos (Session 63)
```
src/lib/stores/kits.ts                          — drumkit store
src/lib/components/KitCard.svelte               — kit card component
src/routes/(store)/kits/+page.svelte            — /kits page
src/routes/(store)/kit/[id]/+page.svelte        — kit detail
src/routes/(admin)/admin/kits/+page.svelte      — admin kits CRUD
src/routes/(admin)/admin/users/+page.svelte     — admin users
src/routes/api/upload/banner/+server.ts         — banner upload API
```

### Modificados (Session 63)
```
src/lib/components/Icon.svelte                  — Lucide wrapper (rewrite)
src/lib/icons.ts                                — type-only export
src/lib/stores/index.ts                         — +kit exports
src/lib/components/index.ts                     — +KitCard export
src/routes/(store)/account/profile/+page.svelte — banner + username validation
src/routes/(store)/account/+layout.svelte       — custom avatar
src/routes/(store)/+layout.svelte               — Kits nav link
src/routes/(admin)/+layout.svelte               — Drumkits + Users nav links
firebase.rules.json                             — users + kits rules
package.json                                    — +lucide-svelte
```

### No tocar
```
firebase.json
wrangler.jsonc
src/lib/process-shim.ts
```

---

## ⚙️ CONSTRAINTS

- Svelte 5 syntax: `$state`, `$derived`, `$effect`, `$props` (NO `writable` en componentes nuevos)
- 0 TypeScript errors al final
- 228+ tests passing (`npm run test`)
- 0 svelte-check errors/warnings (`npm run check`)
- Usar CSS vars existentes: `--primary`, `--accent`, `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--radius-*`, `--space-*`, `--font-*`, `--text-*`
- R2 uploads: patrón de `src/routes/api/upload/` (verifyFirebaseToken → formData → R2 put)
- Browser test: abrir con `npm run dev`, login anónimo, probar en 375px y 1280px

---

## 🚀 COMO ARRANCAR

```bash
cd storewav
npm install
cp .env.example .env  # si no existe
npm run dev
```

Browser: http://localhost:5173
Login anónimo: http://localhost:5173/login → "🧪 Entrar como tester (anónimo)"
Admin: http://localhost:5173/admin
