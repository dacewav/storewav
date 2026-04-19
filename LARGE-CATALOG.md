# 🏗️ LARGE-CATALOG.md — Manejo de Catálogos Grandes

> catalog tiene ~20-50 beats. ¿Qué pasa con 200? 500? 1000?
> La tienda DEBE escalar sin volverse lenta.

---

## Problemas de escala

| Beats | Problema potencial |
|-------|-------------------|
| 50 | Todo funciona bien |
| 200 | Grid renderiza 200 cards → lento en móvil |
| 500 | Firebase descarga ~500 objetos → lento, mucha memoria |
| 1000 | El DOM tiene 1000+ nodos → scroll lento, memoria alta |

## Soluciones por nivel

### Nivel 1: < 100 beats (tu caso actual)

**Nada especial.** Renderizar todo. Firebase aguanta.

### Nivel 2: 100-500 beats

```typescript
// Paginación en Firebase
import { ref, query, limitToLast, orderByChild, startAfter } from 'firebase/database';

const PAGE_SIZE = 20;

// Primera carga: últimos 20 beats
const firstPage = query(
  ref(db, 'beats'),
  orderByChild('order'),
  limitToLast(PAGE_SIZE)
);

// Siguiente página: cargar 20 más
const nextPage = query(
  ref(db, 'beats'),
  orderByChild('order'),
  endAt(lastOrderValue),
  limitToLast(PAGE_SIZE + 1) // +1 porque endAt es inclusivo
);
```

### Nivel 3: 500+ beats

```typescript
// Virtual scrolling — solo renderizar los que están visibles
// Usar svelte-virtual-list o similar

import VirtualList from 'svelte-virtual-list';

<VirtualList items={filteredBeats} let:item height="600px">
  <BeatCard beat={item} />
</VirtualList>
```

### Nivel 4: 1000+ beats (futuro)

```typescript
// Server-side search + filtering
// Mover lógica de filtros a Cloudflare Functions
// Firebase se usa solo como storage, no para queries complejas

// GET /api/beats?genre=Trap&bpm_min=120&bpm_max=160&page=2
```

---

## Para tu caso actual (v1)

```
No necesitas virtual scrolling ni paginación todavía.
Pero sí necesitas:

1. Lazy loading de imágenes (ya planeado)
2. limitToFirst() en la query de Firebase (si >100 beats)
3. Skeleton cards mientras carga
4. Filtros que trabajan sobre el array en memoria (no re-queries Firebase)
5. Debounce en búsqueda (ya planeado)
```

---

## Estructura de Firebase optimizada para queries

```
beats/
  {beatId}/
    name: string          ← searchable
    genre: string         ← filterable
    bpm: number           ← filterable
    key: string           ← filterable
    tags: string[]        ← filterable
    order: number         ← sortable
    createdAt: number     ← sortable
    active: boolean       ← solo beats activos

# Índices (en Firebase rules):
{
  "rules": {
    "beats": {
      ".indexOn": ["genre", "bpm", "key", "order", "createdAt", "active"]
    }
  }
}
```

---

## Regla

Si en algún momento la tienda se siente lenta (>2s de carga, scroll con lag):
1. Medir: ¿cuántos beats hay?
2. Si > 100: implementar paginación (Nivel 2)
3. Si > 500: implementar virtual scrolling (Nivel 3)
4. Documentar en CHANGELOG.md
