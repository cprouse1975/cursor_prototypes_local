#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node node_modules/md-to-pdf/dist/cli.js docs/cross-border-scoping-plan.md --config-file docs/.md-to-pdf.js
echo "Generated docs/cross-border-scoping-plan.pdf"
