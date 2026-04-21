# 🔍 SEO.md — Estrategia SEO

> catalog ya tiene OG tags y meta. El nuevo store necesita una estrategia completa.

---

## Checklist SEO (por página)

### Página principal (/)
- [ ] `<title>` descriptivo: "DACEWAV — Beats Originales | Trap · R&B · Drill"
- [ ] `<meta name="description">` con keywords
- [ ] `<meta property="og:...">` completo (title, desc, image, url, type)
- [ ] `<meta name="twitter:card">` summary_large_image
- [ ] `<link rel="canonical">` apuntando a la URL correcta
- [ ] `<meta name="robots">` index, follow
- [ ] `<link rel="sitemap">` pointing to /sitemap.xml
- [ ] Structured data (JSON-LD) para MusicGroup o WebSite
- [ ] SSR renderizado (SvelteKit lo hace automáticamente)

### Página de beat (/beat/[id])
- [ ] `<title>` dinámico: "Beat Name — DACEWAV"
- [ ] `<meta name="description">` con BPM, key, género
- [ ] OG dinámico con cover art del beat
- [ ] Structured data (JSON-LD) para MusicRecording
- [ ] `<link rel="canonical">` único por beat

### Admin (/admin/*)
- [ ] `<meta name="robots">` noindex, nofollow (NO indexar admin)

---

## Archivos necesarios

### robots.txt (static/robots.txt)
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://dacewav.store/sitemap.xml
```

### sitemap.xml (generado dinámicamente o estático)

```typescript
// src/routes/sitemap.xml/+server.ts
import { ref, get } from 'firebase/database';
import { db } from '$lib/firebase';

export async function GET() {
  const snap = await get(ref(db, 'beats'));
  const beats = Object.entries(snap.val() || {});

  const urls = [
    { loc: 'https://dacewav.store/', priority: '1.0' },
    ...beats.map(([id]) => ({
      loc: `https://dacewav.store/beat/${id}`,
      priority: '0.8'
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

### Structured data (JSON-LD)

```svelte
<!-- En +layout.svelte o +page.svelte -->
<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": "DACEWAV",
    "url": "https://dacewav.store",
    "genre": ["Trap", "R&B", "Drill"],
    "location": { "@type": "Place", "name": "Puebla, MX" }
  })}</script>`}
</svelte:head>
```

---

## OG Image dinámica

Para cada beat, la OG image debe ser:
- 1200x630px
- Cover art del beat + título + "DACEWAV"
- Generar con Cloudflare Workers o Vercel OG Image Generation

O más simple: usar la cover art directamente como og:image.

---

## Keywords objetivo

| Keyword | Dificultad | Volumen aprox |
|---------|-----------|---------------|
| beats originales | Media | Medio |
| beats trap | Alta | Alto |
| comprar beats online | Alta | Alto |
| beats baratos México | Baja | Bajo |
| beats R&B | Media | Medio |
| productor beats Puebla | Muy baja | Muy bajo |
| beats Drill | Media | Medio |

---

## Verificación

| Check | Herramienta |
|-------|------------|
| OG tags | https://opengraph.xyz |
| Structured data | https://search.google.com/test/rich-results |
| Sitemap | https://dacewav.store/sitemap.xml |
| Robots | https://dacewav.store/robots.txt |
| Lighthouse SEO | Chrome DevTools → Lighthouse → SEO ≥ 90 |
