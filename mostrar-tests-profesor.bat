@echo off
echo.
echo ========================================
echo    DEMOSTRACION DE TESTS - MAINEVENTS
echo    Evaluacion 26/09 - Para el Profesor
echo ========================================
echo.

echo [1/5] Verificando que el servidor este funcionando...
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ El servidor no esta funcionando. Iniciando servidor...
    start /B npm run dev
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Servidor funcionando correctamente
)
echo.

echo [2/5] Ejecutando tests unitarios...
echo ----------------------------------------
npm run test:unit
echo.

echo [3/5] Ejecutando tests de integracion...
echo ----------------------------------------
npm run test:integration
echo.

echo [4/5] Ejecutando tests con cobertura...
echo ----------------------------------------
npm run test:coverage
echo.

echo [5/5] Generando reporte para el profesor...
echo ----------------------------------------
node scripts/demo-tests-profesor.js
echo.

echo ========================================
echo    DEMOSTRACION COMPLETADA
echo ========================================
echo.
echo 📁 Archivos generados:
echo    - reports/test-report-*.html (Abrir en navegador)
echo    - reports/test-report-*.txt (Reporte de texto)
echo    - coverage/lcov-report/index.html (Cobertura detallada)
echo.
echo 🎯 Para mostrar al profesor:
echo    1. Abre reports/test-report-*.html en el navegador
echo    2. Muestra coverage/lcov-report/index.html
echo    3. Ejecuta: npm run test:watch (modo interactivo)
echo.
pause



