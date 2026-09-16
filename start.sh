#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/flask_app"
FRONTEND_DIR="$ROOT_DIR/react_app"

cleanup() {
  trap - EXIT INT TERM
  kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use --silent --prefix "$FRONTEND_DIR"
fi

command -v python3 >/dev/null || { echo "No se encontró python3." >&2; exit 1; }
command -v node >/dev/null || { echo "No se encontró Node.js." >&2; exit 1; }
command -v npm >/dev/null || { echo "No se encontró npm." >&2; exit 1; }

echo "Preparando backend Flask..."
cd "$BACKEND_DIR"
if [[ ! -x .venv/bin/python ]]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Iniciando Flask en http://localhost:5000"
python index.py &
BACKEND_PID=$!

echo "Preparando frontend Vite..."
cd "$FRONTEND_DIR"
npm ci

echo "Iniciando Vite en http://localhost:3000"
npm run start -- --host 0.0.0.0 --port 3000 --strictPort &
FRONTEND_PID=$!

echo "Aplicación iniciada. Pulsa Ctrl+C para detener ambos procesos."
wait -n "$BACKEND_PID" "$FRONTEND_PID"
