# 🏗️ MEGA-REBUILD-PLAN.md — Porting Completo Catalog → Store

> **Creado: 2026-04-26 04:47 (GMT+8)**
> **Objetivo**: Portar TODAS las features del catalog v5.2 que faltan en el store
> **Metodología**: 1 bloque por chat (~50 min), verificar admin→store flow en cada uno
> **Total estimado**: 8-10 sesiones

---

## 🔑 PREREQUISITO (antes de Session 1)

### .env con credenciales reales

El `.env` está vacío. Sin credenciales no corre `npm run dev`.

**Acción**: El usuario debe copiar su `.env` real (con `PUBLIC_FIREBASE_*` llenos) al workspace:
```bash
cp /ruta/a/tu/.env.real ~/.openclaw/workspace/storewav/.env
```

O pegar las credenciales directamente. Las vars necesarias:
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_DATABASE_URL`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_ADMIN_UIDS`

### Verificación de entorno (al inicio de CADA sesión)

```bash
cd ~/.openclaw/workspace/storewav
# 1. Verificar .env tiene valores
grep "PUBLIC_FIREBASE_API_KEY=" .env | head -1  # debe tener valor

# 2. Verificar build
npm run build 2>&1 | tail -3

# 3. Verificar tests
npm test 2>&1 | tail -5

# 4. Verificar Firebase live
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Settings: {len(d)} keys')"

# 5. Iniciar dev server (background)
npm run dev -- --host 0.0.0.0 --port 5173 &
sleep 3

# 6. Verificar que arranca
curl -s http://localhost:5173 | head -5
```

### Login persistente entre sesiones

Firebase Auth persiste en el browser del usuario (no en el servidor).
- **Cada sesión nueva**: el usuario abre `http://localhost:5173/login` en su browser
- **Login anónimo**: click "🧪 Entrar como tester (anónimo)" → acceso admin
- **Si el browser mantiene la sesión**: no necesita re-login

**Para verificar admin→store flow en cada sesión:**
1. Abrir `http://localhost:5173/admin` (admin panel)
2. Abrir `http://localhost:5173/` en otra pestaña (store)
3. Hacer un cambio en admin → verificar que se refleja en store
4. O usar el preview split (Ctrl+P) dentro del admin

---

## 📋 INVENTARIO — Features a portar

### 🔴 CRÍTICOS (Session 1-2)

| # | Feature | Catalog líneas | Complejidad | Sesión |
|---|---------|---------------|-------------|--------|
| 1 | Theme presets (save/load) | 195 | Media | 1 |
| 2 | Soft delete/restore (trash) | 183 | Media | 1 |
| 3 | Floating elements | 148 | Media | 2 |
| 4 | Scroll-aware nav | ~30 | Baja | 2 |

### 🟡 IMPORTANTES (Session 3-5)

| # | Feature | Catalog líneas | Complejidad | Sesión |
|---|---------|---------------|-------------|--------|
| 5 | Cursor glow effect | ~40 | Baja | 3 |
| 6 | Scroll progress bar | ~20 | Baja | 3 |
| 7 | Image gallery | 301 | Alta | 4 |
| 8 | Beat presets (card style presets) | 274 | Media | 5 |

### ⚪ POLISH (Session 6-8)

| # | Feature | Catalog líneas | Complejidad | Sesión |
|---|---------|---------------|-------------|--------|
| 9 | QR generator | ~50 | Baja | 6 |
| 10 | Feature toggles | ~40 | Baja | 6 |
| 11 | Changelog | ~60 | Baja | 6 |
| 12 | Custom emojis | ~80 | Baja | 7 |
| 13 | Preview resize panel | ~40 | Baja | 7 |
| 14 | Dead code cleanup | — | Baja | 8 |
| 15 | Final audit + guide update | — | Baja | 8 |

---

## 📅 SESIONES

### Session 1 — Theme Presets + Soft Delete
**Tiempo**: ~50 min | **Prioridad**: 🔴 CRÍTICO

#### Bloque A: Theme Presets (save/load)
**Qué**: Guardar y cargar configuraciones completas de tema

**Archivos a crear/modificar:**
- `src/lib/stores/themePresets.ts` (NUEVO)
- `src/routes/(admin)/admin/theme/+page.svelte` (agregar sección presets)
- `src/lib/components/ThemePresetCard.svelte` (NUEVO)

**Tareas:**
1. Crear store `themePresets`:
   - `presets`: array de `{ id, name, theme: ThemeSettings, createdAt }`
   - `savePreset(name)`: captura theme actual → guarda en Firebase `themePresets/`
   - `loadPreset(id)`: aplica theme del preset al theme actual
   - `deletePreset(id)`: elimina preset
   - `renamePreset(id, newName)`: renombra
2. UI en theme page:
   - Sección "Presets" al final de la página
   - Botón "Guardar preset actual" → modal con nombre
   - Grid de presets guardados con preview de colores
   - Click para aplicar, botón para eliminar
3. Persistencia en Firebase: `themePresets/` path
4. Export/import: presets incluidos en backup

**Verificación admin→store:**
- Guardar preset con tema actual
- Cambiar tema
- Cargar preset → verificar que store refleja el cambio

#### Bloque B: Soft Delete / Restore
**Qué**: Beats van a "trash" en vez de eliminarse permanentemente

**Archivos a modificar:**
- `src/lib/stores/beats.ts` (agregar campo `deleted`, función `trashBeat`, `restoreBeat`, `permanentDelete`)
- `src/routes/(admin)/admin/beats/+page.svelte` (agregar tab "Trash")
- `src/routes/(store)/+page.svelte` (filtrar beats deleted)

**Tareas:**
1. Agregar campo `deleted: boolean` y `deletedAt: string` al schema Beat
2. `trashBeat(id)`: set `deleted: true, deletedAt: Date.now()`
3. `restoreBeat(id)`: set `deleted: false`, limpiar deletedAt
4. `permanentDelete(id)`: delete real de Firebase
5. Store page: filtrar `deleted !== true`
6. Admin beats page: tab "Trash" con lista de beats eliminados
7. Botón "Restaurar" y "Eliminar permanentemente" (con confirmación)
8. Auto-purge: beats en trash > 30 días se eliminan automáticamente

**Verificación admin→store:**
- Eliminar un beat → no aparece en store
- Ir a trash → restaurar beat → aparece en store de nuevo
- Eliminar permanentemente → desaparece de trash

**Commit + push al final de sesión**

---

### Session 2 — Floating Elements + Scroll-aware Nav
**Tiempo**: ~50 min | **Prioridad**: 🔴 CRÍTICO

#### Bloque A: Floating Elements
**Qué**: Imágenes/texto posicionados libremente sobre la tienda

**Archivos a crear/modificar:**
- `src/lib/stores/floating.ts` (NUEVO)
- `src/lib/components/FloatingElement.svelte` (NUEVO)
- `src/routes/(admin)/admin/floating/+page.svelte` (NUEVO)
- `src/routes/(store)/+layout.svelte` (render floating elements)

**Tareas:**
1. Store `floating`:
   - `elements`: array de `{ id, type: 'image'|'text', content, x, y, width, height, opacity, zIndex, rotation, animation }`
   - CRUD operations
2. Componente `FloatingElement`:
   - Renderiza imagen o texto con position absolute
   - Responsive: escala en mobile
3. Admin page:
   - Lista de elementos con drag para reposicionar
   - Editor: content, position (x/y sliders), size, opacity, animation
   - Preview en vivo
4. Store layout: render elementos sobre el contenido

**Verificación admin→store:**
- Crear elemento floating → aparece en store
- Mover posición → se actualiza en store
- Eliminar → desaparece de store

#### Bloque B: Scroll-aware Nav
**Qué**: Nav se oculta al scrollear hacia abajo, aparece al scrollear hacia arriba

**Archivos a modificar:**
- `src/routes/(store)/+layout.svelte` (agregar scroll listener)

**Tareas:**
1. `scrollY` state con `$state`
2. `lastScrollY` para detectar dirección
3. Clase `nav-hidden` cuando scroll down > 100px
4. Transición suave (transform: translateY(-100%))
5. Siempre visible cuando mobile menu está abierto
6. No ocultar si hay scroll en admin

**Verificación admin→store:**
- Scroll down en store → nav desaparece
- Scroll up → nav aparece
- Admin no afectado

**Commit + push**

---

### Session 3 — Cursor Glow + Scroll Progress
**Tiempo**: ~50 min | **Prioridad**: 🟡 IMPORTANTE

#### Bloque A: Cursor Glow
**Qué**: Efecto glow que sigue el cursor del mouse

**Archivos a crear/modificar:**
- `src/lib/actions.ts` (agregar `cursorGlow` action)
- `src/routes/(store)/+layout.svelte` (aplicar action)

**Tareas:**
1. Action `cursorGlow`:
   - Crea div position:fixed con radial-gradient
   - `mousemove` listener con lerp (factor 0.08)
   - Color: accent con opacidad baja
   - Respeta `prefers-reduced-motion`
2. Configurable desde theme: `cursorGlowOn`, `cursorGlowSize`, `cursorGlowColor`
3. Admin controls en theme page
4. Performance: throttle a requestAnimationFrame

**Verificación admin→store:**
- Activar cursor glow en admin → se ve en store
- Cambiar color → se actualiza
- Desactivar → desaparece

#### Bloque B: Scroll Progress Bar
**Qué**: Barra fina (2px) en el top que muestra progreso de scroll

**Archivos a crear/modificar:**
- `src/routes/(store)/+layout.svelte` (agregar barra)

**Tareas:**
1. `scrollY` / `(docHeight - winHeight)` → porcentaje
2. Barra position:fixed, top:0, width = porcentaje%
3. Color: accent
4. z-index alto
5. Configurable: `scrollProgressOn` desde theme
6. Admin control en theme page

**Verificación admin→store:**
- Activar → barra visible en store
- Scrollear → barra crece
- Desactivar → desaparece

**Commit + push**

---

### Session 4 — Image Gallery
**Tiempo**: ~50 min | **Prioridad**: 🟡 IMPORTANTE

#### Bloque A: Media Manager / Gallery
**Qué**: Subir y gestionar imágenes (covers de beats, gallery)

**Archivos a crear/modificar:**
- `src/lib/stores/gallery.ts` (NUEVO)
- `src/lib/components/MediaGrid.svelte` (NUEVO)
- `src/routes/(admin)/admin/media/+page.svelte` (NUEVO)
- `src/routes/(admin)/+layout.svelte` (agregar "Media" al nav)

**Tareas:**
1. Store `gallery`:
   - `images`: array de `{ id, url, name, size, uploadedAt, usedIn }`
   - Upload a Firebase Storage
   - Delete de Storage
   - List/search/filter
2. MediaGrid component:
   - Grid de thumbnails
   - Click para seleccionar
   - Botón de eliminar
   - Info: nombre, tamaño, fecha
3. Admin page:
   - Upload zone (drag & drop)
   - Grid de imágenes
   - Search por nombre
   - Asociar a beat (select beat → set imageUrl)
4. Beat editor: integrar MediaGrid como image picker

**Verificación admin→store:**
- Subir imagen → aparece en gallery
- Asociar a beat → beat muestra cover en store
- Eliminar imagen → beat muestra placeholder

**Commit + push**

---

### Session 5 — Beat Card Style Presets
**Tiempo**: ~50 min | **Prioridad**: 🟡 IMPORTANTE

#### Bloque A: Card Style Presets
**Qué**: Presets predefinidos de estilo de card (neon, minimal, glass, etc.)

**Archivos a crear/modificar:**
- `src/lib/cardStylePresets.ts` (NUEVO)
- `src/lib/components/CardStyleEditor.svelte` (agregar sección presets)
- `src/routes/(admin)/admin/cardstyle/+page.svelte` (agregar presets)

**Tareas:**
1. Definir presets:
   - `default`: limpio, sin efectos
   - `neon`: glow + saturate + border neon
   - `glass`: blur + opacity + border sutil
   - `retro`: sepia + border grueso + shadow
   - `cinema`: dark + shadow intensa + scale hover
   - `glitch`: animation glitch + hue-rotate
   - `minimal`: sin glow, borde fino, hover sutil
   - `bold`: sombra fuerte, border accent, scale
2. UI en CardStyleEditor:
   - Grid de presets con mini-preview
   - Click para aplicar
   - "Guardar como preset" (custom)
3. Per-beat: select preset en beat editor
4. Firebase: `cardStylePresets/` path

**Verificación admin→store:**
- Seleccionar preset "neon" → cards en store cambian
- Guardar custom preset → aparece en lista
- Aplicar a beat individual → solo ese beat cambia

**Commit + push**

---

### Session 6 — QR + Feature Toggles + Changelog
**Tiempo**: ~50 min | **Prioridad**: ⚪ POLISH

#### Bloque A: QR Generator
**Qué**: Generar QR para compartir beats

**Tareas:**
1. Librería: `qrcode` npm package (o generar SVG con canvas)
2. Componente `QRCode.svelte`
3. En beat page: botón "Compartir" → genera QR con URL del beat
4. En admin beats: QR en la lista (exportable)

#### Bloque B: Feature Toggles
**Qué**: On/off por feature desde admin

**Tareas:**
1. Store: `features` con keys como `wishlist`, `testimonials`, `particles`, `banner`
2. Admin page: toggles para cada feature
3. Store: condicionalmente renderizar según toggle

#### Bloque C: Changelog
**Qué**: Log de cambios en el admin

**Tareas:**
1. Store: `changelog` array de `{ date, action, field, oldValue, newValue }`
2. Cada `updateField` registra entrada
3. Admin page: lista de cambios recientes
4. Filtro por fecha, campo, acción

**Verificación + commit + push**

---

### Session 7 — Custom Emojis + Preview Resize
**Tiempo**: ~50 min | **Prioridad**: ⚪ POLISH

#### Bloque A: Custom Emojis
**Qué**: Emojis personalizados para usar en contenido

**Tareas:**
1. Store: `customEmojis` array de `{ id, name, url }`
2. Admin page: upload + manage
3. Content editor: emoji picker con custom emojis
4. Store: render emojis en contenido

#### Bloque B: Preview Resize
**Qué**: Panel de preview redimensionable (drag divider)

**Tareas:**
1. Admin layout: divider draggable entre content y preview
2. Guardar preferencia de tamaño en localStorage
3. Min/max width constraints

**Verificación + commit + push**

---

### Session 8 — Cleanup + Final Audit
**Tiempo**: ~50 min | **Prioridad**: ⚪ POLISH

#### Bloque A: Dead Code Cleanup
**Qué**: Eliminar código no usado

**Tareas:**
1. `actions.ts`: eliminar `ripple` (no usado)
2. `cardStyleEngine.ts`: eliminar `cardHoverClass`, `cardHoverCSS` (no usados)
3. Verificar que no hay imports rotos
4. svelte-check: 0 errors

#### Bloque B: Final Audit
**Qué**: Auditoría final completa

**Tareas:**
1. Recorrer TODOS los controles del admin
2. Verificar que cada uno afecta la store
3. Verificar Firebase data
4. Actualizar .guide/ con estado final
5. Actualizar PROJECT_STATE.md
6. Push final

---

## 🔍 VERIFICACIÓN ADMIN→STORE (Protocolo por sesión)

Al inicio de cada sesión, verificar que el entorno funciona:

```bash
# 1. Dev server corriendo
curl -s http://localhost:5173 | grep -c "storewav\|dacewav"  # debe ser > 0

# 2. Firebase conectado
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'OK: {len(d)} keys')"

# 3. Build limpio
npm run build 2>&1 | tail -2  # debe decir "built in"
```

Al final de cada sesión, el flujo de verificación:

1. **Hacer cambio en admin** (ej: cambiar accent color)
2. **Verificar en Firebase** (curl o preview panel)
3. **Verificar en store** (abrir tienda, ver cambio)
4. **Si no se refleja**: debug → fix → re-verificar
5. **Commit + push** solo después de verificación exitosa

---

## 📊 Tracking

| Sesión | Features | Estado | Commit |
|--------|----------|--------|--------|
| 1 | Theme presets + Soft delete | ⬜ | — |
| 2 | Floating elements + Scroll nav | ⬜ | — |
| 3 | Cursor glow + Scroll progress | ⬜ | — |
| 4 | Image gallery | ⬜ | — |
| 5 | Beat card style presets | ⬜ | — |
| 6 | QR + Feature toggles + Changelog | ⬜ | — |
| 7 | Custom emojis + Preview resize | ⬜ | — |
| 8 | Cleanup + Final audit | ⬜ | — |

---

*Plan por OpenClaw — 2026-04-26*
