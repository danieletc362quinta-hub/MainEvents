#!/bin/bash
# render-build.sh

echo "🚀 Iniciando el proceso de construcción en Render..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir el frontend si es necesario
if [ -d "frontend" ]; then
  echo "🛠️ Construyendo el frontend..."
  cd frontend
  npm install
  npm run build
  cd ..
fi

echo "✅ Construcción completada"
