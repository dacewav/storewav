# 🚫 ANTI-PATTERNS.md — Lo que la IA NO debe hacer

> La IA tiende a sobre-innovar. Estas son las cosas que NO debe hacer
> a menos que el usuario lo pida explícitamente.

---

## Prohibido sin pedirlo

| ❌ No hacer | Por qué | Qué hacer en su lugar |
|-------------|---------|----------------------|
| Agregar dependencias sin preguntar | Puede romper el build o agregar complejidad | Registrar en DEPENDENCIES.md y pedir OK |
| Crear abstracciones prematuras | Over-engineering, más código para mantener | Escribir código directo primero |
| Agregar TypeScript estricto si no está configurado | Puede romper todo el proyecto | Usar `any` temporalmente si es necesario |
| Refactorizar código que no se pidió tocar | "Si funciona, no lo toques" | Solo refactorizar si el usuario lo pide |
| Agregar tests unitarios sin pedirlos | Los tests del Bloque 0 son suficientes por ahora | Solo agregar tests cuando se pidan |
| Crear componentes genéricos antes de tiempo | "Necesito un Button" ≠ "Necesito un sistema de botones" | Crear el componente específico primero |
| Optimizar performance sin que haya un problema | YAGNI (You Aren't Gonna Need It) | Medir primero, optimizar si hay problema real |
| Agregar logging/debugging en producción | Solo en desarrollo | Usar `console.log` temporal, quitar antes de commit |
| Cambiar la estructura de archivos sin pedirlo | Rompe imports existentes | Mantener la estructura actual |
| Agregar i18n/localización sin pedirlo | Over-engineering para un proyecto en español | Solo español por ahora |
| Crear APIs/Backend que no se necesitan | Firebase es el backend, no necesitas Express | Usar Firebase directamente |
| Agregar PWA/Service Worker sin pedirlo | Complejidad innecesaria en esta etapa | Dejar para un bloque futuro si se necesita |

---

## Sí está permitido (no confundir)

| ✅ Sí hacer | Cuándo |
|-------------|--------|
| Preguntar si una dependencia es necesaria | Antes de `npm install` |
| Sugerir una refactorización | Si el código actual tiene un bug real |
| Crear un componente reutilizable | Si el usuario pide 2+ componentes similares |
| Agregar un type/interface | Si ayuda a evitar bugs, no por estética |
| Optimizar un loop pesado | Si el usuario nota lag |

---

## El filtro mental

Antes de hacer CUALQUIER cosa, la IA debe preguntarse:

1. **¿El usuario lo pidió?** → Si no, no lo hagas.
2. **¿Es necesario para la tarea actual?** → Si no, déjalo para después.
3. **¿Hay una forma más simple?** → Usa la más simple.
4. **¿Se puede arreglar después si es necesario?** → Si sí, hazlo simple ahora.

---

## Seguridad (observado en catalog)

| ❌ No hacer | Por qué | Qué hacer |
|-------------|---------|-----------|
| Firebase API key en código fuente visible | La key de catalog está en config.js público | Usar env vars, pero recordar que Firebase client keys son PÚBLICAS por diseño (protegidas por Security Rules) |
| Conectar admin y store al mismo Firebase sin Security Rules separadas | Admin puede leer/escribir todo | Reglas separadas: store = read only, admin = read/write con auth |
| Exponer datos sensibles en analytics | analytics/events puede contener info del usuario | Sanitizar labels, no guardar IPs |
| Permitir download directo de audio full | Cualquiera puede descargar el beat | Usar signed URLs con expiración (R2/Firebase) |
| No rate limit en writes | Un script puede spamear Firebase | Firebase tiene rate limits, pero también limitar en UI (debounce) |
