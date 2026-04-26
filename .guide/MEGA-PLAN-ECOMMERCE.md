# 🛒 MEGA-PLAN E-COMMERCE — Fase 1 + Fase 2

> **Creado**: 2026-04-27 (Sesión 53)
> **Objetivo**: E-commerce completo para venta de beats con licencias
> **Stack**: SvelteKit 2 + Firebase RTDB + Cloudflare Pages/Workers + Stripe + Resend

---

## 📋 Estado general

| Área | Estado | Detalle |
|------|--------|---------|
| Cart | ✅ | Store + UI + BeatCard quick-add |
| Checkout | ✅ | Stripe Checkout Session |
| Webhook | ✅ | Payment → order → contract PDF → email |
| Email | ✅ | Resend API, dominio dacewav.store |
| Contract PDF | ✅ | **Generador completo con pdf-lib** |
| Download API | ✅ | /api/download/[orderId]/[beatId] |
| Orders Page | ✅ | /account/orders (email lookup) |
| Contratos .md | ✅ | 5 niveles, precios correctos, legales sólidos |
| Zip packaging | 🔜 | Fase 2 |
| Discount codes | 🔜 | Fase 2 |
| Email templates | 🔜 | Fase 2 |
| Sales analytics | 🔜 | Fase 2 |
| Customer Auth | 🔜 | Fase 3 — Google + Email |
| Profile / Account | 🔜 | Fase 3 |
| Likes / Favorites | 🔜 | Fase 3 |
| Comments | 🔜 | Fase 3 |
| Wishlist sync | 🔜 | Fase 3 |

---

## ✅ FASE 1 — COMPLETADA (Sesiones 51-52)

### E-Commerce Core
- [x] Cart store (localStorage persistence)
- [x] Cart page (/cart con items, totales, checkout)
- [x] BeatCard quick-add button (cheapest license)
- [x] Beat detail license selector + add to cart
- [x] Stripe checkout session creation (/api/checkout)
- [x] Cancel page (/checkout/cancel)
- [x] Success page (download buttons + "Mis órdenes")

### Webhook + Post-Payment
- [x] Stripe webhook → order creation in Firebase
- [x] Contract PDF generation (async, pdf-lib)
- [x] Email delivery via Resend API
- [x] Secure download endpoint (/api/download/[orderId]/[beatId])
- [x] Orders page (/account/orders, email lookup)
- [x] Nav icons (cart + orders + wishlist + theme)

### Contratos de Licencia
- [x] 5 niveles: MP3, WAV, Premium, Ilimitada, Exclusiva
- [x] Precios correctos en todos los contratos
- [x] Formato markdown consistente (04-ilimitada y 05-exclusiva limpiados)
- [x] Headers corregidos (05-exclusiva: removido "NO EXCLUSIVA" contradictorio)

---

## 🔴 GENERADOR DE PDF — IMPLEMENTACIÓN CRÍTICA

> **Archivo**: `src/lib/contractGenerator.ts` (706 líneas)
> **Dependencia**: `pdf-lib` (pure JS, Workers-compatible)
> **Estado**: ✅ Implementado, commit 3a667e7

### Lo que genera
- PDF completo multi-página A4 con todas las cláusulas
- Formato profesional: headers, negritas, tablas de campos, separadores
- Acentos correctos (á, é, í, ó, ú, ñ, ü) via Helvetica
- Número de página + nota de confidencialidad en footer
- Bloque de firma dual (Productor + Artista)

### Configuración por licencia
| Licencia | Streams | Copias | Sync | Stems | Publishing | Master |
|----------|---------|--------|------|-------|------------|--------|
| MP3 | 100K | 2K | ❌ | ❌ | 100% artista | 100% artista |
| WAV | 500K | 5K | ❌ | ❌ | 100% artista | 100% artista |
| Premium | 1M | 10K | ❌ | ✅ | 100% artista | 100% artista |
| Ilimitada | ∞ | ∞ | ✅ | ✅ | 50/50 | 100% artista |
| Exclusiva | ∞ | ∞ | ✅ | ✅ | 50/50 | 70/30 |

### Cláusulas incluidas (13 para no-exclusiva, 14 para exclusiva)
1. Objeto de la licencia / Otorgamiento de derechos exclusivos
2. Tipo de licencia / Obligaciones del productor
3. Derechos y porcentajes / Derechos reservados
4. Créditos obligatorios / Regalías y porcentajes
5. Restricciones / Reconocimiento de licencias anteriores
6. Derechos del productor / Content ID y protección
7. Garantías e indemnidad / Créditos obligatorios
8. Entrega de archivos / Restricciones
9. Pago y condiciones / Garantías
10. Vigencia y terminación / Pago y condiciones
11. Condiciones generales / Duración y terminación
12. Legislación aplicable / Condiciones generales
13. Aceptación / Legislación aplicable
14. (Solo exclusiva) Aceptación y perfeccionamiento

### Campos dinámicos
- `orderId` → No. de contrato (8 chars)
- `buyerName`, `buyerEmail`, `buyerArtist` → datos del artista
- `beatName`, `beatBpm`, `beatKey`, `beatGenre` → datos del beat
- `priceMXN`, `priceUSD` → precio pactado
- `date` → fecha de firma
- `licenseName` → determina toda la configuración del contrato

### Integración
- `contractPdf.ts` → re-exporta de `contractGenerator.ts` (API compatible)
- Webhook (`+server.ts`) → llama `await generateContractPDF()` → adjunta al email
- Base64 conversion segura (sin spread operator para PDFs grandes)

### Testing pendiente
- [ ] Test unitario: genera PDF para cada licencia
- [ ] Test unitario: campos dinámicos se rellenan correctamente
- [ ] Test unitario: exclusiva tiene 14 cláusulas, no-exclusiva 13
- [ ] Test unitario: PDF tiene múltiples páginas (>1 para contratos completos)
- [ ] Test integración: webhook genera PDF y lo adjunta al email

### Mejoras futuras del generador
- [ ] Embed custom font para mejor soporte de caracteres especiales
- [ ] Watermark "COPIA" para versiones no firmadas
- [ ] QR code con link al contrato en Firebase
- [ ] Versión en inglés (dual-language)

---

## 🔜 FASE 2 — E-Commerce Mejoras

### 2.1 Zip Packaging (beat + stems + contrato)
- [ ] Endpoint que genera zip con: beat.mp3/wav + stems + contrato.pdf
- [ ] R2 binding para acceder a los archivos
- [ ] Zip streaming (sin descargar todo a memoria)
- [ ] Descarga única desde success page y orders page

### 2.2 Discount Codes
- [ ] Admin page: CRUD de códigos de descuento
- [ ] Campos: código, tipo (% o fijo), monto, usos máximos, expiración, licencias aplicables
- [ ] Validación en checkout API
- [ ] Aplicación del descuento en el total
- [ ] Registro de usos en Firebase

### 2.3 Email Templates Customizables
- [ ] Admin page para editar templates de email
- [ ] Variables: {{buyerName}}, {{beatName}}, {{downloadUrl}}, etc.
- [ ] Preview en tiempo real
- [ ] Templates: confirmación de compra, descarga, recordatorio

### 2.4 Sales Analytics Dashboard
- [ ] Revenue total (MXN + USD)
- [ ] Ventas por licencia (gráfico)
- [ ] Ventas por período (diario/semanal/mensual)
- [ ] Top beats vendidos
- [ ] Mapa de ventas por país
- [ ] Export CSV

---

## 🔜 EDITOR DE CONTRATOS — Estilo BeatStars

> **Objetivo**: Editor de contratos en el admin para personalizar texto, variables, y preview en vivo.
> **Prioridad**: Alta — sesión 55
> **Base**: Ya existe `/admin/contracts` con generador de PDF + preview

### Flujo del editor

```
/admin/contracts/editor
├── Selector de licencia (MP3/WAV/Premium/Ilimitada/Exclusiva)
├── Editor de texto (textarea grande con syntax highlighting)
│   ├── Variables auto-completadas: {{buyerName}}, {{beatName}}, etc.
│   └── Preview de variables resaltadas en tiempo real
├── Panel de variables disponibles (sidebar)
├── Preview del PDF en vivo (iframe o canvas)
├── Botón guardar → persiste en Firebase
└── Botón reset → vuelve al texto original del .md
```

### Variables disponibles

#### Datos del comprador
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{buyerName}}` | Nombre completo | Juan Pérez |
| `{{buyerEmail}}` | Email | juan@email.com |
| `{{buyerArtist}}` | Nombre artístico | JP |
| `{{buyerInstagram}}` | Instagram | @jp |
| `{{buyerPhone}}` | Teléfono | +52 1234567890 |
| `{{buyerCountry}}` | País | México |

#### Datos del beat
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{beatName}}` | Nombre del beat | Midnight Dreams |
| `{{beatBpm}}` | BPM | 140 |
| `{{beatKey}}` | Tonalidad | Am |
| `{{beatGenre}}` | Género | Trap |
| `{{beatFormat}}` | Formato entregado | MP3 / WAV + MP3 / Todos |

#### Datos del contrato
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{orderId}}` | Número de contrato | ABC12345 |
| `{{date}}` | Fecha de firma | 27 de abril de 2026 |
| `{{priceMXN}}` | Precio MXN | $1,500 |
| `{{priceUSD}}` | Precio USD | $90 |
| `{{licenseName}}` | Tipo de licencia | Premium |
| `{{streams}}` | Límite de streams | Hasta 1,000,000 |
| `{{copies}}` | Límite de copias | Hasta 10,000 |

#### Datos del productor
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{producerName}}` | Nombre completo | Daniel Antonio Cebrero Escalante |
| `{{producerArtist}}` | Nombre artístico | Dace |
| `{{producerEmail}}` | Email | dace.wav.negocios@gmail.com |
| `{{producerInstagram}}` | Instagram | dace.wav |
| `{{producerCity}}` | Ciudad | Heroica Puebla de Zaragoza |
| `{{producerCountry}}` | País | México |

#### Datos del pago
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{paymentMethod}}` | Método de pago | Stripe |
| `{{transactionId}}` | ID de transacción | pi_abc123... |
| `{{paidAt}}` | Fecha de pago | 27/04/2026 14:30 |

### Implementación

#### Archivos nuevos
| Archivo | Propósito |
|---------|-----------|
| `src/routes/(admin)/admin/contracts/editor/+page.svelte` | Editor principal |
| `src/routes/(admin)/admin/contracts/editor/+page.ts` | Load contract template |
| `src/lib/stores/contractTemplates.ts` | Store de templates custom en Firebase |

#### Firebase RTDB
```json
{
  "contractTemplates": {
    "01-mp3": {
      "text": "El PRODUCTOR otorga al ARTISTA...",
      "updatedAt": 1711500000000,
      "updatedBy": "admin"
    },
    "02-wav": { ... },
    "03-premium": { ... },
    "04-ilimitada": { ... },
    "05-exclusiva": { ... }
  }
}
```

#### Flujo
1. Admin abre `/admin/contracts/editor`
2. Selecciona licencia → carga template desde Firebase (o fallback al .md original)
3. Editor muestra texto con variables resaltadas
4. Admin edita texto, agrega/quita cláusulas
5. Preview se actualiza en vivo
6. Guardar → persiste en Firebase
7. Reset → vuelve al texto original del .md

---

## 🔜 FASE 3 — Cuenta de Cliente + Social

> **Objetivo**: Convertir visitantes en comunidad. Login de cliente, perfil, likes, comentarios, wishlist persistente.
> **Prioridad**: Alta — aumenta retención, engagement y datos de usuarios.
> **UI**: Minimalista, oscura, consistente con la estética YUGEN. Sin sobrecarga visual.

---

### 3.1 Auth de Cliente (Google + Email)

> El login actual (`/login`) es solo para admin. Necesitamos login para compradores.

#### Flujo
```
Visitante → Click "Iniciar sesión" → Google One Tap / Email
  → Cuenta creada en Firebase Auth
  → Perfil básico (nombre, email, avatar)
  → Redirect a la página anterior (no a /admin)
```

#### Implementación
- [ ] **Botón en nav** — avatar genérico → dropdown con "Iniciar sesión" / "Mi perfil"
- [ ] **Google One Tap** — usar GIS (Google Identity Services) directo, sin popup/redirect de Firebase. COOP-safe.
- [ ] **Email link (passwordless)** — alternativa sin contraseña. El usuario pone email → recibe link → logueado.
- [ ] **Persistencia de sesión** — `onAuthStateChanged` ya existe, solo falta diferenciar admin vs cliente
- [ ] **Redirect inteligente** — después de login, volver a donde estaba (catálogo, beat detail, etc.)

#### Archivos nuevos
| Archivo | Propósito |
|---------|-----------|
| `src/lib/stores/auth.ts` | Extender: detectar si es admin o cliente |
| `src/routes/(store)/account/+layout.svelte` | Layout de sección de cuenta |
| `src/routes/(store)/account/+page.svelte` | Perfil del cliente |
| `src/routes/(store)/account/orders/+page.svelte` | Ya existe — vincular a uid en vez de email |
| `src/lib/components/AuthButton.svelte` | Botón de login/avatar en nav |

#### Datos en Firebase RTDB
```json
{
  "users/{uid}": {
    "email": "artista@email.com",
    "displayName": "Artista Name",
    "photoURL": "https://...",
    "createdAt": 1711500000000,
    "artistName": "Mi Nombre Artístico",
    "country": "MX",
    "socials": {
      "instagram": "@artista",
      "youtube": "ArtistaOficial",
      "spotify": "..."
    }
  }
}
```

---

### 3.2 Perfil de Cliente (`/account`)

> Página central del comprador. Simple, funcional, sin bloat.

#### Layout
```
┌─────────────────────────────────────────────┐
│  Avatar  │  Nombre Artístico                │
│  ───────  │  artista@email.com              │
│           │  🇲🇽 México · Miembro desde 2026 │
├─────────────────────────────────────────────┤
│  [Perfil] [Órdenes] [Wishlist] [Favoritos]  │
├─────────────────────────────────────────────┤
│                                              │
│  Contenido del tab seleccionado              │
│                                              │
└─────────────────────────────────────────────┘
```

#### Tabs
| Tab | Contenido |
|-----|-----------|
| **Perfil** | Editar nombre artístico, avatar, redes sociales, país |
| **Órdenes** | Historial de compras con descargas, contratos, fecha |
| **Wishlist** | Beats guardados (sync con Firebase, no solo localStorage) |
| **Favoritos** | Likes dados a beats (ver sección 3.3) |

#### Implementación
- [ ] `/account` — página principal con tabs
- [ ] `/account/profile` — editar datos del perfil
- [ ] `/account/orders` — ya existe, adaptar para uid-authenticated
- [ ] `/account/wishlist` — migrar de localStorage a Firebase sync
- [ ] `/account/favorites` — beats con like del usuario
- [ ] **Avatar upload** — a R2 con crop simple, o usar foto de Google
- [ ] **Settings** — preferencias de email (marketing on/off), idioma, moneda

---

### 3.3 Likes / Favoritos ❤️

> El like es la señal social más simple. Un click, un dato, un efecto.

#### UX
```
BeatCard:
  ┌──────────────────────────┐
  │  🎵 Beat Title           │
  │  BPM · Key · Genre       │
  │  ┌────┐                  │
  │  │ ▶  │  $350  ❤️ 24     │ ← corazon con contador
  │  └────┘                  │
  └──────────────────────────┘

BeatDetail:
  ❤️ 24 likes · Guardar en wishlist ♡
```

#### Comportamiento
- Click ❤️ → toggle (like / unlike)
- Si no está logueado → animación suave + tooltip "Iniciá sesión para guardar"
- Contador público en BeatCard y BeatDetail
- Feed de "más likeados" en catálogo (ordenar por likes)

#### Datos en Firebase RTDB
```json
{
  "beatLikes/{beatId}/{uid}": true,
  "userLikes/{uid}/{beatId}": true,
  "beats/{beatId}/likeCount": 24
}
```

#### Implementación
- [ ] Store `likes.ts` — toggle, subscribe, count
- [ ] Componente `LikeButton.svelte` — animación heart burst
- [ ] Integración en `BeatCard.svelte` y `BeatDetail`
- [ ] Admin: ver top beats por likes en analytics
- [ ] Ordenar catálogo por "más populares"

---

### 3.4 Comentarios 💬

> Comentarios en beats. Simple, sin hilo (flat), moderación básica.

#### UX
```
BeatDetail — debajo del player:

  💬 Comentarios (3)

  ┌─────────────────────────────────────────┐
  │  🟢 Artista1 · hace 2 días              │
  │  ¡Este beat está increíble! Necesito    │
  │  la licencia Premium 🔥                  │
  │                          ❤️ 5  · Responder│
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │  🟢 Artista2 · hace 5 días              │
  │  ¿Cuándo sale con stems?                │
  │                          ❤️ 2  · Responder│
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │  Escribe un comentario...               │
  │  [🎤 Enviar]                            │
  └─────────────────────────────────────────┘
```

#### Reglas
- Solo usuarios logueados pueden comentar
- Un comentario por usuario por beat (evitar spam)
- Máximo 500 caracteres
- El admin puede eliminar cualquier comentario
- El autor puede editar/eliminar el suyo
- Rate limit: 1 comentario cada 30 segundos

#### Datos en Firebase RTDB
```json
{
  "beatComments/{beatId}/{commentId}": {
    "uid": "user123",
    "displayName": "Artista1",
    "photoURL": "https://...",
    "text": "¡Este beat está increíble!",
    "createdAt": 1711500000000,
    "editedAt": null,
    "likes": 5
  }
}
```

#### Implementación
- [ ] Store `comments.ts` — CRUD, subscribe by beatId
- [ ] Componente `CommentSection.svelte` — lista + input
- [ ] Componente `Comment.svelte` — avatar, texto, acciones
- [ ] Firebase rules: auth required, owner can edit/delete
- [ ] Admin: panel de moderación (ver, eliminar, ban user)
- [ ] Sanitización de texto (XSS-safe, sin HTML)

---

### 3.5 Wishlist Persistente ♡

> La wishlist actual es localStorage. Con login, se sync con Firebase.

#### Comportamiento
- **Sin login**: wishlist en localStorage (como ahora)
- **Con login**: wishlist se sync a Firebase automáticamente
- **Merge**: al hacer login por primera vez, merge localStorage + Firebase
- **Cross-device**: wishlist disponible en cualquier dispositivo logueado

#### Datos en Firebase RTDB
```json
{
  "userWishlist/{uid}/{beatId}": {
    "addedAt": 1711500000000
  }
}
```

#### Implementación
- [ ] Migrar store de localStorage a Firebase-backed
- [ ] Fallback localStorage cuando no hay login
- [ ] Merge strategy: unión (nunca borrar)
- [ ] UI: ♡ → ♥ con animación al agregar/quitar
- [ ] Wishlist page con grid de beats guardados

---

### 3.6 Ideas a Futuro 🚀

> Features que valen la pena pero no son prioritarios ahora.

#### Social
- [ ] **Playlists de usuarios** — "Mis beats favoritos", "Beats para el próximo proyecto"
- [ ] **Compartir en redes** — botón de compartir beat con preview link
- [ ] **Feed de actividad** — "Artista1 compró Premium de este beat"
- [ ] **Notificaciones** — "El beat que guardaste tiene descuento"
- [ ] **Sistema de seguidores** — seguir a dacewav para notificaciones de nuevos beats

#### Comunidad
- [ ] **Rating / Estrellas** — 1-5 estrellas por beat (además de likes)
- [ ] **Tags de usuario** — "Trap", "Lo-Fi", "Drill" como filtros colaborativos
- [ ] **Featured comments** — admin puede destacar un comentario
- [ ] **Badge de comprador** — "Compró 5+ beats" → badge especial en perfil

#### Product
- [ ] **Historial de escucha** — "Escuchados recientemente" (localStorage + Firebase)
- [ ] **Recomendaciones** — "Basado en lo que escuchaste" (simple: mismo género/bpm)
- [ ] **Página de artistas** — perfil público de compradores que lo permitan
- [ ] **Código de referido** — descuento por invitar amigos
- [ ] **Newsletter integrada** — "Nuevos beats esta semana" automática

#### Gamificación
- [ ] **Nivel de comprador** — Bronze (1 compra) → Silver (3) → Gold (5) → Platinum (10+)
- [ ] **Descuentos por fidelidad** — % off según nivel
- [ ] **Early access** — nuevos beats disponibles primero para Gold+
- [ ] **Logros** — "Primera compra", "5 beats", "Compartió 3 veces"

---

### 3.7 Firebase Rules — Fase 3

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    },
    "beatLikes": {
      "$beatId": {
        "$uid": {
          ".read": true,
          ".write": "auth !== null && auth.uid === $uid"
        }
      }
    },
    "userLikes": {
      "$uid": {
        ".read": "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    },
    "beatComments": {
      "$beatId": {
        ".read": true,
        "$commentId": {
          ".write": "auth !== null && (auth.uid === data.child('uid').val() || root.child('adminWhitelist/approved').child(auth.uid).exists())"
        }
      }
    },
    "userWishlist": {
      "$uid": {
        ".read": "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    }
  }
}
```

---

### 3.8 Archivos — Fase 3

| Archivo | Propósito |
|---------|-----------|
| `src/lib/stores/auth.ts` | Extender: admin vs cliente, perfil |
| `src/lib/stores/likes.ts` | Store de likes/favoritos |
| `src/lib/stores/comments.ts` | Store de comentarios |
| `src/lib/stores/wishlist.ts` | Wishlist con Firebase sync |
| `src/lib/stores/profile.ts` | Perfil de usuario |
| `src/lib/components/AuthButton.svelte` | Login/avatar en nav |
| `src/lib/components/LikeButton.svelte` | Botón ❤️ con animación |
| `src/lib/components/CommentSection.svelte` | Sección de comentarios |
| `src/lib/components/CommentCard.svelte` | Card de comentario individual |
| `src/lib/components/UserAvatar.svelte` | Avatar reutilizable |
| `src/routes/(store)/account/+layout.svelte` | Layout de cuenta |
| `src/routes/(store)/account/+page.svelte` | Dashboard de cuenta |
| `src/routes/(store)/account/profile/+page.svelte` | Editar perfil |
| `src/routes/(store)/account/favorites/+page.svelte` | Beats con like |
| `src/routes/(store)/account/wishlist/+page.svelte` | Wishlist sincronizada |
| `src/routes/(store)/account/orders/+page.svelte` | Adaptar para uid |

---

## 🔧 Contratos — Mejoras Legales Aplicadas

| Mejora | Commit | Detalle |
|--------|--------|---------|
| Precios correctos | 779d3aa | MP3 $350/$19.99, WAV $700/$39.99, Premium $1,400/$74.99, Ilimitada $2,500/$149.99 |
| Formato markdown limpio | 779d3aa | 04-ilimitada y 05-exclusiva convertidos de Word export |
| Header exclusiva | d20fbdb | Removido "NO EXCLUSIVA" contradictorio |
| Definición "Nueva Canción" | b918401 | Definida formalmente en Cláusula I |
| Jurisdicción Puebla | b918401 | Especificada en vez de vago "estado indicado" |
| Notificaciones email | b918401 | Canal legal definido, WhatsApp como informativo |
| Confidencialidad | b918401 | Solo términos económicos (antes todo el contrato) |
| Crédito: dónde aparecer | 742709d | Metadatos + descripción de video |
| Remix = misma canción | 742709d | Versiones, remixes, acústicas no requieren nueva licencia |
| Chargeback auto-revocación | 742709d | Licencia se revoca automáticamente |
| Whitelist condicionada | 742709d | Se activa solo cuando artista proporciona link |

---

## 📁 Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/contractGenerator.ts` | **Generador de PDF completo (pdf-lib)** |
| `src/lib/contractPdf.ts` | Re-exporta de contractGenerator (compatibilidad) |
| `src/lib/email.ts` | Envío de emails via Resend |
| `src/routes/api/webhook/stripe/+server.ts` | Webhook de Stripe post-pago |
| `src/routes/api/download/[orderId]/[beatId]/+server.ts` | Descarga segura de beats |
| `src/routes/(store)/cart/+page.svelte` | Página del carrito |
| `src/routes/(store)/checkout/cancel/+page.svelte` | Página de cancelación |
| `src/routes/(store)/checkout/success/+page.svelte` | Página de éxito con descargas |
| `src/routes/(store)/account/orders/+page.svelte` | Historial de órdenes |
| `contracts/*.md` | Templates de contrato (5 niveles) |
| `contracts/*.pdf` | PDFs estáticos de referencia |
| `firebase.rules.json` | Reglas de Firebase (paidOrders .read=true) |

---

*Última actualización: 2026-04-27 05:51 (Sesión 53)*
