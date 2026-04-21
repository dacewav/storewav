# 🔄 MIGRATION.md — Plan de Migración de Datos

> catalog tiene beats, settings, theme, analytics en Firebase.
> El nuevo store necesita esos datos. Este es el plan.

---

## Datos a migrar

| Colección | Cantidad aprox | Método |
|-----------|---------------|--------|
| `beats/` | ~20-50 beats | Script de export/import |
| `settings/` | 1 objeto | Copiar manual o script |
| `theme/` | 1 objeto | Copiar manual o script |
| `analytics/` | Histórico | Opcional — no migrar inicialmente |
| `customEmojis/` | Array pequeño | Copiar manual |
| Storage (audios, covers) | Archivos grandes | Mover o mantener URLs |

## Opción A: Mismo Firebase project (RECOMENDADA)

```
NO necesitas migrar datos — usas el mismo Firebase project.
Solo cambias el frontend (SvelteKit) que lee los mismos datos.

Pasos:
1. Crear nuevo repo dacewav/store con SvelteKit
2. Apuntar al mismo Firebase project (dacewav-store-3b0f5)
3. La nueva tienda lee los mismos beats/settings/theme
4. Cuando la nueva tienda funcione → cambiar DNS de dacewav.store
5. El catalog queda como backup

Ventaja: Cero pérdida de datos. Transición gradual.
Riesgo: La nueva app puede tener schema incompatibilidades.
```

## Opción B: Nuevo Firebase project + migración

```
Crear proyecto Firebase nuevo y migrar datos.

Pasos:
1. Crear nuevo proyecto Firebase
2. Exportar datos de catalog:
   firebase database:get / > catalog-backup.json
3. Transformar schema si es necesario
4. Importar al nuevo proyecto:
   firebase database:set / < catalog-backup.json
5. Mover archivos de Storage (audios, covers)
6. Actualizar URLs en beats
```

## Schema compatibility check

Antes de que la nueva tienda lea datos del catalog, verificar:

| Campo | En catalog | ¿Compatible? | Acción |
|-------|-----------|---------------|--------|
| `beats/{id}/name` | string | ✅ | — |
| `beats/{id}/genre` | string | ✅ | — |
| `beats/{id}/bpm` | number | ✅ | — |
| `beats/{id}/key` | string | ✅ | — |
| `beats/{id}/tags` | string[] | ✅ | — |
| `beats/{id}/imageUrl` | string | ✅ | — |
| `beats/{id}/audioUrl` | string | ✅ | — |
| `beats/{id}/previewUrl` | string | ✅ | — |
| `beats/{id}/licenses` | array con objetos | ⚠️ | Verificar formato exacto |
| `beats/{id}/cardStyle` | objeto complejo | ⚠️ | Simplificar en v1 |
| `beats/{id}/order` | number | ✅ | — |
| `beats/{id}/plays` | number | ✅ | — |
| `settings/` | objeto | ⚠️ | Muchos campos, verificar |
| `theme/` | objeto con 50+ props | ⚠️ | Mapear a design tokens |

## Script de verificación de schema

```javascript
// Ejecutar en consola del navegador con Firebase conectado
import { ref, get } from 'firebase/database';
import { db } from './src/lib/firebase';

async function verifySchema() {
  const beatsSnap = await get(ref(db, 'beats'));
  const beats = beatsSnap.val() || {};

  const issues = [];
  for (const [id, beat] of Object.entries(beats)) {
    if (!beat.name) issues.push(`Beat ${id}: falta 'name'`);
    if (!beat.audioUrl && !beat.previewUrl) issues.push(`Beat ${id}: falta audio`);
    if (!beat.licenses || !beat.licenses.length) issues.push(`Beat ${id}: falta licenses`);
    if (beat.cardStyle && typeof beat.cardStyle !== 'object') issues.push(`Beat ${id}: cardStyle no es objeto`);
  }

  if (issues.length) {
    console.warn('⚠️ Issues encontrados:', issues);
  } else {
    console.log('✅ Schema compatible');
  }
}
```

---

## Cuándo migrar

| Fase | Qué hacer |
|------|-----------|
| Bloque 0 | Setup del nuevo store apuntando al MISMO Firebase project |
| Bloque 3 | La tienda nueva lee los beats existentes del catalog |
| Bloque 6 | El admin nuevo puede editar los beats existentes |
| Bloque 10 | Cambiar DNS. catalog queda como backup por 30 días |
| Post-deploy | Si todo funciona → archivar catalog |
