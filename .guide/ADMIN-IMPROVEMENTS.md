# 🎨 ADMIN IMPROVEMENTS — Session 2026-04-26

> Mejoras visuales y de UX para el panel admin

---

## 🔴 CRÍTICAS (funcionalidad rota)

### 1. Dashboard: "Sesión: null"
- **Problema:** Login anónimo no tiene email → muestra "Sesión: null"
- **Fix:** Mostrar UID truncado o "Anónimo" cuando no hay email
- **Archivo:** `src/routes/(admin)/admin/+page.svelte`

## 🟡 VISUAL (mejoras de apariencia)

### 2. Sidebar: shortcuts no visibles
- **Problema:** Hay keyboard shortcuts (Ctrl+B, Ctrl+T, etc.) pero no se ven en el sidebar
- **Fix:** Mostrar shortcut badge al hover de cada item
- **Archivo:** `src/routes/(admin)/+layout.svelte`

### 3. Bottom nav: 13 items es demasiado
- **Problema:** En mobile, 13 items en bottom nav es ilegible
- **Fix:** Reducir a 5-6 items principales (Dashboard, Beats, Theme, Content, Brand)
- **Archivo:** `src/routes/(admin)/+layout.svelte`

### 4. Dashboard: activity log muy escueto
- **Problema:** Solo 2 items ("Sesión" y "Firebase conectado")
- **Fix:** Agregar stats de última edición, beats recientes, tiempo activo
- **Archivo:** `src/routes/(admin)/admin/+page.svelte`

### 5. Save status poco visible
- **Problema:** Indicador pequeño en topbar, fácil de perder
- **Fix:** Agregar pill animado en el contenido cuando hay cambios pendientes
- **Archivo:** `src/routes/(admin)/+layout.svelte`

## 🟢 UX (mejoras de usabilidad)

### 6. Sidebar: sin indicador de sección activa en mobile
- **Problema:** Bottom nav no muestra qué sección estás viendo claramente
- **Fix:** Agregar indicador visual más prominente (dot o underline)

### 7. No hay breadcrumb
- **Problema:** En páginas anidadas (ej: beats/edit), no hay forma de volver fácil
- **Fix:** Agregar breadcrumb en topbar

### 8. Dashboard: sin beats recientes
- **Problema:** No muestra los últimos beats editados
- **Fix:** Agregar sección "Últimos beats" con links directos

---

*Prioridad: #1 → #4 → #2 → #3 → #8*
