# 🛡️ GIT-SAFETY.md — Reglas de Git entre Sesiones

> Cada chat empieza desde cero. Si dos chats trabajan a la vez o si no haces pull,
> hay conflictos. Estas reglas lo previenen.

---

## Reglas OBLIGATORIAS

### Antes de trabajar (en BOOTSTRAP):
```bash
git pull origin main --rebase   # Sincronizar con remote ANTES de tocar nada
```

### Después de cada tarea:
```bash
git add -A
git commit -m "feat: [descripción]"
git push origin main
```

### Si push falla (conflictos):
```
NO resolver conflictos automáticamente.
Mensaje al usuario:
  "⚠️ Conflicto de git. Otro chat o tú trabajaron en el mismo archivo.
   Necesito que resuelvas el conflicto manualmente.
   Archivos en conflicto: [lista]"
```

### NUNCA hacer:
- ❌ `git push --force` — puede perder trabajo de otro chat
- ❌ `git reset --hard` — sin preguntar al usuario
- ❌ Trabajar sin hacer pull primero
- ❌ Commitear sin ejecutar PRE-COMMIT.sh

---

## Si hay conflictos

### Protocolo:
1. NO intentar resolver automáticamente
2. Mostrar los archivos en conflicto al usuario
3. Esperar instrucciones
4. Si el usuario dice "usa mi versión": `git checkout --ours [archivo]`
5. Si el usuario dice "usa la del remote": `git checkout --theirs [archivo]`

---

## Rollback (deshacer último commit)

Si algo salió mal después de commitear:
```bash
# Deshacer último commit pero conservar cambios
git reset --soft HEAD~1

# Deshacer último commit y descartar cambios (PELIGROSO — solo con confirmación)
git reset --hard HEAD~1
```

**NUNCA ejecutar rollback sin confirmación explícita del usuario.**
