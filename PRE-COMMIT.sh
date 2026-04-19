#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# PRE-COMMIT.sh — Validación antes de cada commit
# Uso: bash PRE-COMMIT.sh
# Si falla → NO commitear. Arreglar primero.
# ═══════════════════════════════════════════════════════════════

set -e

ERRORS=0
WARNINGS=0

echo "═══════════════════════════════════════════════"
echo "  PRE-COMMIT CHECK"
echo "═══════════════════════════════════════════════"
echo ""

# 1. Verificar que estamos en el repo correcto
if [ ! -f "PROJECT_STATE.md" ]; then
    echo "❌ No estás en el directorio del proyecto (falta PROJECT_STATE.md)"
    exit 1
fi

# 2. Build check
echo -n "  🔨 Build ... "
if npm run build > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌ FALLÓ"
    ERRORS=$((ERRORS + 1))
    echo "     → Ejecuta 'npm run build' para ver el error"
fi

# 3. Verificar que .env NO se va a commitear
echo -n "  🔐 .env protegido ... "
if git diff --cached --name-only 2>/dev/null | grep -q "\.env$"; then
    echo "❌ .env está staged para commit!"
    ERRORS=$((ERRORS + 1))
    echo "     → Ejecuta: git reset HEAD .env"
else
    echo "✅"
fi

# 4. Verificar que dist/ NO se va a commitear
echo -n "  📦 dist/ no commiteado ... "
if git diff --cached --name-only 2>/dev/null | grep -q "^dist/"; then
    echo "⚠️  dist/ está staged"
    WARNINGS=$((WARNINGS + 1))
    echo "     → dist/ debería estar en .gitignore"
else
    echo "✅"
fi

# 5. Verificar que node_modules/ NO se va a commitear
echo -n "  📚 node_modules/ no commiteado ... "
if git diff --cached --name-only 2>/dev/null | grep -q "^node_modules/"; then
    echo "❌ node_modules/ está staged!"
    ERRORS=$((ERRORS + 1))
    echo "     → Ejecuta: git reset HEAD node_modules/"
else
    echo "✅"
fi

# 6. Verificar que PROJECT_STATE.md fue actualizado
echo -n "  📋 PROJECT_STATE.md actualizado ... "
if git diff --cached --name-only 2>/dev/null | grep -q "PROJECT_STATE.md"; then
    echo "✅"
else
    echo "⚠️  No está en el commit"
    WARNINGS=$((WARNINGS + 1))
    echo "     → ¿Actualizaste el progreso en PROJECT_STATE.md?"
fi

# 7. Verificar que no hay Firebase keys hardcodeadas
echo -n "  🔑 Sin keys hardcodeadas ... "
if git diff --cached -U0 2>/dev/null | grep -qi "AIzaSy[A-Za-z0-9_-]"; then
    echo "⚠️  Posible Firebase key en el diff"
    WARNINGS=$((WARNINGS + 1))
    echo "     → Verifica que no sea en .env (solo en código fuente es ok para Firebase client keys)"
else
    echo "✅"
fi

# 8. Verificar que hay algo para commitear
echo -n "  📝 Hay cambios para commit ... "
if [ -z "$(git diff --cached --name-only 2>/dev/null)" ]; then
    echo "⚠️  No hay nada staged"
    WARNINGS=$((WARNINGS + 1))
    echo "     → Ejecuta: git add -A"
else
    CHANGED=$(git diff --cached --name-only 2>/dev/null | wc -l)
    echo "✅ ($CHANGED archivos)"
fi

echo ""
echo "═══════════════════════════════════════════════"
if [ $ERRORS -gt 0 ]; then
    echo "  ❌ BLOQUEADO: $ERRORS error(es)"
    echo "  Arregla los errores antes de commitear."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "  ⚠️  $WARNINGS warning(s) — revisa pero puedes continuar"
    exit 0
else
    echo "  ✅ TODO OK — listo para commitear"
    exit 0
fi
