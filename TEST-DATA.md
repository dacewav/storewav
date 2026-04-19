# 🧪 TEST-DATA.md — Datos de Prueba

> Para testear, la IA necesita datos. Estos son los fixtures que se usan.
> La IA los crea en Firebase o en archivos locales para testing.

---

## Beat de prueba (para Firebase)

```json
{
  "title": "Test Beat — Midnight",
  "artist": "DACEWAV",
  "bpm": 140,
  "key": "Cm",
  "genre": "Trap",
  "tags": ["dark", "hard", "test"],
  "coverUrl": "https://placehold.co/400x400/0a0a0a/00ff88?text=TEST",
  "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "licenses": {
    "basic": 29.99,
    "premium": 79.99,
    "unlimited": 149.99,
    "exclusive": 499.99
  },
  "contract": "Standard license agreement...",
  "createdAt": 1713484800000,
  "active": true
}
```

> `audioUrl` usa SoundHelix — audio gratuito real que funciona para testing.

## Settings de prueba (para Firebase)

```json
{
  "theme": {
    "accentColor": "#00ff88",
    "bgColor": "#0a0a0a",
    "bgSecondary": "#111111",
    "bgCard": "#161616",
    "textColor": "#ffffff",
    "textSecondary": "#888888",
    "fontDisplay": "Syne",
    "fontBody": "Space Grotesk",
    "borderRadius": 12,
    "mode": "dark"
  },
  "hero": {
    "title": "DACEWAV",
    "subtitle": "Beats que rompen",
    "bgImage": "https://placehold.co/1920x1080/0a0a0a/00ff88?text=HERO",
    "bgVideo": null,
    "animation": "fade-in"
  },
  "layout": {
    "headerStyle": "floating",
    "cardsPerRow": 3,
    "showWishlist": true,
    "showBlog": false,
    "showDrumkits": true
  },
  "links": [
    { "label": "Instagram", "url": "https://instagram.com/dace.wav", "icon": "instagram" },
    { "label": "YouTube", "url": "https://youtube.com/@dacewav", "icon": "youtube" },
    { "label": "BeatStars", "url": "https://beatstars.com/dacewav", "icon": "music" }
  ],
  "brand": {
    "logo": "https://placehold.co/200x60/0a0a0a/00ff88?text=DACEWAV",
    "favicon": "https://placehold.co/32x32/0a0a0a/00ff88?text=D"
  }
}
```

---

## Seeds múltiples (para testing de filtros)

```bash
# Crear 5 beats de prueba con géneros diferentes
# Ejecutar en consola del navegador con Firebase conectado

import { ref, set } from 'firebase/database';
import { db } from './src/lib/firebase';

const testBeats = [
  { id: 'test-trap-1', title: 'Dark Trap', genre: 'Trap', bpm: 140, key: 'Cm' },
  { id: 'test-drill-1', title: 'UK Drill', genre: 'Drill', bpm: 145, key: 'Dm' },
  { id: 'test-boom-1', title: 'Boom Bap Classic', genre: 'Boom Bap', bpm: 90, key: 'Am' },
  { id: 'test-rnb-1', title: 'Smooth R&B', genre: 'R&B', bpm: 85, key: 'Gm' },
  { id: 'test-lofi-1', title: 'Lo-fi Chill', genre: 'Lo-fi', bpm: 75, key: 'Em' },
];

for (const beat of testBeats) {
  await set(ref(db, `beats/${beat.id}`), {
    ...beat,
    artist: 'DACEWAV',
    coverUrl: `https://placehold.co/400x400/0a0a0a/00ff88?text=${beat.genre}`,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    licenses: { basic: 29.99, premium: 79.99, unlimited: 149.99, exclusive: 499.99 },
    tags: ['test', beat.genre.toLowerCase()],
    createdAt: Date.now(),
    active: true,
  });
}
console.log('✅ 5 beats de prueba creados');
```

---

## Placeholder images

| Uso | URL |
|-----|-----|
| Cover art (400x400) | `https://placehold.co/400x400/0a0a0a/00ff88?text=BEAT` |
| Hero bg (1920x1080) | `https://placehold.co/1920x1080/0a0a0a/00ff88?text=HERO` |
| Logo (200x60) | `https://placehold.co/200x60/0a0a0a/00ff88?text=DACEWAV` |
| Avatar (100x100) | `https://placehold.co/100x100/0a0a0a/00ff88?text=D` |

> Placehold.co genera imágenes con los colores del proyecto. Perfecto para testing.

## Audio de prueba

| Fuente | URL | Notas |
|--------|-----|-------|
| SoundHelix | `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3` | Gratuito, funciona siempre |
| SoundHelix (variado) | Cambiar el número: `SoundHelix-Song-2.mp3`, `Song-3`, etc. | 16 tracks disponibles |

---

## Uso

Cuando la IA necesite testear algo que requiere datos:
1. Crear el beat/settings de prueba en Firebase
2. Verificar que la UI los muestra
3. Hacer las pruebas
4. Limpiar datos de prueba después (si es necesario)
