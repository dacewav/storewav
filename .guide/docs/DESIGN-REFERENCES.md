# 🎨 Design References — DACEWAV.STORE

> Reglas anti-slop y guías de diseño para este proyecto.
> Consultar ANTES de diseñar cualquier componente.

---

## Dirección Estética

- **Dirección:** Retro-futurista / Neon-dark — oscuro profundo con acentos neón que brillan
- **Paleta:** bg `#0a0a0a`, surface `#111`/`#161616`, accent `#00ff88` (neón verde), text `#fff`/`#888`
- **Fonts:** Syne (display), Space Grotesk (body), DM Mono (code/datos)
- **Diferenciador:** El glow neón + efectos de audio visual (waveform, partículas)

## Anti-Slop Rules

### ❌ NUNCA usar
- Inter, Roboto, Arial, system fonts
- Purple gradients on white backgrounds
- Emojis como iconos de UI (usar SVG: Lucide, Heroicons)
- Layouts genéricos SaaS sin carácter
- Hover states que escalan y rompen layout

### ✅ SIEMPRE usar
- SVG icons (Lucide preferido)
- CSS variables para todo (tokens)
- `cursor-pointer` en elementos interactivos
- Contraste mínimo 4.5:1 (accesibilidad)
- Transiciones suaves 150-300ms
- Responsive: 320px, 768px, 1024px, 1440px

## Motion Guidelines

- Staggered reveals en page load (animation-delay)
- CSS-only cuando sea posible
- Duración: fast 150ms, normal 300ms
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (--ease-out)
- Glow effects neón en hover/focus

## Spatial Composition

- Generous negative space para respiración
- Grid de cards asimétrico en hero
- Overlap sutil entre elementos
- Diagonal/flow en secciones de transición

## Pre-Delivery Checklist

- [ ] No emojis como iconos (SVG only)
- [ ] Typography es characterful (Syne/Space Grotesk/DM Mono)
- [ ] Color scheme usa tokens CSS, no hardcodeados
- [ ] Hover states son estables (color/opacity/shadow, no scale)
- [ ] cursor-pointer en interactivos
- [ ] Contraste 4.5:1 mínimo
- [ ] Responsive en todos los breakpoints
- [ ] No horizontal scroll en móvil
- [ ] npm run build pasa

---

*Basado en: Anthropic frontend-design skill + anti-slop guidelines*
