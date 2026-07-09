#!/bin/bash
# Script pour démarrer l'application complète (frontend + backend)

# Obtenir le chemin absolu du dossier actuel
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "Starting backend server..."
cd "$DIR/server"
node server.js &
BACKEND_PID=$!

sleep 2

echo "Backend started. Starting frontend..."
cd "$DIR"
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
wait $BACKEND_PID