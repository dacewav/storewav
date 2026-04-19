#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# BOOTSTRAP.sh — Ejecutar al inicio de CADA sesión de IA
# Uso: bash BOOTSTRAP.sh
# ═══════════════════════════════════════════════════════════════
#
# Este script:
# 1. Clona el repo si no existe
# 2. Lee PROJECT_STATE.md para saber dónde quedamos
# 3. Muestra el resumen del estado actual
# 4. Lista qué hay que hacer a continuación
#
# ═══════════════════════════════════════════════════════════════

set -e

REPO_URL="https://github.com/dacewav/store.git"
REPO_DIR="store"
BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "═══════════════════════════════════════════════"
echo "  DACEWAV.STORE — Bootstrap"
echo "═══════════════════════════════════════════════"
echo ""

# 1. Instalar skills ANTES de todo (si INSTALL-SKILLS.sh existe)
if [ -f "$SCRIPT_DIR/INSTALL-SKILLS.sh" ]; then
    echo "  🎨 Instalando skills de diseño..."
    bash "$SCRIPT_DIR/INSTALL-SKILLS.sh"
    echo ""
fi

# 2. Clonar si no existe

# 2.1 Pull si ya existe (git safety)
if [ -d "$REPO_DIR" ]; then
    echo "  🔄 Sincronizando con remote..."
    cd "$REPO_DIR"
    git pull origin main --rebase 2>/dev/null || echo "  ⚠️  No se pudo pull (trabajo local)"
    cd ..
fi

if [ ! -d "$REPO_DIR" ]; then
    echo "📦 Clonando repositorio..."
    git clone "$REPO_URL" "$REPO_DIR"
    echo "✅ Repo clonado"
else
    echo "📂 Repo ya existe, actualizando..."
    cd "$REPO_DIR"
    git pull origin "$BRANCH" 2>/dev/null || echo "⚠️  No se pudo pull (posible trabajo local)"
    cd ..
fi

cd "$REPO_DIR"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ESTADO DEL PROYECTO"
echo "═══════════════════════════════════════════════"

# 2. Leer estado
if [ -f "PROJECT_STATE.md" ]; then
    echo ""
    echo "📋 PROJECT_STATE.md encontrado"
    echo ""

    # Extraer bloque actual
    BLOQUE_ACTUAL=$(grep "bloque_actual:" PROJECT_STATE.md | head -1 | sed 's/.*bloque_actual: *"//' | sed 's/".*//')
    ULTIMA_TAREA=$(grep "ultima_tarea:" PROJECT_STATE.md | head -1 | sed 's/.*ultima_tarea: *"//' | sed 's/".*//')
    ULTIMO_CHAT=$(grep "ultimo_chat:" PROJECT_STATE.md | head -1 | sed 's/.*ultimo_chat: *"//' | sed 's/".*//')

    echo "  Bloque actual:   $BLOQUE_ACTUAL"
    echo "  Última tarea:    $ULTIMA_TAREA"
    echo "  Último chat:     $ULTIMO_CHAT"
    echo ""

    # Mostrar tareas pendientes del bloque actual
    echo "─────────────────────────────────────────────"
    echo "  TAREAS PENDIENTES DEL BLOQUE ACTUAL:"
    echo "─────────────────────────────────────────────"
    echo ""

    # Buscar líneas con [ ] (pendientes) del bloque actual
    grep -n '\[ \]' PROJECT_STATE.md | head -20 | while read -r line; do
        echo "  ⬜ $line"
    done

    echo ""
    echo "─────────────────────────────────────────────"
    echo ""
else
    echo "⚠️  PROJECT_STATE.md NO encontrado"
    echo "   El proyecto necesita setup inicial."
    echo "   Comenzar con Bloque 0: Setup del Proyecto"
fi

# 3. Verificar si npm install es necesario
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
    echo "✅ Dependencias instaladas"
    echo ""
fi

# 4. Verificar build
if [ -f "package.json" ]; then
    echo "🔨 Verificando build..."
    if npm run build > /dev/null 2>&1; then
        echo "✅ Build exitoso"
    else
        echo "❌ Build falló — revisar antes de continuar"
    fi
    echo ""
fi

# 5. Estado de git
echo "═══════════════════════════════════════════════"
echo "  GIT STATUS"
echo "═══════════════════════════════════════════════"
echo ""
git status --short
echo ""
echo "Últimos 3 commits:"
git log --oneline -3 2>/dev/null || echo "(sin commits aún)"
echo ""

# 6. Health Check de la Guía
echo "═══════════════════════════════════════════════"
echo "  HEALTH CHECK DE LA GUÍA"
echo "═══════════════════════════════════════════════"
echo ""

if [ -f "LIVE-STATUS.md" ]; then
    # Extraer métricas básicas
    VERSION=$(grep "guide_version:" LIVE-STATUS.md | head -1 | sed 's/.*: *"//' | sed 's/".*//')
    SESIONES=$(grep "total_sesiones:" LIVE-STATUS.md | head -1 | sed 's/.*: *//')
    UPDATES=$(grep "total_updates_guia:" LIVE-STATUS.md | head -1 | sed 's/.*: *//')

    echo "  Versión guía:     $VERSION"
    echo "  Sesiones totales: $SESIONES"
    echo "  Updates guía:     $UPDATES"
    echo ""

    # Verificar updates pendientes
    PENDING=$(grep "⬜" LIVE-STATUS.md | wc -l)
    if [ "$PENDING" -gt 0 ]; then
        echo "  ⚠️  $PENDING archivos de guía sin verificar"
        echo "  → Ejecutar check de INICIO (ver REVIEW-GUIDE.md)"
    else
        echo "  ✅ Guía verificada"
    fi
    echo ""

    # Mostrar updates pendientes si hay
    PENDING_UPDATES=$(grep "⏳" LIVE-STATUS.md | wc -l)
    if [ "$PENDING_UPDATES" -gt 0 ]; then
        echo "  📋 Updates pendientes en la guía:"
        grep "⏳" LIVE-STATUS.md | while read -r line; do
            echo "    $line"
        done
        echo ""
    fi
else
    echo "  ⚠️  LIVE-STATUS.md no encontrado"
    echo "  → Crear con la estructura base"
fi

# 8. Progreso visual rápido
echo "═══════════════════════════════════════════════"
echo "  PROGRESO"
echo "═══════════════════════════════════════════════"
echo ""

if [ -f "PROGRESS.md" ]; then
    # Extraer barra de bloques
    grep "BLOQUES:" PROGRESS.md | head -1 | sed 's/^/  /'
    grep "TAREAS:" PROGRESS.md | head -1 | sed 's/^/  /'
    grep "ESTADO:" PROGRESS.md | head -1 | sed 's/^/  /'
else
    echo "  ⬜ Proyecto no iniciado"
fi
echo ""

# 9. Verificar parking lot de ideas
echo "═══════════════════════════════════════════════"
echo "  PARKING LOT (ideas en espera)"
echo "═══════════════════════════════════════════════"
echo ""

if [ -f "PARKING-LOT.md" ]; then
    PENDING_IDEAS=$(grep -c "⏳" PARKING-LOT.md 2>/dev/null || echo "0")
    if [ "$PENDING_IDEAS" -gt 0 ]; then
        echo "  💡 $PENDING_IDEAS idea(s) pendiente(s):"
        grep "⏳" PARKING-LOT.md | while read -r line; do
            echo "    $line"
        done
    else
        echo "  (vacío)"
    fi
else
    echo "  (no existe aún)"
fi
echo ""

echo "═══════════════════════════════════════════════"
echo "  LISTO PARA TRABAJAR"
echo "═══════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo "  1. Lee BLOCK-CONTEXT.md (contexto del bloque actual — RÁPIDO)"
echo "  2. Si necesitas más detalle → PROJECT_STATE.md"
echo "  3. Revisa LIVE-STATUS.md → health check de guía"
echo "  4. Toma UNA tarea a la vez"
echo "  5. Hazla, TESTÉALA, verifica que funciona"
echo "  6. Ejecuta: bash PRE-COMMIT.sh (validación)"
echo "  7. Actualiza PROJECT_STATE.md + BLOCK-CONTEXT.md"
echo "  8. Haz commit"
echo "  9. Al cerrar: ejecutar REVIEW-GUIDE.md"
echo ""
