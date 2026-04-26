# Session 42 Prompt — Emoji Picker Fix

Pegar esto al inicio del próximo chat:

---

Leé estos archivos en orden:
1. .guide/INDEX.md
2. .guide/PROJECT_STATE.md  
3. .guide/BLOCK-CONTEXT.md

Contexto rápido:
- SvelteKit 2 + Firebase RTDB + Cloudflare Pages + Workers
- Tienda de beats — uploads migrados a R2 (cdn.dacewav.store), 134 tests, build limpio
- Admin: 20 páginas, 100+ controles
- Sesión 41 completada: FileUpload + emoji system + audio fix

BUGS A ARREGLAR:
1. **Emoji picker click no inserta** — al escribir `:` y clickear un emoji, NO se autorellena el texto. 3 intentos fallidos (click → mousedown → container preventDefault). Solución: usar `onmousedown` directamente en cada botón de emoji con preventDefault + llamar a onselect.
2. **Preview del emoji no se muestra** — después de seleccionar, la preview renderizada no aparece debajo del input. Verificar que `$customEmojis` tiene datos.
3. **Preview de emojis en picker** — verificar que las imágenes cargan correctamente.

Archivos clave:
- `src/lib/components/EmojiPicker.svelte`
- `src/lib/components/EmojiInput.svelte`
- `src/lib/emojiUtils.ts`
- `src/lib/stores/customEmojis.ts`

Para acceder al admin:
npm install && npm run dev
→ http://localhost:5173/login → "🧪 Entrar como tester (anónimo)"

Leé la guía, verifica el estado, y espera mi OK antes de codear.
