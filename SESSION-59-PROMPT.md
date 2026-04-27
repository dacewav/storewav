# Session 59 — Pulir Session 58 + Hardcoded cleanup + Featured fix

Leé memory/2026-04-27.md para contexto completo.

Stack: SvelteKit 2 + Firebase RTDB + Cloudflare Pages/Workers + R2 (bucket: dace-beats, CDN: cdn.dacewav.store)

Session 58 commiteó varios fixes y features pero **no se probaron bien**. Necesitan pulido.

## 🔴 CRÍTICO — Pulir implementaciones de Session 58

1. **Auth tokens en REST calls** — verificar end-to-end que notifications, wishlist, likes, comments funcionan con las reglas Firebase. Testear en browser: like, dislike, comment, wishlist toggle, notification mark as read.
2. **Wishlist per-account isolation** — testear: login usuario A → agregar beats → logout → login usuario B → verificar que NO ve los beats de A. Verificar que el badge (1) desaparece al vaciar.
3. **Emoji picker en comments** — testear: escribir `:` + nombre de emoji → autocomplete funciona? El picker se posiciona bien? El emoji se inserta en el cursor? Verificar que emojis custom se renderizan en comments existentes.
4. **FedCM** — testear en browser: ¿IdentityCredential se detecta? ¿Fallback a GSI funciona? ¿Login con Google funciona?
5. **BeatCard like count** — verificar que `likeCounts` store se actualiza sin el componente LikeButton. El conteo ❤️ N aparece en las cards?

## 🔴 CRÍTICO — Nuevos fixes

6. **Hardcoded FIREBASE_DB** — `https://dacewav-store-3b0f5-default-rtdb.firebaseio.com` repetido en ~15 archivos. Crear `$lib/firebaseDb.ts` con constante compartida y reemplazar todos los imports.
7. **Hardcoded brand name** — `'DACEWAV'` como fallback en ~10 archivos. Usar `settings.data?.brand?.name ?? 'DACEWAV'` consistentemente.
8. **Featured section muestra 0 beats** — Firebase tiene beats con `featured: true` pero no aparecen. Investigar `beatsList` derived store y el filter en `+page.svelte`.

## 🟡 ALTA

9. **Cron abandoned carts** — adapter-cloudflare no soporta `scheduled`. Crear `src/worker.ts` custom entry que maneje fetch + scheduled, O configurar servicio externo.
10. **Admin notification broadcasts** — `notifyWishlistDiscount` etc. necesitan token admin para funcionar con reglas Firebase.
11. **R2 bucket** — verificar en Cloudflare dashboard: acceso público + dominio cdn.dacewav.store.

## 🟢 LOW

12. Beats sin imageUrl (Corrido Tumbado, Humo)
13. Deleted beats visible en admin list
14. Plays no incrementan

## Test plan
```bash
cd /root/.openclaw/workspace/storewav
npm run build && npm test   # 197 tests
npm run dev -- --host 0.0.0.0 --port 5173
# En browser:
# 1. Login con Google
# 2. Like/unlike un beat → verificar count en card
# 3. Agregar a wishlist → verificar badge
# 4. Comentar con :emoji: → verificar picker y render
# 5. Logout → login otra cuenta → verificar wishlist independiente
# 6. Admin → notifications → enviar broadcast
```

⚠️ Copiar .env con Firebase keys antes de npm run dev
