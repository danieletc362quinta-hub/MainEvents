# Script de Demostración de Tests para el Profesor
# MainEvents - Evaluación 26/09

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMOSTRACIÓN DE TESTS - MAINEVENTS" -ForegroundColor Cyan
Write-Host "   Evaluación 26/09 - Para el Profesor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar el servidor
function Test-Server {
    Write-Host "[1/6] Verificando que el servidor esté funcionando..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Servidor funcionando correctamente" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ El servidor no está funcionando. Iniciando servidor..." -ForegroundColor Red
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
        Start-Sleep -Seconds 5
        return $false
    }
}

# Función para ejecutar tests con colores
function Invoke-TestWithColors {
    param(
        [string]$TestType,
        [string]$Description
    )
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Blue
    Write-Host "$Description" -ForegroundColor Blue
    Write-Host "----------------------------------------" -ForegroundColor Blue
    
    try {
        $result = Invoke-Expression "npm run $TestType"
        Write-Host "✅ $TestType completado exitosamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error en $TestType" -ForegroundColor Red
        return $false
    }
}

# Función para mostrar estadísticas
function Show-TestStats {
    Write-Host ""
    Write-Host "📊 ESTADÍSTICAS DE TESTS" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    
    # Contar archivos de test
    $unitTests = (Get-ChildItem -Path "tests/unit" -Filter "*.test.js").Count
    $integrationTests = (Get-ChildItem -Path "tests/integration" -Filter "*.test.js").Count
    $performanceTests = (Get-ChildItem -Path "tests/performance" -Filter "*.test.js").Count
    
    Write-Host "📁 Tests Unitarios: $unitTests archivos" -ForegroundColor White
    Write-Host "🔗 Tests de Integración: $integrationTests archivos" -ForegroundColor White
    Write-Host "⚡ Tests de Rendimiento: $performanceTests archivos" -ForegroundColor White
    Write-Host ""
    
    # Mostrar archivos de test
    Write-Host "📋 ARCHIVOS DE TEST DISPONIBLES:" -ForegroundColor Yellow
    Write-Host "Tests Unitarios:" -ForegroundColor White
    Get-ChildItem -Path "tests/unit" -Filter "*.test.js" | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Gray
    }
    
    Write-Host "Tests de Integración:" -ForegroundColor White
    Get-ChildItem -Path "tests/integration" -Filter "*.test.js" | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Gray
    }
    
    Write-Host "Tests de Rendimiento:" -ForegroundColor White
    Get-ChildItem -Path "tests/performance" -Filter "*.test.js" | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Gray
    }
}

# Función para generar reporte simple
function New-TestReport {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $reportPath = "reports/test-demo-$timestamp.txt"
    
    # Crear directorio si no existe
    if (!(Test-Path "reports")) {
        New-Item -ItemType Directory -Path "reports" | Out-Null
    }
    
    $report = @"
REPORTE DE TESTS - MAINEVENTS
============================
Fecha: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
Proyecto: Plataforma de Gestión de Eventos
Evaluación: 26/09

TESTS DISPONIBLES
=================
Tests Unitarios: $((Get-ChildItem -Path "tests/unit" -Filter "*.test.js").Count)
- auth.test.js (Autenticación)
- audit.test.js (Sistema de Auditoría)
- help.test.js (Sistema de Ayuda)
- i18n.test.js (Internacionalización)
- responsive.test.js (Diseño Responsivo)
- security.test.js (Seguridad)

Tests de Integración: $((Get-ChildItem -Path "tests/integration" -Filter "*.test.js").Count)
- complete-system.test.js (Sistema Completo)
- events.test.js (Gestión de Eventos)

Tests de Rendimiento: $((Get-ChildItem -Path "tests/performance" -Filter "*.test.js").Count)
- load.test.js (Carga del Sistema)

FUNCIONALIDADES PROBADAS
========================
✅ Sistema de Autenticación (Login, Registro, JWT)
✅ Gestión de Eventos (CRUD completo)
✅ Sistema de Idiomas (Español/Inglés)
✅ Sistema de Ayuda (Tooltips, FAQs, Tutoriales)
✅ Diseño Responsivo (Móvil, Tablet, Desktop)
✅ Sistema de Auditoría (Bitácora de acciones)
✅ Seguridad (Validación, Sanitización)
✅ Rendimiento (Tests de carga)

COMANDOS PARA EJECUTAR TESTS
============================
npm run test              # Todos los tests
npm run test:unit         # Solo tests unitarios
npm run test:integration  # Solo tests de integración
npm run test:performance  # Solo tests de rendimiento
npm run test:coverage     # Con reporte de cobertura
npm run test:watch        # Modo watch (desarrollo)

DEMOSTRACIÓN PARA EL PROFESOR
=============================
1. Ejecutar: npm run test:coverage
2. Abrir: coverage/lcov-report/index.html
3. Mostrar: tests/unit/ (tests unitarios)
4. Mostrar: tests/integration/ (tests de integración)
5. Ejecutar: npm run test:watch (modo interactivo)
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "📄 Reporte generado: $reportPath" -ForegroundColor Green
    return $reportPath
}

# Función para mostrar comandos útiles
function Show-UsefulCommands {
    Write-Host ""
    Write-Host "🎯 COMANDOS ÚTILES PARA LA DEMOSTRACIÓN:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📊 Ver cobertura de código:" -ForegroundColor White
    Write-Host "   npm run test:coverage" -ForegroundColor Gray
    Write-Host "   Luego abrir: coverage/lcov-report/index.html" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Modo interactivo (recomendado para demo):" -ForegroundColor White
    Write-Host "   npm run test:watch" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 Ejecutar tests específicos:" -ForegroundColor White
    Write-Host "   npm run test:unit" -ForegroundColor Gray
    Write-Host "   npm run test:integration" -ForegroundColor Gray
    Write-Host "   npm run test:performance" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📁 Ver archivos de test:" -ForegroundColor White
    Write-Host "   dir tests\unit" -ForegroundColor Gray
    Write-Host "   dir tests\integration" -ForegroundColor Gray
    Write-Host "   dir tests\performance" -ForegroundColor Gray
}

# Ejecutar el script principal
try {
    # Verificar servidor
    Test-Server | Out-Null
    
    # Mostrar estadísticas
    Show-TestStats
    
    # Ejecutar tests
    Write-Host ""
    Write-Host "[2/6] Ejecutando tests unitarios..." -ForegroundColor Yellow
    Invoke-TestWithColors -TestType "test:unit" -Description "TESTS UNITARIOS"
    
    Write-Host ""
    Write-Host "[3/6] Ejecutando tests de integración..." -ForegroundColor Yellow
    Invoke-TestWithColors -TestType "test:integration" -Description "TESTS DE INTEGRACIÓN"
    
    Write-Host ""
    Write-Host "[4/6] Ejecutando tests de rendimiento..." -ForegroundColor Yellow
    Invoke-TestWithColors -TestType "test:performance" -Description "TESTS DE RENDIMIENTO"
    
    Write-Host ""
    Write-Host "[5/6] Ejecutando tests con cobertura..." -ForegroundColor Yellow
    Invoke-TestWithColors -TestType "test:coverage" -Description "TESTS CON COBERTURA"
    
    Write-Host ""
    Write-Host "[6/6] Generando reporte para el profesor..." -ForegroundColor Yellow
    $reportPath = New-TestReport
    
    # Mostrar comandos útiles
    Show-UsefulCommands
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    DEMOSTRACIÓN COMPLETADA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Archivos generados:" -ForegroundColor White
    Write-Host "   📄 Reporte: $reportPath" -ForegroundColor Cyan
    Write-Host "   📊 Cobertura: coverage/lcov-report/index.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎓 Para mostrar al profesor:" -ForegroundColor Yellow
    Write-Host "   1. Ejecuta: npm run test:coverage" -ForegroundColor White
    Write-Host "   2. Abre: coverage/lcov-report/index.html" -ForegroundColor White
    Write-Host "   3. Muestra: tests/unit/ y tests/integration/" -ForegroundColor White
    Write-Host "   4. Ejecuta: npm run test:watch (modo interactivo)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error durante la ejecución: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



