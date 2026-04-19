# 📂 dacewav-mega-guide — Índice

> Todo lo necesario para reconstruir DACEWAV.STORE desde cero.
> Copia estos archivos a tu repo `dacewav/store` antes de empezar.

---

## Cómo Usar

### Primer chat:
1. Copia `PROMPTS-LISTOS.md` → elige el prompt 🟡 PRIMERA VEZ → pégalo
2. La IA clona el repo, ejecuta `BOOTSTRAP.sh`, lee `BLOCK-CONTEXT.md`
3. Confirmas → la IA empieza a trabajar

### Chats siguientes:
1. Pega el prompt 🟢 DEFAULT de `PROMPTS-LISTOS.md`
2. La IA lee `BLOCK-CONTEXT.md` y sabe dónde quedamos
3. Continúa desde la última tarea pendiente

### Cuando algo falla:
1. Buscar en `ERRORES-COMUNES.md` primero
2. Si no está → prompt 🔴 REPARAR ERROR

---

## Archivos (37)

### Arranque y Prompts (3)
`PROMPTS-LISTOS.md` · `MEGA-PROMPT.md` · `QUICK-START.md`

### Memoria y Estado (5)
`PROJECT_STATE.md` · `BLOCK-CONTEXT.md` · `PROGRESS.md` · `CHANGELOG.md` · `LIVE-STATUS.md`

### Protocolos (5)
`PROTOCOLO-SESION.md` · `PROTOCOLO-TESTS.md` · `REVIEW-GUIDE.md` · `INTERRUPTION-HANDLER.md` · `TASK-RESUME.md`

### Seguridad y Control (5)
`GIT-SAFETY.md` · `ANTI-PATTERNS.md` · `DEPENDENCIES.md` · `PRE-COMMIT.sh` · `DEFINITION-OF-DONE.md`

### Datos y Referencias (4)
`TEST-DATA.md` · `PARKING-LOT.md` · `ERRORES-COMUNES.md` · `EMERGENCY.md`

### Arquitectura y Diseño (10)
`GUIA-COMPLETA.md` · `CATALOG-ANALYSIS.md` · `MIGRATION.md` · `ACCESSIBILITY.md` · `PERFORMANCE.md` · `LOADING-STATES.md` · `CONTENT-VERSIONING.md` · `MOBILE.md` · `TOAST-SYSTEM.md` · `SEO.md`

### Operaciones (3)
`FIREBASE-MONITOR.md` · `LARGE-CATALOG.md` · `KEYBOARD-SHORTCUTS.md`

### Scripts (2)
`BOOTSTRAP.sh` · `INSTALL-SKILLS.sh`

---

## Pasos para Empezar

```bash
# 1. Copia estos archivos a tu repo
cp -r dacewav-mega-guide/* /ruta/a/tu/store/

# 2. Haz el primer commit
cd /ruta/a/tu/store
git add -A
git commit -m "chore: project guide and state tracking"
git push origin main

# 3. Abre un chat nuevo con la IA
# 4. Pega el prompt 🟡 PRIMERA VEZ de PROMPTS-LISTOS.md
# 5. La IA hace el resto
```

---

*Listo. Cada chat nuevo leerá el estado y continuará donde quedó.*
