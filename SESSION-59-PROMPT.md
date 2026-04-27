# Session 59 — Hardcoded cleanup, Featured fix, Cron workaround, Admin polish

Leé memory/2026-04-27.md para contexto de Session 58.

Stack: SvelteKit 2 + Firebase RTDB + Cloudflare Pages/Workers + R2 (bucket: dace-beats, CDN: cdn.dacewav.store)

Session 58 completó:
- ✅ Auth tokens en todos los Firebase REST calls (notifications, wishlist, likes, comments)
- ✅ FedCM migration (oneTap.ts — detecta IdentityCredential, fallback a GSI)
- ✅ Cron config en wrangler.jsonc (0 */2 * * *)
- ✅ BeatCard — quitó LikeButton duplicado, solo wishlist heart
- ✅ Wishlist per-account isolation (localStorage trackea UID, Firebase = source of truth)
- ✅ Custom emojis en comments (renderEmojis + emoji picker con :shortcode: autocomplete)
- ✅ Build: 197/197 tests, commit fcc4889 pushed

🔴 CRÍTICO — Session 59:
1. **Hardcoded FIREBASE_DB** — `https://dacewav-store-3b0f5-default-rtdb.firebaseio.com` repetido en ~15 archivos. Crear `$lib/firebaseDb.ts` con constante compartida y reemplazar todos los imports.
2. **Hardcoded brand name** — `'DACEWAV'` como fallback en ~10 archivos. Usar `settings.data?.brand?.name ?? 'DACEWAV'` consistentemente.
3. **Featured section muestra 0 beats** — Firebase tiene beats con `featured: true` pero no aparecen. Investigar el `beatsList` derived store — puede que el `featured` filter en `+page.svelte` esté excluyendo los featured del grid principal Y no mostrándolos en la sección featured.

🟡 ALTA:
4. **Cron abandoned carts** — adapter-cloudflare no soporta `scheduled` en +server.ts. Opciones: (a) crear src/worker.ts custom entry que maneje fetch + scheduled, o (b) configurar servicio externo (cron-job.org) para pegar `/api/cron/abandoned-carts` cada 2h.
5. **Admin notification broadcasts** — `notifyWishlistDiscount` etc. se llaman desde admin panel client-side. Necesitan token del admin para funcionar con las reglas Firebase.
6. **R2 bucket config** — verificar en Cloudflare dashboard: acceso público + dominio cdn.dacewav.store.

🟢 LOW:
7. Beats sin imageUrl (Corrido Tumbado, Humo) — gradient placeholders
8. Deleted beats visible en admin list (trash section existe)
9. Plays no incrementan para la mayoría de beats

⚠️ Copiar .env con Firebase keys antes de npm run dev
