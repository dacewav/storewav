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
