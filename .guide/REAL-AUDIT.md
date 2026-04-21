# 🔍 REAL AUDIT — 2026-04-22 04:00

> **Honest assessment after deploy testing.**
> Previous audits were code-only (no data). This one tests against live Firebase.

---

## Problema Raíz

El código y Firebase tienen **estructuras completamente distintas**:

| Código lee (new) | Firebase tiene (old) | ¿Match? |
|---|---|---|
| `settings.hero.title` | `settings.heroTitle` (EMPTY) | ❌ |
| `settings.hero.subtitle` | `settings.heroSubtitle` (EMPTY) | ❌ |
| `settings.hero.eyebrow` | `theme.heroEyebrow` | ❌ path |
| `settings.hero.glowWord` | — | ❌ |
| `settings.heroVisual.glowOn` | `theme.heroGlowOn` | ❌ path |
| `settings.section.dividerTitle` | `settings.dividerTitle` | ❌ nested |
| `settings.cta.title` | — | ❌ |
| `settings.brand.name` | `settings.siteName` ('YUGEN') | ❌ key |
| `settings.brand.logo` | `theme.logoUrl` | ❌ path |
| `settings.brand.whatsapp` | `settings.whatsapp` | ❌ key |
| `settings.banner.enabled` | `settings.bannerActive` | ❌ key |
| `settings.banner.text` | `settings.bannerText` | ❌ key |
| `settings.links` | — | ❌ |
| `settings.loader` | — | ❌ |
| `settings.cardStyle` | `settings.globalCardStyle` | ❌ key |
| `settings.animations` | `theme.animLogo, animCards...` | ❌ path |
| `settings.labels` | — | ❌ |
| `beats/*` | `null` | ❌ empty |
| `admins/*` | `adminWhitelist/{email}` | ❌ path |

**Solo 4 paths matchean:** `theme.accent`, `theme.glowColor`, `theme.fontBody`, `theme.fontDisplay`

---

## Estado Real del Deploy

### Store (tienda pública)
- ✅ Hero: renderiza con defaults ('DACEWAV', 'rompen.') pero NO lee datos reales
- ❌ Banner: no se muestra (lee `settings.banner.enabled` pero Firebase tiene `bannerActive`)
- ❌ CTA: no se muestra (lee `settings.cta.title` — no existe)
- ❌ Testimonials: no se muestran (estructura diferente)
- ❌ Beats: no hay ninguno en Firebase
- ❌ Links del hero: no hay (lee `settings.links`)
- ❌ Divider: no se muestra (lee `settings.section.dividerTitle` pero Firebase tiene `dividerTitle` flat)
- ✅ Logo: theme engine lee `theme.logoUrl` correctamente
- ✅ Fonts: theme engine lee `theme.fontBody/fontDisplay` correctamente
- ✅ Accent color: theme engine lee `theme.accent` correctamente

### Admin
- ✅ Auth: fixeado para leer `adminWhitelist/{email}`
- ⚠️ Settings editors: escriben a paths nuevos que no existen en Firebase
- ❌ Los editores no muestran los valores actuales (porque leen paths nuevos)

---

## Qué Necesita la Tienda para Funcionar

### Prioridad 0: Que se vea (CRÍTICO)
1. Hero lea `settings.heroTitle` o `theme.heroTitleCustom`
2. Banner lea `settings.bannerActive`, `settings.bannerText`
3. Divider lea `settings.dividerTitle`, `settings.dividerSub`
4. Brand lea `settings.siteName`
5. WhatsApp lea `settings.whatsapp`
6. Testimonials lea `settings.testimonials`
7. CardStyle lea `settings.globalCardStyle`

### Prioridad 1: Que funcione
8. Beats en Firebase (seed)
9. Admin editors muestren valores actuales
10. Admin editors escriban a paths correctos

### Prioridad 2: Que esté completa
11. CTA section
12. Hero links
13. Loader
14. Labels editables

---

## Plan de Ejecución

### BLOQUE 0: Data Layer Fix
- Adaptar settings store para leer estructura vieja (flat) + nueva (nested)
- Priority: leer de donde estén los datos reales
- Admin editors: mostrar datos actuales + escribir a paths correctos

### BLOQUE 1: Store Visual Fix
- Hero: mostrar título real, eyebrow, glow word
- Banner: mostrar si está activo
- Divider: mostrar título y subtítulo
- Footer: mostrar nombre de marca real

### BLOQUE 2: Beats
- Seed de beats de ejemplo
- Que el grid muestre cards reales
- Play/wishlist/filter funcionando

### BLOQUE 3: Effects & Polish
- Cursor glow, orbs, scroll progress
- Card effects (glow, animation, shimmer)
- Animaciones del hero

### BLOQUE 4: Admin
- Editors muestren datos actuales
- Cambios se reflejen en la tienda
- CRUD de beats funcional

### BLOQUE 5: Final Audit
- Todo funcionando end-to-end
- Deploy test
