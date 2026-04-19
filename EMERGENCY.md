# 🚨 EMERGENCY.md — Recuperación de Emergencia

> Si el proyecto se corrompe, el build no funciona, o algo salió MUY mal.
> Sigue estos pasos en orden.

---

## Nivel 1: Build roto

```bash
# 1. Ver qué pasó
npm run build 2>&1 | tail -20

# 2. Si es un error de import/typo → arreglar el archivo

# 3. Si no está claro → reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Nivel 2: Git descompuesto

```bash
# 1. Ver estado
git status
git log --oneline -5

# 2. Si hay cambios sin commitear que rompen todo
git stash

# 3. Si el último commit rompió todo
git reset --soft HEAD~1    # Deshacer commit, conservar cambios
# o
git revert HEAD            # Crear nuevo commit que revierte el anterior

# 4. Si remote tiene cambios que no tenemos
git pull origin main --rebase
```

## Nivel 3: Firebase no responde

```bash
# 1. Verificar que las keys son correctas
cat .env

# 2. Verificar en Firebase Console que el proyecto existe
# → https://console.firebase.google.com/project/dacewav-store-3b0f5

# 3. Verificar reglas de seguridad (no estén bloqueando todo)
# → Firebase Console → Realtime Database → Rules

# 4. Si cambiaste las keys → reiniciar el dev server
# Ctrl+C y npm run dev de nuevo
```

## Nivel 4: Todo destruido (reset total)

```bash
# 1. Hacer backup del trabajo actual
cp -r . ../store-backup-$(date +%Y%m%d)

# 2. Clonar desde cero
cd ..
rm -rf store
git clone https://github.com/dacewav/store.git store
cd store

# 3. Reinstalar
npm install

# 4. Copiar .env desde el backup
cp ../store-backup-*/.env . 2>/dev/null || echo "⚠️  Recrear .env manualmente"

# 5. Verificar
npm run build

# 6. Continuar desde PROJECT_STATE.md
```

## Nivel 5: Firebase project destruido

```
Si el proyecto Firebase se eliminó o corrompió:
1. Crear nuevo proyecto en Firebase Console
2. Activar Realtime Database
3. Activar Authentication → Google
4. Activar Storage
5. Copiar la nueva config a .env
6. Actualizar PROJECT_STATE.md con el nuevo project ID
7. Notificar al usuario
```

---

## Prompt de emergencia

Si algo sale MUY mal y necesitas ayuda de la IA:

```
DACEWAV — EMERGENCIA. El proyecto está roto.
Estado actual: [describe qué pasó]
Error: [pega el error]
Último commit: [git log --oneline -1]
Último cambio: [qué estabas haciendo cuando se rompió]
No avances. Solo diagnostica y propone solución.
```
