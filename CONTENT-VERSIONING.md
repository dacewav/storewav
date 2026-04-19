# 🔙 CONTENT-VERSIONING.md — Versionado y Rollback de Contenido

> El admin puede cambiar settings, theme, beats. ¿Qué pasa si rompe algo?
> Este sistema permite deshacer cambios del admin.

---

## Problema

Admin cambia el color accent a rojo → se ve horrible → quiere volver al verde anterior.
Sin versionado → no hay forma de saber cuál era el verde anterior.

## Solución: Historial de cambios en Firebase

```
changelog/
  {timestamp}/
    type: "theme" | "settings" | "beat" | "beat-delete"
    path: "settings/theme/accentColor"
    before: "#00ff88"
    after: "#ff0000"
    by: "admin@dacewav.com"
    at: 1713484800000
```

## Implementación en el Admin

### Auto-save con versionado

```typescript
// src/lib/stores/content-history.ts

interface Change {
  type: 'theme' | 'settings' | 'beat' | 'beat-delete';
  path: string;
  before: any;
  after: any;
  by: string;
  at: number;
}

const MAX_HISTORY = 50;

export async function saveWithHistory(
  db: Database,
  path: string,
  newValue: any,
  type: Change['type'],
  userEmail: string
) {
  // 1. Leer valor actual
  const snap = await get(ref(db, path));
  const oldValue = snap.val();

  // 2. Guardar en historial
  const historyRef = push(ref(db, 'changelog'));
  await set(historyRef, {
    type,
    path,
    before: oldValue,
    after: newValue,
    by: userEmail,
    at: Date.now(),
  });

  // 3. Guardar el nuevo valor
  await set(ref(db, path), newValue);

  // 4. Limpiar historial viejo (mantener últimos 50)
  const historySnap = await get(ref(db, 'changelog'));
  const entries = Object.entries(historySnap.val() || {});
  if (entries.length > MAX_HISTORY) {
    const toDelete = entries.slice(0, entries.length - MAX_HISTORY);
    const updates = {};
    toDelete.forEach(([key]) => updates[`changelog/${key}`] = null);
    await update(ref(db), updates);
  }
}
```

### UI de rollback en Admin

```
┌─────────────────────────────┐
│  Historial de Cambios       │
│                             │
│  ⏮️ Accent: #ff0000 → #00ff88  [Deshacer]
│     Hace 5 min por admin    │
│                             │
│  ⏮️ Hero title: "Nuevo" → ... [Deshacer]
│     Hace 2 horas por admin  │
│                             │
│  ⏮️ Beat "Midnight" eliminado [Restaurar]
│     Ayer por admin          │
└─────────────────────────────┘
```

### Función de deshacer

```typescript
export async function undoChange(db: Database, change: Change) {
  if (change.type === 'beat-delete') {
    // Restaurar beat completo
    await set(ref(db, change.path), change.before);
  } else {
    // Revertir valor
    await set(ref(db, change.path), change.before);
  }
}
```

---

## Undo inmediato (sin Firebase)

El admin también tiene un **undo stack local** (Ctrl+Z) para cambios que aún no se guardaron:

```typescript
// Stack en memoria — se pierde al recargar
const undoStack: { path: string; before: any }[] = [];
const redoStack: { path: string; before: any }[] = [];

export function pushUndo(path: string, before: any) {
  undoStack.push({ path, before });
  redoStack.length = 0; // clear redo
}

export function undo() {
  const entry = undoStack.pop();
  if (!entry) return;
  redoStack.push({ path: entry.path, before: getCurrentValue(entry.path) });
  applyValue(entry.path, entry.before);
}

export function redo() {
  const entry = redoStack.pop();
  if (!entry) return;
  undoStack.push({ path: entry.path, before: getCurrentValue(entry.path) });
  applyValue(entry.path, entry.before);
}
```

---

## Reglas

1. **Ctrl+Z** = undo local (sin Firebase, instantáneo)
2. **Ctrl+Shift+Z** = redo local
3. **Botón "Deshacer"** en historial = rollback en Firebase (afecta a todos)
4. **Auto-save** guarda en Firebase CADA 2s después del último cambio
5. **Historial** mantiene últimos 50 cambios con before/after
6. **Beat delete** guarda el beat COMPLETO para poder restaurar
