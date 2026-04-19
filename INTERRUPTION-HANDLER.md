# 🔀 INTERRUPTION-HANDLER.md — Manejo de Interrupciones

> El usuario puede pedir cosas puntuales entre tareas del bloque.
> Este protocolo asegura que no perdemos el hilo.

---

## Cuando el usuario pide algo FUERA del bloque actual

### Ejemplos de interrupciones:
- "Oye, ¿cómo se ve el componente X?"
- "Cambia el color del botón a rojo"
- "¿Podemos revisar si el player funciona?"
- "Agrega un favicon"
- "Revisa el error que tengo"

### Protocolo:

```
1. DETENER tarea actual (guardar estado en BLOCK-CONTEXT.md)

2. RESPONDER al usuario:
   "⏸️ Pausando Bloque [X], tarea [Y].
    Atendiendo: [lo que pidió]"

3. EJECUTAR la interrupción
   - Si es pregunta → responder directamente
   - Si es cambio → hacerlo, testear, commit
   - Si es revisión → revisar y reportar

4. REGISTRAR en BLOCK-CONTEXT.md:
   - Guardar posición: "quedé en tarea X, paso Y de Z"
   - Notar la interrupción atendida

5. VOLVER al bloque:
   "✅ Interrupción atendida.
    Volvemos a Bloque [X], tarea [Y].
    ¿Continuamos?"

6. RESUMIR tarea anterior en 1 línea:
   "Estaba haciendo [tarea Y]: [breve descripción de dónde iba]"
```

---

## Ejemplo real

```
Usuario: "Oye antes de seguir, cambia el botón de login a verde"

IA: ⏸️ Pausando Bloque 5, tarea 2/4 (Dashboard layout).
    Atendiendo: Cambiar color botón login a verde.

    [busca el componente, cambia el color, verifica en navegador]
    ✅ Cambiado. Botón login ahora usa --accent (#00ff88).
    [commit: "fix: login button color to accent green"]

    ✅ Interrupción atendida.
    Volvemos a Bloque 5, tarea 2/4: Dashboard layout.
    Estaba creando el layout base del dashboard con sidebar.
    ¿Continuamos?
```

---

## Reglas de interrupción

1. **Nunca ignorar una interrupción del usuario** — es su proyecto
2. **Nunca perder el progreso** — guardar estado antes de pausar
3. **Nunca mezclar commits** — interrupción = commit separado
4. **Siempre volver explícitamente** — confirmar con el usuario que volvemos
5. **Si la interrupción es muy larga** (más de 30 min de trabajo), considerar si debería ser un bloque nuevo
