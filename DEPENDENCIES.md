# 📦 DEPENDENCIES.md — Registro de Dependencias

> Cada paquete que se instala se registra aquí.
> Evita que la IA instale cosas sin justificación.

---

## Dependencias del Proyecto

| Paquete | Para qué | Instalado en | Bloque | Necesario |
|---------|----------|-------------|--------|-----------|
| `svelte` | Framework | Bloque 0 | 0 | ✅ core |
| `@sveltejs/kit` | SvelteKit | Bloque 0 | 0 | ✅ core |
| `@sveltejs/adapter-cloudflare` | Deploy Cloudflare | Bloque 0 | 0 | ✅ deploy |
| `firebase` | Backend | Bloque 0 | 0 | ✅ core |
| `vite` | Build tool | Bloque 0 | 0 | ✅ core (incluido con SvelteKit) |
| `typescript` | Tipos | Bloque 0 | 0 | ✅ core |

---

## Dependencias que NO se necesitan (por ahora)

| Paquete | Razón de NO incluir |
|---------|-------------------|
| `tailwindcss` | Design tokens CSS son suficientes, menos complejidad |
| `react` | Usamos Svelte |
| `next.js` | Usamos SvelteKit |
| `axios` | `fetch` nativo es suficiente |
| `lodash` | Funciones puras en `utils/` |
| `moment` | `Intl.DateTimeFormat` nativo |
| `jquery` | No. |
| `bootstrap` | No. |

---

## Regla para agregar dependencias

**Antes de instalar CUALQUIER paquete, la IA debe:**
1. Justificar por qué es necesario
2. Verificar que no existe alternativa nativa
3. Registrar aquí con fecha y bloque
4. Pedir confirmación del usuario

**NUNCA instalar sin preguntar primero.**
