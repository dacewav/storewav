# 📋 PROMPTS LISTOS — Solo Copiar y Pegar

> Elige el que necesites. Copia el bloque entero. Pega en el chat. Listo.

---

## 🟢 PROMPT DEFAULT (el que más vas a usar)

```
DACEWAV.STORE — clona https://github.com/dacewav/store y ejecuta bash .guide/BOOTSTRAP.sh. Lee .guide/BLOCK-CONTEXT.md. Dime qué bloque estamos y qué falta. Espera mi OK antes de hacer nada.
```

---

## 🟡 PRIMERA VEZ (repo vacío o primer chat)

```
DACEWAV.STORE — primer chat. Clona https://github.com/dacewav/store. Si está vacío, crea PROJECT_STATE.md con la estructura del Bloque 0. Ejecuta bash .guide/INSTALL-SKILLS.sh. Configura SvelteKit + Firebase + Cloudflare. Cuando termines un paso, testea que funciona antes de seguir. Commit cada paso.
```

---

## 🔵 AVANCE RÁPIDO (varias tareas seguidas)

```
DACEWAV.STORE — clona https://github.com/dacewav/store, ejecuta bash .guide/BOOTSTRAP.sh, lee BLOCK-CONTEXT.md. Avance rápido: todas las tareas pendientes del bloque actual sin preguntar entre cada una. Solo párate si falla un test o necesitas decisión de diseño. Commit después de cada tarea.
```

---

## 🟠 TAREA PUNTUAL (interrupción)

```
DACEWAV — pausa lo que sea que estés haciendo. Tarea puntual: [DESCRIBE AQUÍ LO QUE NECESITAS]. Después vuelve al bloque donde estabas. Guarda el estado antes de cambiar.
```

---

## 🔴 REPARAR ERROR

```
DACEWAV — error: [DESCRIBE EL ERROR AQUÍ]. No avances al siguiente bloque. Solo corrige esto. Testea que funciona. Commit aparte. Luego dime qué quedó pendiente.
```

---

## 🟣 REVISAR ESTADO (sin trabajar)

```
DACEWAV — clona https://github.com/dacewav/store, ejecuta bash .guide/BOOTSTRAP.sh. Solo dime el estado: qué bloque, qué completado, qué falta, qué hay en el parking lot. No hagas nada más.
```

---

## ⚪ SOLO DISEÑO (cuando quieras un componente bonito)

```
DACEWAV.STORE — clona https://github.com/dacewav/store, ejecuta bash .guide/BOOTSTRAP.sh. Necesito que diseñes: [DESCRIBE EL COMPONENTE AQUÍ]. Consulta docs/DESIGN-REFERENCES.md antes. Usa las reglas anti-slop: nada genérico, tipografía Syne/Space Grotesk, paleta dark + accent #00ff88. Testea en navegador antes de guardar.
```

---

## 💡 GUARDAR IDEA (sin interrumpir)

```
DACEWAV — guarda esta idea en PARKING-LOT.md para el bloque [NÚMERO]: [DESCRIBE LA IDEA]. No interrumpas lo que estés haciendo.
```

---

## 🔍 REVISAR UN ARCHIVO ESPECÍFICO

```
DACEWAV — clona https://github.com/dacewav/store, ejecuta bash .guide/BOOTSTRAP.sh. Revisa el archivo [NOMBRE DEL ARCHIVO]. Dame: qué hace, si tiene errores, si está desactualizado. No modifiques nada.
```

---

## 📝 ACTUALIZAR LA GUÍA (sin trabajar en el proyecto)

```
DACEWAV — clona https://github.com/dacewav/store. Solo actualiza la guía: ejecuta REVIEW-GUIDE.md. Revisa CHANGELOG.md, LIVE-STATUS.md, y ERRORES-COMUNES.md. Actualiza lo que necesite atención. Commit de solo guía.
```

---

## Cómo usar

1. Elige el prompt que se ajuste a lo que necesitas
2. Copia el bloque completo (entre las comillas ```)
3. Pega como primer mensaje en el chat nuevo
4. Si el prompt tiene `[DESCRIBE AQUÍ]`, reemplázalo con tu descripción
5. La IA hace el resto
