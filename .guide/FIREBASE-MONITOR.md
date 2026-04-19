# 📊 FIREBASE-MONITOR.md — Cuotas, Límites y Monitoreo

> Firebase tiene límites gratuitos. Si los superas, la tienda se cae.
> Este archivo documenta los límites y cómo monitorearlos.

---

## Límites de Firebase Realtime Database (Spark/Blaze plan)

| Recurso | Límite Spark (gratis) | Límite Blaze (pago) |
|---------|----------------------|---------------------|
| Conexiones simultáneas | 100 | 200,000 |
| Almacenamiento | 1 GB | Sin límite (pagas por GB) |
| Transferencia descarga/mes | 10 GB | Sin límite (pagas por GB) |
| Transferencia subida/mes | 10 GB | Sin límite |
| Operaciones de escritura/día | Sin límite | Sin límite |
| Operaciones de lectura/día | Sin límite | Sin límite |

## Límites de Firebase Storage

| Recurso | Límite Spark | Límite Blaze |
|---------|-------------|-------------|
| Almacenamiento | 5 GB | Sin límite |
| Descargas/mes | 1 GB | Sin límite |
| Subidas/mes | Sin límite | Sin límite |

## Límites de Firebase Auth

| Recurso | Límite |
|---------|--------|
| Usuarios verificados/mes | Sin límite (10k/día con phone auth) |
| Auth con email/password | Sin límite |
| Auth con Google | Sin límite |

---

## ¿Cuándo preocuparse?

### Tienda (lectura pública)
- **100 conexiones simultáneas** = ~100 visitantes al mismo tiempo
- Si tienes >100 visitantes concurrentes → necesitas Blaze plan
- Monitorear en: Firebase Console → Realtime Database → Usage

### Admin (escritura)
- Las operaciones de admin son pocas (unas 50/día máximo)
- No preocupante

### Storage (audios, covers)
- Si cada beat tiene: cover (200KB) + audio preview (3MB) + audio full (15MB)
- 50 beats = ~900MB (dentro del límite de 5GB gratis)
- Si creces a 200+ beats → necesitas Blaze plan

---

## Monitoreo

### Checks automáticos (en BOOTSTRAP.sh)

```bash
# Verificar que Firebase responde
curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/.json?shallow=true" | head -c 100
```

### Manual (mensual)

1. Ir a Firebase Console → Usage and billing
2. Verificar:
   - Realtime Database connections (¿cerca de 100?)
   - Storage usage (¿cerca de 5GB?)
   - Bandwidth usage (¿cerca de 10GB/mes?)

### Alertas

Si ves alguno de estos:
- 🔴 Conexiones > 80 → considerar Blaze plan
- 🔴 Storage > 4GB → considerar Blaze plan o limpiar
- 🔴 Bandwidth > 8GB/mes → optimizar assets, usar CDN

---

## Optimizaciones para no exceder cuotas

| Optimización | Impacto |
|-------------|---------|
| Lazy loading de imágenes | Reduce bandwidth |
| Comprimir audio previews a 128kbps | Reduce storage y bandwidth |
| Usar R2 para audio (no Firebase Storage) | Reduce cuotas de Firebase |
| Limitar listeners activos | Reduce conexiones |
| Cerrar listeners en onDestroy | Evita conexiones fantasma |
| Cache de waveforms en localStorage | Reduce lecturas repetidas |
| `limitToLast()` en queries grandes | Reduce datos transferidos |
