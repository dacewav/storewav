# 📂 .guide/ — Punto de Entrada

> **Leé esto primero en cualquier sesión nueva.**

---

## Qué hay en esta carpeta

| Archivo | Para qué | Cuándo leer |
|---------|----------|-------------|
| **AUDIT-MASTER.md** | Plan completo, reglas, protocolo, datos Firebase, archivos clave | Siempre — es la guía principal |
| **BLOCK-CONTEXT.md** | Qué sesión/bloque estamos, checklist actual | Después de AUDIT-MASTER — para saber qué hacer HOY |
| **REAL-AUDIT.md** | Mapeo exacto: qué lee el código vs qué tiene Firebase | Cuando necesitás entender por qué algo no funciona |
| **PROJECT_STATE.md** | Estado resumido del proyecto | Para contexto rápido |
| `_archive/` | Archivos viejos del proyecto anterior | No leer — es histórico |

---

## Orden de lectura en un chat nuevo

```
1. Este archivo (INDEX.md)          → 30 segundos
2. AUDIT-MASTER.md                  → 5 minutos (es largo pero esencial)
3. BLOCK-CONTEXT.md                 → 1 minuto (qué sesión toca)
4. REAL-AUDIT.md                    → 2 minutos (si hay que entender datos)
5. Empezar la sesión                → el resto del tiempo
```

---

## Resumen rápido (si no tenés tiempo de leer todo)

```
Proyecto:  SvelteKit + Cloudflare + Firebase RTDB
Repo:      dacewav/storewav
Firebase:  dacewav-store-3b0f5
Problema:  Firebase tiene estructura vieja (flat), código espera nueva (nested)
Solución:  Migration layer en settings.ts (ya hecho, necesita test)
Beats:     Vacíos en Firebase
Admin:     Funciona (lee adminWhitelist/{email})
Plan:      11 sesiones de 50 min → ver AUDIT-MASTER.md
Sesión:    Ver BLOCK-CONTEXT.md → qué sesión sigue
```

---

## Si algo sale mal

1. `npm run build` → ver el error
2. `npx svelte-check` → ver errores TypeScript
3. `curl -s "https://dacewav-store-3b0f5-default-rtdb.firebaseio.com/settings.json"` → ver datos Firebase
4. Git: `git stash` → `git reset --soft HEAD~1` si el commit rompió algo
