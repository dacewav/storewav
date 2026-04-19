# 🔄 REVIEW-GUIDE.md — Protocolo de Actualización de la Guía

> Cada chat DEBE ejecutar este check ANTES de cerrar sesión.
> La guía mejora chat con chat — no se queda estática.

---

## ¿Cuándo revisar la guía?

1. **Al INICIO** de cada chat — después de leer PROJECT_STATE.md
2. **Al FINAL** de cada chat — antes de cerrar sesión
3. **Cuando algo FALLE** y la solución no esté en ERRORES-COMUNES.md
4. **Cuando se tome una DECISIÓN** que afecte la arquitectura

---

## Check de INICIO (2 minutos)

Antes de trabajar, la IA responde:

```
📋 REVISIÓN DE GUÍA (inicio):
1. ¿PROJECT_STATE.md refleja la realidad? [sí/no — si no, qué falta]
2. ¿Hay entradas en CHANGELOG.md que indiquen updates pendientes? [sí/no]
3. ¿INSTALL-SKILLS.sh necesita nuevas skills? [sí/no]
4. ¿ERRORES-COMUNES.md tiene el error que encontré? [sí/no si hubo error]
```

Si alguna respuesta es "no" → actualizar ANTES de trabajar en el proyecto.

---

## Check de FINAL (5 minutos)

Antes de cerrar sesión, la IA ejecuta:

### Paso 1: Actualizar CHANGELOG.md

```markdown
## [FECHA] — Sesión #N

**Bloque:** X — Nombre
**Tarea(s):** lo que trabajaste

### Resultado
- ✅ lo que funcionó
- ❌ lo que falló

### Aprendizajes
- cosas nuevas descubiertas
- decisiones tomadas
- cosas que la guía no contemplaba

### Impacto en la Guía
- [ ] PROJECT_STATE.md — actualizar progreso
- [ ] ERRORES-COMUNES.md — agregar error/solución encontrada
- [ ] MEGA-PROMPT.md — ajustar prompt si algo no funcionó como esperábamos
- [ ] PROTOCOLO-SESION.md — ajustar flujo si encontramos mejor forma
- [ ] PROTOCOLO-TESTS.md — agregar tipo de test que faltaba
- [ ] INSTALL-SKILLS.sh — agregar/actualizar skill
- [ ] docs/DESIGN-REFERENCES.md — agregar referencia
- [ ] GUIA-COMPLETA.md — ajustar arquitectura si cambió algo
- [ ] ninguno — todo sigue igual

### Estado final
- qué queda pendiente para el siguiente chat
```

### Paso 2: Ejecutar updates marcados

Por cada `[ ]` marcado en "Impacto en la Guía":

1. Abrir el archivo correspondiente
2. Hacer el cambio necesario
3. Marcar `[x]`
4. Explicar brevemente qué cambió y por qué

### Paso 3: Commit final

```bash
git add -A
git commit -m "chore: session #N — [resumen] + guide updates"
git push origin main
```

---

## Ejemplo de flujo real

```
Chat #3 termina después de crear componente Button.svelte:

1. Aprendió que SvelteKit requiere PUBLIC_ prefix para env vars → 
   eso ya está en ERRORES-COMUNES.md ✅

2. Descubrió que el componente Modal necesita z-index management →
   la guía no lo contempla → agregar a PROTOCOLO-TESTS.md

3. El color picker del admin necesita un formato específico de Firebase →
   agregar a ERRORES-COMUNES.md

4. PROJECT_STATE.md: Bloque 1, tarea 3/10 → [x]

5. Commit: "feat: Button component + guide updates (modal z-index, env vars note)"
```

---

## Sistema de Versiones de la Guía

Cada vez que se actualice un archivo de la guía, incrementar el contador en PROJECT_STATE.md:

```yaml
guide_version: "1.3"  # 1 = major, 3 = updates hechos
```

Esto permite saber cuántas veces ha evolucionado la guía.

---

## Qué NO actualizar

- No cambies la arquitectura fundamental solo porque un chat tuvo problemas
- No agregues skills que solo sirvieron una vez
- No modifiques el mega prompt por cada pequeño aprendizaje — solo por patrones recurrentes
- No reescribas archivos completos — haz edits específicos
