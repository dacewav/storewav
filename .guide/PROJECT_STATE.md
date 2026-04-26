# 🧠 PROJECT_STATE.md — Estado Rápido

> **Última actualización: 2026-04-27 05:51 (Session 53 — Contratos + PDF Generator)**

```yaml
proyecto:      dacewav/store (storewav)
repo:          https://github.com/dacewav/storewav.git
framework:     SvelteKit 2 + Cloudflare Workers + Firebase RTDB
firebase:      dacewav-store-3b0f5
firebase_db:   https://dacewav-store-3b0f5-default-rtdb.firebaseio.com
sesiones:      53 (continuar en sesión 54)
tests:         153 passing
build:         0 errors, svelte-check clean (except pre-existing Firebase env vars)
último_commit: "d625a70"

## Quick Status

| Área | Status | Detalle |
|------|--------|---------|
| .env | ✅ | Firebase + Stripe + Resend configurados |
| Cloudflare Pages | ✅ | Env vars configurados via API |
| Build | ✅ | Deploy automático desde Git |
| Firebase rules | ⚠️ | paidOrders .read=true pendiente de deployar (usuario lo hace manual) |
| Cart | ✅ | Store + UI + BeatCard quick-add |
| Checkout | ✅ | Stripe Checkout Session creation |
| Webhook | ✅ | Payment → order → contract PDF → email |
| Email | ✅ | Resend API, dominio dacewav.store verificado |
| Contract PDF | ✅ | **Generador completo con pdf-lib, multi-página, 13-14 cláusulas** |
| Download API | ✅ | Secure endpoint /api/download/[orderId]/[beatId] |
| Orders Page | ✅ | /account/orders — busca por email |
| Cancel Page | ✅ | /checkout/cancel |
| Success Page | ✅ | Download buttons + "Mis órdenes" link |
| Nav | ✅ | Cart + Orders + Wishlist + Theme icons |

## E-Commerce Status

| Feature | Estado | Detalle |
|---------|--------|---------|
| Cart store | ✅ | localStorage persistence |
| Cart page | ✅ | /cart con items, totales, checkout |
| BeatCard add | ✅ | Quick-add button (cheapest license) |
| Beat detail add | ✅ | License selector + add to cart |
| Stripe checkout | ✅ | /api/checkout → Stripe Session |
| Stripe webhook | ✅ | /api/webhook/stripe → order + PDF + email |
| Contract PDF | ✅ | src/lib/contractPdf.ts |
| Email delivery | ✅ | src/lib/email.ts via Resend |
| Secure download | ✅ | /api/download/[orderId]/[beatId] |
| Orders page | ✅ | /account/orders (email lookup) |
| Cancel page | ✅ | /checkout/cancel |
| Success page | ✅ | Download buttons + order info |

## License Prices

| Licencia | MXN | USD | Contrato |
|----------|-----|-----|----------|
| MP3 (Básica) | $350 | $20 | 01-mp3.md |
| WAV (Standard) | $750 | $45 | 02-wav.md |
| Premium (Stems) | $1,500 | $90 | 03-premium.md |
| Ilimitada | $5,000 | $300 | 04-ilimitada.md |
| Exclusiva | Cotizar | Cotizar | 05-exclusiva.md |

## Pendientes conocidos

| Prioridad | Item | Detalle |
|-----------|------|---------|
| 🔴 | Firebase rules deploy | paidOrders .read=true + .indexOn (usuario lo hace manual) |
| 🟡 | Zip packaging | Beat + stems + contrato en un zip |
| 🟡 | R2 signed URLs | Expiring download links |
| 🟡 | Discount codes | Admin CRUD + checkout validation |
| 🟡 | Order history improvement | Customer account page |
| 🟢 | Email templates | Customizable from admin |
| 🟢 | Sales analytics | Revenue dashboard in admin |
| 🟢 | Cart abandoned email | Reminder email |
| 🔴 | Beats sin audio | 11/11 beats sin audioUrl |

## Commands útiles

```bash
cd ~/.openclaw/workspace/storewav

# Build
npm run build

# Dev
npm run dev -- --host 0.0.0.0 --port 5173

# Tests
npm test

# Firebase
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json"

# Stripe test card: 4242 4242 4242 4242
```
