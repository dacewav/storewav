# ✅ DEFINITION-OF-DONE.md — ¿Cuándo está terminada una tarea?

> La IA no puede saber si una tarea está "completada" solo porque escribió código.
> Cada tipo de tarea tiene criterios EXPLÍCITOS de "done".

---

## Definición por tipo de tarea

### Componente UI (ej: Button.svelte)

```
DONE cuando:
- [ ] El componente existe en src/lib/components/
- [ ] Se renderiza sin errores en navegador
- [ ] Las variantes funcionan (primary, secondary, ghost)
- [ ] Props se pasan correctamente
- [ ] Eventos (on:click, etc.) funcionan
- [ ] Responsive: se ve bien en 320px y 1440px
- [ ] Focus visible funciona (Tab → outline)
- [ ] No hay errores en consola del navegador
- [ ] npm run build pasa
```

### Página/ruta (ej: /admin/beats)

```
DONE cuando:
- [ ] La ruta existe y carga
- [ ] Los datos se muestran correctamente (o skeleton si loading)
- [ ] Las interacciones funcionan (clicks, forms, uploads)
- [ ] Los datos se guardan en Firebase (si es escritura)
- [ ] Los cambios se reflejan en la tienda (si aplica)
- [ ] No hay errores en consola
- [ ] Responsive funciona
- [ ] Keyboard navigation funciona
- [ ] npm run build pasa
```

### Store de Firebase (ej: beatsStore)

```
DONE cuando:
- [ ] Lee datos de Firebase correctamente
- [ ] Los datos se muestran en un componente
- [ ] Los datos se actualizan en tiempo real (onValue)
- [ ] Si es escritura: los cambios persisten en Firebase Console
- [ ] Error handling: muestra toast/estado si falla
- [ ] No hay memory leaks (listener se limpia en onDestroy)
```

### Feature completa (ej: sistema de filtros)

```
DONE cuando:
- [ ] Todos los sub-componentes existen
- [ ] La feature funciona end-to-end
- [ ] Se probaron los edge cases (sin datos, muchos datos, datos raros)
- [ ] Se testeó en móvil
- [ ] Se testeó con keyboard
- [ ] Se hizo Lighthouse check (no bajó de 90)
- [ ] No hay console errors
- [ ] npm run build pasa
```

### Fix de bug

```
DONE cuando:
- [ ] El bug ya no se reproduce
- [ ] Se verificó que el fix no rompió otra cosa (regression check)
- [ ] Se testeó en el caso que causó el bug originalmente
- [ ] Se documentó en ERRORES-COMUNES.md
```

---

## Anti-patrones de "done"

| ❌ Falso "done" | Por qué no es done |
|-----------------|-------------------|
| "El código está escrito" | No se probó, puede tener errores |
| "No hay errores de compilación" | Puede tener errores de runtime |
| "Se ve bien en desktop" | No se probó en móvil |
| "Funciona en Chrome" | Puede romper en Safari/Firefox |
| "Los tests unitarios pasan" | Tests no cubren integración ni UI |
| "Hice commit" | Commit != done |

---

## Regla

**Si no puedes marcar TODOS los checkboxes del tipo de tarea → NO está done.**

La IA debe mostrar el checklist de done DESPUÉS de cada tarea y marcar cada item.
Si algún item falla → arreglar ANTES de marcar la tarea como [x] en PROJECT_STATE.md.
