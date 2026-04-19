# 🔄 PROTOCOLO DE SESIÓN — Leer en CADA chat nuevo

> Copia y pega esto al inicio de cada sesión de IA.

---

## Paso 1: Clonar, instalar skills y entender contexto

```
Clona el repo, instala skills y ejecuta el bootstrap:
git clone https://github.com/dacewav/store.git && cd store && bash BOOTSTRAP.sh

Esto automáticamente:
- Instala skills de diseño (frontend-design, anthropic-frontend-design, composio)
- Muestra estado del proyecto
- Ejecuta health check de la guía (LIVE-STATUS.md)
- Muestra parking lot de ideas pendientes

Luego lee BLOCK-CONTEXT.md (contexto rápido del bloque actual — 1 minuto).
Si necesitas más detalle → lee PROJECT_STATE.md completo.
Lee docs/DESIGN-REFERENCES.md antes de diseñar cualquier componente.
```

## Paso 2: Confirmar bloque actual

Antes de hacer NADA, la IA debe responder:

```
Estamos en Bloque [X]: [nombre]
Tareas completadas: [X/Y]
Próxima tarea pendiente: [descripción]
Contexto: [1-2 líneas de BLOCK-CONTEXT.md relevantes]
¿Procedo? (sí/no)
```

**No avanzar hasta que el humano confirme.**

## Paso 3: Ejecutar UNA tarea

- Tomar la primera tarea pendiente `[ ]` del bloque actual
- Implementarla
- **TESTEARLA exhaustivamente** (ver lista de tests del bloque en PROJECT_STATE.md)
- Reportar resultado

## Paso 4: Test obligatorio

Después de CADA implementación, la IA DEBE responder:

```
✅ TAREA: [nombre de la tarea]
📝 QUÉ HICE: [breve descripción]
🧪 TESTS:
  - [test 1]: ✅/❌
  - [test 2]: ✅/❌
  - [test 3]: ✅/❌
📋 ESTADO: [funciona / hay issues / falló]
```

**Si algún test falla → NO avanzar. Arreglar primero.**

## Paso 5: Guardar progreso

```bash
# Ejecutar pre-commit check
bash PRE-COMMIT.sh

# Si pasa → continuar:
# Actualizar PROJECT_STATE.md: cambiar [ ] por [x] en la tarea completada
# Actualizar BLOCK-CONTEXT.md: reflejar progreso
# Hacer commit
git add -A
git commit -m "feat: [descripción de lo hecho]"
git push origin main
```

**Si PRE-COMMIT.sh falla → NO commitear. Arreglar primero.**

## Paso 6: Siguiente tarea o cierre

Si quedan tareas en el bloque → repetir desde Paso 3.
Si el bloque está completo → actualizar PROJECT_STATE.md con el siguiente bloque.

**Antes de cerrar sesión** → ejecutar check de FINAL (ver REVIEW-GUIDE.md):
1. Actualizar CHANGELOG.md con lo que hiciste y aprendiste
2. Marcar qué archivos de guía necesitan update
3. Ejecutar esos updates
4. Actualizar LIVE-STATUS.md (métricas, health check, updates pendientes)
5. Actualizar BLOCK-CONTEXT.md si cambió de bloque o se completaron tareas
6. Commit final que incluya updates de guía

## Manejo de Interrupciones

Si el usuario pide algo FUERA del bloque actual:
1. Guardar posición en BLOCK-CONTEXT.md ("quedé en tarea X, paso Y")
2. Responder: "⏸️ Pausando Bloque [X]. Atendiendo: [lo que pidió]"
3. Ejecutar la interrupción (commit separado si es cambio)
4. Volver: "✅ Volviendo a Bloque [X], tarea [Y]. ¿Continuamos?"
5. Ver INTERRUPTION-HANDLER.md para el protocolo completo

---

## Ejemplo de flujo perfecto

```
Chat 1:
  → Bloque 0, tarea 1: "npm create svelte@latest ejecutado"
  → Ejecuta, verifica que compila, TESTEA npm run dev
  → Marca [x], commit, push
  → Tarea 2: "Firebase SDK instalado"
  → Ejecuta, TESTEA que importa sin errores
  → Marca [x], commit, push
  → ... (siguiente chat)

Chat 2:
  → Bootstrap, lee estado
  → "Bloque 0, tarea 5/8 completadas. Próxima: .gitignore"
  → Ejecuta, TESTEA que no commitea .env
  → Marca [x], commit, push
  → ...
```

## Reglas de hierro

1. **UNA tarea a la vez** — no saltar, no agrupar
2. **TESTEAR antes de marcar [x]** — no "debería funcionar", sino "funciona porque lo verifiqué"
3. **Commit después de cada [x]** — nunca dejar trabajo sin commit
4. **Push después de cada commit** — para que el siguiente chat lo vea
5. **PROJECT_STATE.md se actualiza SIEMPRE** — es la memoria compartida
6. **Si algo falla, NO avanzar** — arreglar primero, luego continuar
7. **No tocar código de bloques futuros** — solo el bloque actual
8. **No inventar features** — solo lo que está en PROJECT_STATE.md
9. **Skills de diseño se instalan SIEMPRE** — INSTALL-SKILLS.sh corre en cada bootstrap
10. **Consultar DESIGN-REFERENCES.md** antes de diseñar cualquier componente
11. **NUNCA usar fonts genéricas** (Inter, Roboto, Arial) — seguir guías de frontend-design skill
12. **Si el humano corrige, registrar en "Errores y Soluciones"**
13. **Al cerrar sesión, dejar claro dónde quedamos**
