# 🔄 TASK-RESUME.md — Continuar Tarea Incompleta

> Si un chat se muere a mitad de una tarea (timeout, crash, cierre),
> el siguiente chat necesita saber EXACTAMENTE dónde quedamos.

---

## ¿Qué pasa si el chat muere a mitad de tarea?

Sin este protocolo, el siguiente chat:
- No sabe qué archivo estaba editando
- No sabe qué paso completó y cuál no
- Puede repetir trabajo ya hecho
- O peor: puede sobreescribir trabajo a medio hacer

---

## Protocolo: Guardar progreso intra-tarea

### Después de CADA paso dentro de una tarea, actualizar BLOCK-CONTEXT.md:

```yaml
tarea_actual:
  nombre: "Crear componente Button.svelte"
  pasos_completados: 3
  pasos_totales: 5
  ultimo_paso: "Implementado variantes primary y secondary"
  siguiente_paso: "Implementar variante ghost"
  archivos_modificados:
    - src/lib/components/Button.svelte
    - src/app.css
  estado: "funcional pero incompleto"
  nota: "Ghost variant tiene el hover roto, necesita fix"
```

### El siguiente chat lee esto y sabe:
1. Qué tarea estaba en progreso
2. Qué pasos ya se hicieron
3. Cuál es el siguiente paso
4. Qué archivos ya se tocaron
5. Si hay algo roto a medio arreglar

---

## Ejemplo real

```
Chat #5 muere después de crear Button.svelte pero antes de testear:

BLOCK-CONTEXT.md queda así:
  tarea_actual:
    nombre: "Crear componente Button.svelte"
    pasos_completados: 4
    pasos_totales: 6
    ultimo_paso: "Componente creado con variantes primary/secondary/ghost"
    siguiente_paso: "TESTEAR: abrir navegador, verificar render, clicks, responsive"
    archivos_modificados:
      - src/lib/components/Button.svelte
      - src/app.css
    estado: "creado, sin testear"

Chat #6 lee esto y sabe:
  "Estoy en Bloque 1, tarea Button.svelte.
   El componente existe pero no se ha testeado.
   Próximo paso: testear."
```

---

## Regla de oro

**Nunca cerrar un chat sin actualizar BLOCK-CONTEXT.md con el estado intra-tarea.**

Si la tarea está completa → marcar `estado: "completa"` y no escribir `tarea_actual`.
Si la tarea está a medio hacer → escribir el estado detallado.
