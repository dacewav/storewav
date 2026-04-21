# 🧪 PROTOCOLO DE TESTS — No marcar [x] sin esto

> Cada tarea tiene tests obligatorios. NO se avanza hasta que TODOS pasen.
> Este archivo define CÓMO testear cada tipo de cosa.

---

## Tests por Tipo de Cambio

### 🎨 Cambios de UI/Visual (componentes, layout, CSS)

**Obligatorio hacer estos pasos EN ORDEN:**

1. `npm run dev` — el servidor arranca sin errores
2. Abrir `http://localhost:5173` en el navegador
3. Verificar que la página carga (sin pantalla en blanco)
4. Verificar que NO hay errores en la consola del navegador (F12 → Console)
5. Verificar responsive:
   - 320px (móvil) — ¿se ve bien?
   - 768px (tablet) — ¿se ve bien?
   - 1024px (desktop) — ¿se ve bien?
6. Si hay interacción (hover, click, animación) → probarla
7. Si depende de Firebase → verificar que lee datos correctamente

**Formato de reporte:**
```
✅ UI: [nombre del componente]
- Página carga: ✅
- Sin errores en consola: ✅
- Responsive 320px: ✅
- Responsive 768px: ✅
- Responsive 1024px: ✅
- Interacción funciona: ✅
```

### 🔥 Cambios de Firebase (stores, lectura/escritura)

**Obligatorio:**

1. Abrir Firebase Console en otra pestaña
2. Si es un **store de lectura**:
   - Verificar que los datos se muestran en la UI
   - Cambiar un dato manualmente en Firebase Console
   - Verificar que la UI se actualiza (sin recargar)
3. Si es un **store de escritura** (admin):
   - Crear/modificar un dato desde la UI admin
   - Verificar que aparece en Firebase Console
   - Verificar que aparece en la tienda (si aplica)
4. Si hay reglas de seguridad:
   - Intentar escribir SIN autenticación → debe fallar
   - Intentar escribir CON autenticación → debe funcionar

**Formato de reporte:**
```
✅ Firebase: [nombre del store]
- Lee datos correctamente: ✅
- Escritura funciona: ✅
- Sync en tiempo real: ✅
- Reglas de seguridad: ✅
```

### 📤 Upload de archivos (audio, imágenes)

**Obligatorio:**

1. Subir un archivo de prueba (pequeño, < 1MB)
2. Verificar que se subió a Storage/R2
3. Verificar que la URL se guarda en Firebase DB
4. Verificar que se muestra en la UI
5. Intentar subir un archivo inválido (muy grande, formato incorrecto) → debe mostrar error
6. Intentar subir sin autenticación → debe fallar

### 🔐 Auth / Seguridad

**Obligatorio:**

1. Sin login → acceder a `/admin` → debe redirigir a login
2. Login incorrecto → debe mostrar error
3. Login correcto → debe acceder al dashboard
4. Logout → debe redirigir a login
5. Intentar operaciones de admin sin token → deben fallar

### 🎵 Player de Audio

**Obligatorio:**

1. Click play → audio comienza
2. Click pause → audio se pausa
3. Barra de progreso se mueve
4. Click en barra de progreso → salta a esa posición
5. Cambiar de beat → anterior se detiene, nuevo comienza
6. Navegar a otra página → audio sigue (si es player global)
7. Volumen funciona

### 🔍 Filtros y Búsqueda

**Obligatorio:**

1. Sin filtros → se muestran todos los beats
2. Filtrar por género → solo muestra ese género
3. Filtrar por BPM → solo muestra en ese rango
4. Buscar por texto → filtra por título/artista
5. Combinar filtros → resultado correcto
6. Limpiar filtros → vuelve a mostrar todos

### 📱 Mobile Testing

**Obligatorio (cada componente):**

1. Chrome DevTools → Device Mode → iPhone SE (375px)
2. Todos los elementos son tappeables (≥44px touch targets)
3. No scroll horizontal accidental
4. Player funciona con touch (no requiere hover)
5. Modal se puede cerrar con tap fuera

### ♿ Accessibility Testing

**Obligatorio (cada componente):**

1. Tab navega todos los elementos interactivos
2. Enter/Space activa botones y links
3. Focus visible en cada elemento
4. Lighthouse Accessibility score ≥ 90
5. Contraste de texto ≥ 4.5:1

---

## Regla del Build

Antes de CADA commit:

```bash
npm run build
```

Si el build falla → **NO commitear**. Arreglar primero.

---

## Regla del "Funciona de Verdad"

No confiar en "debería funcionar". Verificar:

- ❌ "El componente está creado" → NO suficiente
- ✅ "El componente se ve en el navegador, responde a clicks, no tiene errores" → SÍ suficiente

- ❌ "El store conecta a Firebase" → NO suficiente
- ✅ "Leí un dato de Firebase y lo veo en pantalla" → SÍ suficiente

- ❌ "El admin puede editar" → NO suficiente
- ✅ "Edité un beat en admin y el cambio apareció en la tienda sin recargar" → SÍ suficiente

---

## Checklist Rápida (copiar por cada tarea)

```
TAREA: [nombre]
- [ ] Código escrito
- [ ] npm run dev funciona
- [ ] npm run build funciona
- [ ] Verificado en navegador
- [ ] Tests específicos pasan: [listar]
- [ ] Sin errores en consola
- [ ] PROJECT_STATE.md actualizado
- [ ] Commit hecho
- [ ] Push hecho
```
