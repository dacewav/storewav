# 🔔 TOAST-SYSTEM.md — Sistema de Notificaciones (Toasts)

> catalog tiene `showToast()` — el nuevo store necesita un sistema unificado.
> Diseño aquí para que no se invente en cada sesión.

---

## Diseño visual

```
┌─────────────────────────────────┐
│ ✅ Beat guardado correctamente  │ ← success (verde)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ❌ No se pudo subir el audio    │ ← error (rojo)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⚠️ Conexión lenta, reintentando │ ← warning (amarillo)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ℹ️ 3 beats nuevos en catálogo   │ ← info (accent)
└─────────────────────────────────┘

Posición: bottom-right en desktop, bottom-center en móvil
Animación: slide-up + fade-in, auto-dismiss en 3s (4s para errores)
Stacking: máximo 3 visibles, las demás se apilan
```

## Componente Svelte

```svelte
<!-- src/lib/components/Toast.svelte -->
<script lang="ts">
  import { toastStore } from '$lib/stores/toast';
  import { fly, fade } from 'svelte/transition';

  $: toasts = $toastStore;
</script>

<div class="toast-container" aria-live="polite">
  {#each toasts as toast (toast.id)}
    <div
      class="toast toast-{toast.type}"
      transition:fly={{ y: 50, duration: 300 }}
      role="alert"
    >
      <span class="toast-icon">{toast.icon}</span>
      <span class="toast-message">{toast.message}</span>
      <button class="toast-close" on:click={() => toastStore.dismiss(toast.id)}>✕</button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 400px;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    background: var(--bg-card);
    border: 1px solid var(--border);
    font-size: 13px;
    backdrop-filter: blur(12px);
  }
  .toast-success { border-left: 3px solid var(--accent); }
  .toast-error { border-left: 3px solid var(--danger); }
  .toast-warning { border-left: 3px solid var(--warning); }
  .toast-info { border-left: 3px solid var(--accent); }

  @media (max-width: 768px) {
    .toast-container {
      bottom: 80px; /* above player bar */
      left: 20px;
      right: 20px;
      max-width: none;
    }
  }
</style>
```

## Store

```typescript
// src/lib/stores/toast.ts
import { writable } from 'svelte/store';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let nextId = 0;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return {
    subscribe,
    show(message: string, type: Toast['type'] = 'info', duration = 3000) {
      const id = nextId++;
      const toast: Toast = { id, type, message, icon: icons[type], duration };
      update(toasts => [...toasts.slice(-2), toast]); // max 3
      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration);
      }
    },
    dismiss(id: number) {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    success(msg: string) { this.show(msg, 'success'); },
    error(msg: string) { this.show(msg, 'error', 4000); },
    warning(msg: string) { this.show(msg, 'warning'); },
    info(msg: string) { this.show(msg, 'info'); },
  };
}

export const toast = createToastStore();
```

## Uso

```svelte
import { toast } from '$lib/stores/toast';

toast.success('Beat guardado');
toast.error('No se pudo subir');
toast.warning('Conexión lenta');
toast.info('3 beats nuevos');
```

---

## Casos de uso comunes

| Evento | Toast |
|--------|-------|
| Beat guardado | `success('Beat guardado')` |
| Beat eliminado | `success('Beat eliminado')` |
| Audio no reproduce | `error('No se pudo reproducir')` |
| Upload falla | `error('Error al subir archivo')` |
| Firebase timeout | `warning('Conexión lenta, reintentando...')` |
| Link copiado | `success('Link copiado')` |
| Wishlist agregado | `success('Agregado a favoritos')` |
| Settings guardado | `success('Cambios guardados')` |
