# 🚀 MEGA PROMPT — YUGEN STORE REDESIGN & IMPROVEMENTS

Usa este prompt con MIMO Claw para transformar la tienda.

---

## CONTEXTO

Estás trabajando en **YUGEN STORE** (dacewav.store), una tienda online de beats musicales construida con:
- **Stack**: SvelteKit + Firebase + Cloudflare Pages + Stripe
- **Repo**: https://github.com/dacewav/storewav
- **Design System**: CSS Variables en `src/app.css` (1211 líneas), temas dark/light
- **Fonts**: Syne (display), Space Grotesk (body), DM Mono (mono)
- **Color accent**: `#dc2626` (rojo)
- **Componentes**: 50+ componentes Svelte en `src/lib/components/`
- **Admin**: Panel completo en `/admin` con 20+ secciones

La tienda tiene una base técnica excelente pero necesita **polish visual, contenido, y features** para verse profesional.

---

## TAREA 1: FIX BEAT DETAIL PAGE (CRÍTICO)

El beat detail page (`/beat/[id]`) no carga — muestra "Beat no encontrado".

**Archivo**: `src/routes/(store)/beat/[id]/+page.svelte`

**Problema**: La función `getBeatSlug()` genera slugs que no coinciden con la URL. Cuando un usuario hace click en un BeatCard, el slug generado no se encuentra en el lookup.

**Fix requerido**:
1. Revisar `src/lib/slug.ts` — asegurar que `getBeatSlug(beat)` produce slugs consistentes
2. En `+page.svelte`, el lookup debe intentar: slug match → ID match → partial match
3. Agregar loading skeleton mientras se resuelve el beat
4. Si el beat no existe después de cargar, mostrar sugerencias de beats similares

```typescript
// En +page.svelte, mejorar el lookup:
let beat = $derived.by(() => {
    const param = page.params.id;
    // 1. Try exact slug
    const bySlug = allBeats.find(b => getBeatSlug(b) === param);
    if (bySlug) return bySlug;
    // 2. Try ID
    const byId = allBeats.find(b => b.id === param);
    if (byId) return byId;
    // 3. Try partial match (for old URLs)
    const byPartial = allBeats.find(b => 
        b.id.includes(param) || param.includes(b.id)
    );
    return byPartial ?? null;
});
```

---

## TAREA 2: MEJORAR HERO SECTION

**Archivo**: `src/routes/(store)/+page.svelte`

El hero necesita más impacto visual. Implementar:

### 2a. Video/animación de fondo
```svelte
<!-- Agregar después del ::before del hero -->
{#if heroVideoUrl}
<video 
    class="hero-video" 
    autoplay muted loop playsinline
    src={heroVideoUrl}
></video>
{/if}
```

```css
.hero-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
}
```

### 2b. Stats condicionales
```svelte
<!-- Solo mostrar stats si hay suficiente contenido -->
{#if beats.length >= 3}
<div class="hero-stats">
    <!-- stats actuales -->
</div>
{:else}
<div class="hero-coming-soon">
    <span class="coming-soon-badge">🔥 Próximamente más beats</span>
</div>
{/if}
```

### 2c. Glow word con efecto de typing
```css
.glow-word {
    display: inline-block;
    position: relative;
    background: linear-gradient(135deg, var(--accent), #ff6b6b, var(--accent));
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 3s ease infinite;
}

.glow-word::after {
    content: attr(data-t);
    position: absolute;
    inset: 0;
    color: inherit;
    filter: blur(calc(var(--hw-blur, 10) * 1px));
    opacity: var(--hw-op, 0.35);
    pointer-events: none;
    background: linear-gradient(135deg, var(--accent), #ff6b6b);
    -webkit-background-clip: text;
    background-clip: text;
}
```

---

## TAREA 3: BEATCARD — MEJORAS VISUALES

**Archivo**: `src/lib/components/BeatCard.svelte`

### 3a. Play button siempre visible (con opacidad)
```css
/* Cambiar de opacity: 0 a opacity: 0.3 en estado base */
.beat-play {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.85);
}

.beat-card:hover .beat-play {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
}
```

### 3b. Efecto shine/sweep en hover
```css
.beat-card-inner::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.05),
        transparent
    );
    z-index: 5;
    pointer-events: none;
    transition: left 0.6s ease;
}

.beat-card:hover .beat-card-inner::before {
    left: 100%;
}
```

### 3c. Efecto 3D tilt mejorado con brillo
Agregar al componente (después del `use:tilt`):
```svelte
<div 
    class="beat-card"
    use:tilt={{ max: 8, scale: 1.02 }}
    onmousemove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    }}
>
```

```css
.beat-card-inner::after {
    /* Agregar spotlight que sigue al cursor */
    background: radial-gradient(
        circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.06) 0%,
        transparent 50%
    );
}
```

### 3d. Now playing indicator mejorado
```css
.now-playing-indicator {
    /* Agregar glow */
    filter: drop-shadow(0 0 4px var(--accent));
}

.eq-bar {
    /* Hacer las barras más dinámicas */
    animation: eqBounce 0.6s ease-in-out infinite alternate;
}
```

---

## TAREA 4: NAVBAR — TOOLTIPS Y BADGES

**Archivo**: `src/routes/(store)/+layout.svelte`

### 4a. Tooltips visibles en hover
```css
.icon-btn {
    position: relative;
}

.icon-btn::after {
    content: attr(title);
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-secondary);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 10;
}

.icon-btn:hover::after {
    opacity: 1;
}
```

### 4b. Badge de notificaciones con animación
```css
.nav-badge {
    animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Agregar pulso cuando hay notificaciones nuevas */
.nav-badge.pulse {
    animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
               badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0); }
}
```

---

## TAREA 5: FOOTER COMPLETO

**Archivo**: `src/routes/(store)/+layout.svelte`

Reemplazar el footer actual con:

```svelte
<footer class="footer">
    <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-col">
            <div class="footer-brand">
                {#if brandSplit.last}
                    {brandSplit.first}<em>{brandSplit.last}</em>
                {:else}
                    {brandName}<em>.</em>
                {/if}
            </div>
            <p class="footer-desc">{metaDesc}</p>
            <div class="footer-social">
                <a href="https://instagram.com/dace.wav" target="_blank" rel="noopener" aria-label="Instagram">
                    <Icon name="instagram" size={18} />
                </a>
                <a href="https://wa.me/527551492054" target="_blank" rel="noopener" aria-label="WhatsApp">
                    <Icon name="whatsapp" size={18} />
                </a>
            </div>
        </div>
        
        <!-- Tienda -->
        <div class="footer-col">
            <h4 class="footer-heading">Tienda</h4>
            <a href="/#beats">Catálogo</a>
            <a href="/kits">Drumkits</a>
            <a href="/cart">Carrito</a>
        </div>
        
        <!-- Soporte -->
        <div class="footer-col">
            <h4 class="footer-heading">Soporte</h4>
            <a href="https://wa.me/527551492054" target="_blank">WhatsApp</a>
            <a href="/faq">Preguntas frecuentes</a>
            <a href="/about">Sobre nosotros</a>
        </div>
        
        <!-- Legal -->
        <div class="footer-col">
            <h4 class="footer-heading">Legal</h4>
            <a href="/terms">Términos de uso</a>
            <a href="/privacy">Privacidad</a>
            <a href="/licenses-info">Info de licencias</a>
        </div>
    </div>
    
    <div class="footer-bottom">
        <span>{footerText} · {new Date().getFullYear()}</span>
        <span class="footer-powered">Hecho con ❤️ en Puebla, MX</span>
    </div>
</footer>
```

```css
.footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: var(--space-8);
    margin-bottom: var(--space-8);
}

.footer-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.footer-heading {
    font-family: var(--font-mono);
    font-size: var(--text-2xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: var(--space-2);
}

.footer-col a {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    transition: color 0.2s;
}

.footer-col a:hover {
    color: var(--accent);
}

.footer-social {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-2);
}

.footer-social a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    transition: all 0.2s;
}

.footer-social a:hover {
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-2px);
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-4);
    border-top: 1px solid var(--border);
    font-size: var(--text-2xs);
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .footer-grid {
        grid-template-columns: 1fr 1fr;
    }
    .footer-bottom {
        flex-direction: column;
        gap: var(--space-2);
        text-align: center;
    }
}
```

---

## TAREA 6: LOADER CON LOGO ANIMADO

**Archivo**: `src/routes/(store)/+layout.svelte`

```svelte
{#if loaderEnabled && loaderVisible}
<div id="loader" class:fading={loaderFading}>
    <div class="loader-content">
        <div class="loader-logo">
            {#if brandLogo && !logoFailed}
                <img src={brandLogo} alt={brandName} class="loader-logo-img" />
            {:else}
                <span class="loader-brand">{brandName}</span>
            {/if}
        </div>
        <div class="loader-wave">
            {#each Array(5) as _, i}
                <span class="loader-bar" style="--delay: {i * 0.15}s"></span>
            {/each}
        </div>
    </div>
</div>
{/if}
```

```css
.loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
}

.loader-logo-img {
    height: 40px;
    width: auto;
    animation: loaderPulse 2s ease-in-out infinite;
}

.loader-brand {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
}

.loader-brand em {
    color: var(--accent);
    font-style: normal;
}

.loader-wave {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 20px;
}

.loader-bar {
    width: 3px;
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    animation: loaderWave 1s ease-in-out var(--delay) infinite alternate;
}

@keyframes loaderWave {
    0% { height: 20%; }
    100% { height: 100%; }
}

@keyframes loaderPulse {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
}
```

---

## TAREA 7: SCROLL ANIMATIONS — MÁS VARIANTES

**Archivo**: `src/lib/actions.ts`

Agregar nuevas variantes de reveal:

```typescript
export function revealLeft(node: HTMLElement, opts = {}) {
    // Similar a reveal pero desde la izquierda
    return reveal(node, { ...opts, direction: 'left' });
}

export function revealRight(node: HTMLElement, opts = {}) {
    return reveal(node, { ...opts, direction: 'right' });
}

export function revealScale(node: HTMLElement, opts = {}) {
    return reveal(node, { ...opts, direction: 'scale' });
}
```

En `app.css`:
```css
.reveal-left {
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.6s var(--ease-in-out);
}

.reveal-left.vis {
    opacity: 1;
    transform: none;
}

.reveal-right {
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.6s var(--ease-in-out);
}

.reveal-right.vis {
    opacity: 1;
    transform: none;
}

.reveal-scale {
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.6s var(--ease-in-out);
}

.reveal-scale.vis {
    opacity: 1;
    transform: none;
}
```

---

## TAREA 8: ADMIN SIDEBAR — ICONOS CONSISTENTES

**Archivo**: `src/routes/(admin)/+layout.svelte`

Reemplazar emojis con iconos Lucide:

```typescript
import { 
    LayoutDashboard, Music, Image, MessageSquare, Drum,
    Home, Sparkles, Palette, Wand2, Layers, Building2,
    BarChart3, Users, User, Tag, FileText, Edit3,
    Mail, Bell, Zap, Smile
} from 'lucide-svelte/icons';

const navGroups = [
    {
        label: 'Tienda',
        items: [
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Ctrl+D' },
            { href: '/admin/beats', label: 'Beats', icon: Music, shortcut: 'Ctrl+B' },
            { href: '/admin/media', label: 'Media', icon: Image },
            { href: '/admin/testimonials', label: 'Testimonios', icon: MessageSquare },
            { href: '/admin/kits', label: 'Drumkits', icon: Drum },
        ]
    },
    // ... etc
];
```

En el template:
```svelte
<a href={item.href} class="si" class:active={isActive}>
    <span class="si-icon">
        <svelte:component this={item.icon} size={16} />
    </span>
    <span class="si-label">{item.label}</span>
</a>
```

---

## TAREA 9: PÁGINA "ABOUT / SOBRE NOSOTROS"

Crear `src/routes/(store)/about/+page.svelte`:

```svelte
<script lang="ts">
    import { settings } from '$lib/stores';
    import { InlineEmoji } from '$lib/components';
    
    let s = $derived($settings.data);
    let brandName = $derived(s?.brand?.name ?? 'YUGEN');
</script>

<svelte:head>
    <title>Sobre {brandName}</title>
</svelte:head>

<div class="about-page">
    <section class="about-hero">
        <h1>Sobre {brandName}</h1>
        <p class="about-sub">Productor musical desde Puebla, MX</p>
    </section>
    
    <section class="about-content">
        <div class="about-text">
            <p>
                Hola! Soy el creador detrás de {brandName}. 
                Me apasiona crear beats únicos que ayuden a artistas 
                a llevar su música al siguiente nivel.
            </p>
            <p>
                Cada beat es producido con atención al detalle, 
                buscando sonidos frescos y contemporáneos que se 
                adapten a diferentes estilos y géneros.
            </p>
        </div>
        
        <div class="about-highlights">
            <div class="highlight">
                <span class="highlight-icon">🎵</span>
                <span class="highlight-num">{s?.beats?.length ?? 0}+</span>
                <span class="highlight-label">Beats producidos</span>
            </div>
            <div class="highlight">
                <span class="highlight-icon">🌎</span>
                <span class="highlight-num">Global</span>
                <span class="highlight-label">Clientes en todo el mundo</span>
            </div>
            <div class="highlight">
                <span class="highlight-icon">🔥</span>
                <span class="highlight-num">Premium</span>
                <span class="highlight-label">Calidad garantizada</span>
            </div>
        </div>
    </section>
    
    <section class="about-cta">
        <h2>¿Listo para trabajar juntos?</h2>
        <a href="https://wa.me/{s?.brand?.whatsapp ?? ''}" class="cta-btn" target="_blank">
            Escríbenos por WhatsApp
        </a>
    </section>
</div>
```

---

## TAREA 10: PÁGINA FAQ

Crear `src/routes/(store)/faq/+page.svelte`:

Implementar con componente `Collapsible` (ya existe en el proyecto):

```svelte
<script lang="ts">
    import { Collapsible } from '$lib/components';
    
    const faqs = [
        {
            q: '¿Qué incluye la compra de un beat?',
            a: 'Al comprar un beat recibes los archivos de audio en alta calidad (WAV + MP3), un contrato de licencia, y derechos según el tipo de licencia adquirida.'
        },
        {
            q: '¿Puedo usar el beat en Spotify/Apple Music?',
            a: 'Sí, nuestras licencias Premium y Unlimited incluyen distribución en plataformas digitales como Spotify, Apple Music, YouTube Music, etc.'
        },
        {
            q: '¿El beat será exclusivo para mí?',
            a: 'Solo la licencia Exclusive garantiza exclusividad total. Las demás licencias permiten que el beat sea vendido a otros artistas.'
        },
        {
            q: '¿Puedo hacer cambios al beat?',
            a: 'Sí, puedes solicitar ajustes menores (cambios de tempo, remoción de elementos) contactándonos por WhatsApp.'
        },
        {
            q: '¿Cómo recibo mi compra?',
            a: 'Después del pago, recibirás un email con los links de descarga. También puedes acceder desde "Mis órdenes" en tu cuenta.'
        },
        {
            q: '¿Aceptan pagos en MXN?',
            a: 'Sí, aceptamos pagos en pesos mexicanos (MXN) y dólares (USD) a través de Stripe.'
        }
    ];
</script>

<div class="faq-page">
    <h1>Preguntas frecuentes</h1>
    <p class="faq-sub">Todo lo que necesitas saber sobre nuestros beats y licencias.</p>
    
    <div class="faq-list">
        {#each faqs as faq}
            <Collapsible title={faq.q}>
                <p>{faq.a}</p>
            </Collapsible>
        {/each}
    </div>
</div>
```

---

## TAREA 11: SHARE BUTTONS POR PLATAFORMA

**Archivo**: `src/routes/(store)/beat/[id]/+page.svelte`

Agregar después del botón de compartir actual:

```svelte
<div class="share-buttons">
    <a 
        href="https://wa.me/?text={encodeURIComponent(`${beat.name} — ${brandName}\n${window.location.href}`)}" 
        target="_blank" 
        class="share-btn whatsapp"
        aria-label="Compartir en WhatsApp"
    >
        <Icon name="whatsapp" size={16} />
        <span>WhatsApp</span>
    </a>
    <a 
        href="https://twitter.com/intent/tweet?text={encodeURIComponent(`🎵 ${beat.name} by ${beat.artist ?? brandName}`)}&url={encodeURIComponent(window.location.href)}" 
        target="_blank" 
        class="share-btn twitter"
        aria-label="Compartir en Twitter"
    >
        <Icon name="twitter" size={16} />
        <span>Twitter</span>
    </a>
    <button 
        class="share-btn copy"
        onclick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast.show('Link copiado');
        }}
        aria-label="Copiar link"
    >
        <Icon name="link" size={16} />
        <span>Copiar</span>
    </button>
</div>
```

```css
.share-buttons {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
}

.share-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all 0.2s;
    min-height: 36px;
}

.share-btn:hover {
    transform: translateY(-1px);
}

.share-btn.whatsapp:hover {
    border-color: #25D366;
    color: #25D366;
    background: rgba(37, 211, 102, 0.08);
}

.share-btn.twitter:hover {
    border-color: #1DA1F2;
    color: #1DA1F2;
    background: rgba(29, 161, 242, 0.08);
}

.share-btn.copy:hover {
    border-color: var(--accent);
    color: var(--accent);
}
```

---

## TAREA 12: CURSOR GLOW MÁS VISIBLE

**Archivo**: `src/app.css`

```css
/* Cambiar opacidad de 0.06 a 0.12 */
#cursor-glow {
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%);
}

/* Agregar un segundo glow más sutil */
#cursor-glow::after {
    content: '';
    position: absolute;
    inset: 50px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 60%);
}
```

---

## TAREA 13: GLASSMORPHISM CARDS OPTION

**Archivo**: `src/lib/cardStyleEngine.ts`

Agregar opción de glassmorphism al card style engine:

```typescript
// En mergeCardStyles, agregar:
if (config.glassmorphism) {
    return {
        ...base,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    };
}
```

En `app.css`:
```css
.beat-card.glassmorphism .beat-card-inner {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## TAREA 14: PWA SUPPORT

Crear `static/manifest.json`:
```json
{
    "name": "YUGEN STORE",
    "short_name": "YUGEN",
    "description": "Beats profesionales para tu próximo hit",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#060404",
    "theme_color": "#dc2626",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

En `src/app.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#dc2626">
<link rel="apple-touch-icon" href="/icon-192.png">
```

---

## TAREA 15: ADMIN DASHBOARD — MEJORAS

**Archivo**: `src/routes/(admin)/admin/+page.svelte`

### 15a. Revenue chart (si hay datos de Stripe)
```svelte
{#if revenueData.length > 0}
<Card>
    <div class="card-section">
        <h3 class="section-label">💰 Ingresos (últimos 30 días)</h3>
        <div class="revenue-chart">
            {#each revenueData as day}
                <div class="revenue-bar" style="height: {(day.amount / maxRevenue) * 100}%">
                    <span class="revenue-tooltip">${day.amount}</span>
                </div>
            {/each}
        </div>
    </div>
</Card>
{/if}
```

### 15b. Quick stats con tendencias
```svelte
<div class="stat-card">
    <div class="stat-icon">{stat.icon}</div>
    <div class="stat-info">
        <div class="stat-value">{stat.value}</div>
        <div class="stat-label">{stat.label}</div>
        {#if stat.trend}
            <div class="stat-trend" class:up={stat.trend > 0} class:down={stat.trend < 0}>
                {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
            </div>
        {/if}
    </div>
</div>
```

---

## TAREA 16: MODULARIZAR CSS

Dividir `src/app.css` en:

1. **`src/styles/variables.css`** — Solo variables CSS
2. **`src/styles/animations.css`** — Todas las keyframes
3. **`src/styles/utilities.css`** — Clases utilitarias
4. **`src/styles/base.css`** — Reset y estilos base
5. **`src/styles/components.css`** — Estilos de componentes compartidos

En `app.css`:
```css
@import './styles/variables.css';
@import './styles/base.css';
@import './styles/animations.css';
@import './styles/utilities.css';
@import './styles/components.css';
```

---

## TAREA 17: EXTRAER COMPONENTES DEL LAYOUT

**Archivo**: `src/routes/(store)/+layout.svelte` (1406 líneas)

Extraer a componentes separados:

1. **`src/lib/components/StoreNav.svelte`** — Toda la navegación
2. **`src/lib/components/MobileMenu.svelte`** — Menú mobile
3. **`src/lib/components/StoreLoader.svelte`** — Loader
4. **`src/lib/components/ScrollProgress.svelte`** — Barra de progreso
5. **`src/lib/components/CursorGlow.svelte`** — Glow del cursor
6. **`src/lib/components/Orbs.svelte`** — Floating orbs

---

## TAREA 18: OG IMAGE REAL

Crear una imagen OG (1200x630px) con:
- Logo de YUGEN
- Tagline "Beats que rompen"
- Color de fondo oscuro con acento rojo
- URL del sitio

Guardar en `static/og-image.png` y actualizar referencias en `+layout.svelte`.

---

## TAREA 19: BEAT CARD — INDICADOR DE LICENCIAS

Agregar badge mostrando cuántas licencias tiene cada beat:

```svelte
{#if beat.licenses?.length > 0}
<span class="beat-licenses-badge">
    {beat.licenses.length} licencias
</span>
{/if}
```

```css
.beat-licenses-badge {
    position: absolute;
    top: var(--space-3);
    left: var(--space-3);
    font-family: var(--font-mono);
    font-size: 9px;
    padding: 2px 6px;
    border-radius: var(--radius-full);
    background: var(--overlay-bg);
    backdrop-filter: blur(8px);
    color: var(--text-secondary);
    z-index: 2;
}
```

---

## TAREA 20: TESTIMONIOS — MEJORAR DISEÑO

**Archivo**: `src/lib/components/Testimonials.svelte`

Agregar:
- Avatar con borde de gradiente
- Rating con estrellas
- Animación de entrada staggered
- Carousel auto-scroll

---

## CHECKLIST DE IMPLEMENTACIÓN

- [ ] T1: Fix beat detail page URLs
- [ ] T2: Hero improvements (video, conditional stats, glow)
- [ ] T3: BeatCard visual improvements (play visible, shine, 3D)
- [ ] T4: Navbar tooltips and badges
- [ ] T5: Complete footer
- [ ] T6: Animated loader
- [ ] T7: More scroll animation variants
- [ ] T8: Admin sidebar icons
- [ ] T9: About page
- [ ] T10: FAQ page
- [ ] T11: Share buttons by platform
- [ ] T12: More visible cursor glow
- [ ] T13: Glassmorphism cards option
- [ ] T14: PWA support
- [ ] T15: Admin dashboard improvements
- [ ] T16: Modularize CSS
- [ ] T17: Extract layout components
- [ ] T18: Real OG image
- [ ] T19: License badge on cards
- [ ] T20: Testimonials redesign

---

*Prompt generado automáticamente — YUGEN STORE Audit 2026*
