# ⌨️ KEYBOARD-SHORTCUTS.md — Atajos de Teclado

> catalog tiene atajos. El nuevo store y admin DEBEN tenerlos también.
> Unificados aquí para que no se olviden.

---

## Tienda (/)

| Tecla | Acción | Contexto |
|-------|--------|----------|
| `Espacio` | Play/Pause del player | No en input/textarea |
| `Escape` | Cerrar modal o limpiar búsqueda | Siempre |
| `Ctrl+K` / `Cmd+K` | Focus en búsqueda | Siempre |
| `←` / `→` | Beat anterior/siguiente | Player activo |
| `↑` / `↓` | Volumen +/− | Player activo |

## Admin (/admin)

| Tecla | Acción | Contexto |
|-------|--------|----------|
| `Ctrl+K` / `Cmd+K` | Abrir command palette | Siempre |
| `Ctrl+Z` / `Cmd+Z` | Deshacer último cambio | Siempre |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Rehacer | Siempre |
| `Ctrl+S` / `Cmd+S` | Guardar todo | Siempre |
| `Escape` | Cerrar modal/panel activo | Siempre |
| `Ctrl+E` / `Cmd+E` | Exportar configuración | Siempre |

## Modal de Beat (tienda)

| Tecla | Acción |
|-------|--------|
| `Escape` | Cerrar modal |
| `Espacio` | Play/Pause del beat actual |

---

## Implementación en Svelte

```svelte
<!-- src/lib/actions/keyboard.ts -->
<script context="module">
  export function keyboardShortcuts(node: HTMLElement, shortcuts: Record<string, () => void>) {
    function handleKeydown(e: KeyboardEvent) {
      const key = [
        e.ctrlKey && 'Ctrl+',
        e.metaKey && 'Cmd+',
        e.shiftKey && 'Shift+',
        e.key
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    }

    node.addEventListener('keydown', handleKeydown);
    return {
      destroy() {
        node.removeEventListener('keydown', handleKeydown');
      }
    };
  }
</script>
```

---

## Reglas

1. **NUNCA** interceptar teclas cuando el usuario está en un input/textarea
2. **SIEMPRE** usar `e.preventDefault()` para evitar conflictos del browser
3. **Espacio** para play/pause solo cuando NO hay foco en un input
4. **Escape** siempre cierra lo más cercano (modal → panel → limpiar búsqueda)
5. **Mostrar atajos visibles** en tooltips o en el command palette
