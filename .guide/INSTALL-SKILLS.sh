#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# INSTALL-SKILLS.sh — Instala skills de diseño y utilidades
# Se ejecuta automáticamente desde BOOTSTRAP.sh
# Uso manual: bash INSTALL-SKILLS.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "  🎨 Instalando skills..."
echo ""

INSTALLED=0
FAILED=0
SKIPPED=0

# ─── Función para instalar skill ───
install_skill() {
    local name="$1"
    local cmd="$2"

    echo -n "  → $name ... "

    if eval "$cmd" > /dev/null 2>&1; then
        echo "✅"
        INSTALLED=$((INSTALLED + 1))
    else
        echo "⚠️  (continuando)"
        FAILED=$((FAILED + 1))
    fi
}

# ─── Verificar que clawhub/skillhub está disponible ───
if command -v skillhub &> /dev/null; then
    PKG_MGR="skillhub"
    echo "  📦 Usando: skillhub"
elif command -v npx &> /dev/null; then
    PKG_MGR="npx"
    echo "  📦 Usando: npx (skillhub vía npx)"
else
    echo "  ❌ No se encontró npx ni skillhub"
    echo "     Instala Node.js primero: https://nodejs.org"
    exit 1
fi

echo ""

# ═══════════════════════════════════════
# SKILLS DE DISEÑO (anti-generic AI slop)
# ═══════════════════════════════════════

echo "  ─── Skills de Diseño ───"

# 1. Frontend Design (steipete) — diseño production-grade, anti-AI-slop
install_skill "frontend-design (steipete)" \
    "$PKG_MGR skills add steipete/frontend-design"

# 2. Anthropic Frontend Design (qrucio) — versión extendida con design intelligence
install_skill "anthropic-frontend-design (qrucio)" \
    "$PKG_MGR skills add qrucio/anthropic-frontend-design"

echo ""

# ═══════════════════════════════════════
# SKILLS DE UTILIDADES
# ═══════════════════════════════════════

echo "  ─── Skills de Utilidades ───"

# 3. Composio — integración con 1000+ apps (GitHub, Firebase, etc.)
install_skill "composio" \
    "$PKG_MGR skills add composiohq/skills"

echo ""

# ═══════════════════════════════════════
# RECURSOS DE REFERENCIA (no son skills)
# ═══════════════════════════════════════

echo "  ─── Recursos de Referencia ───"

# Crear archivo de referencias que la IA puede consultar
REFS_FILE=".guide/docs/DESIGN-REFERENCES.md"
mkdir -p docs

cat > "$REFS_FILE" << 'EOF'
# 🎨 Referencias de Diseño

> Recursos que la IA debe consultar antes de diseñar componentes.
> Estos NO son skills — son listas de inspiración y mejores prácticas.

## Awesome Design Systems
https://github.com/alexpate/awesome-design-systems
- Lista curada de design systems de productos reales
- Útil para: inspiración de componentes, patrones de UI, tokens de diseño
- **Consultar cuando:** diseñes un componente nuevo o busques patrones

## Frontend Design Skills
- `steipete/frontend-design` — production-grade, anti-AI-slop
- `qrucio/anthropic-frontend-design` — con design intelligence tool
- Principio: NUNCA usar Inter, Roboto, Arial. SIEMPRE tipografía distintiva.

## Composio
https://docs.composio.dev/docs
- Conecta la IA con 1000+ apps (GitHub, Firebase, Gmail, etc.)
- Útil para: automatizaciones, webhooks, integraciones externas
- **Instalar con:** `npx skills add composiohq/skills`

## Reglas de Diseño para este Proyecto
1. Paleta: fondo oscuro (#0a0a0a), accent neón (#00ff88)
2. Fonts: Syne (display), Space Grotesk (body), DM Mono (mono)
3. NADA genérico — cada componente debe tener personalidad
4. Referenciar awesome-design-systems antes de diseñar
5. Seguir las guías de frontend-design skill para anti-slop
EOF

echo "  → Referencias guardadas en .guide/docs/DESIGN-REFERENCES.md ✅"
echo ""

# ═══════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════

echo "  ═══════════════════════════════════"
echo "  Skills instalados:  $INSTALLED"
if [ $FAILED -gt 0 ]; then
    echo "  Fallidos:           $FAILED (no bloqueante)"
fi
echo "  ═══════════════════════════════════"
echo ""
