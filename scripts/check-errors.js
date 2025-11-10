#!/usr/bin/env node

/**
 * Script para verificar errores comunes en el proyecto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Función para imprimir con colores
const print = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para verificar si un archivo existe
const fileExists = (filePath) => {
  return fs.existsSync(path.join(projectRoot, filePath));
};

// Función para leer un archivo
const readFile = (filePath) => {
  try {
    return fs.readFileSync(path.join(projectRoot, filePath), 'utf8');
  } catch (error) {
    return null;
  }
};

// Función para verificar imports
const checkImports = (filePath, content) => {
  const errors = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Verificar imports de archivos que no existen
    const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      
      // Verificar si es un import relativo
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const possibleExtensions = ['.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
        
        let found = false;
        for (const ext of possibleExtensions) {
          if (fileExists(resolvedPath + ext)) {
            found = true;
            break;
          }
        }
        
        if (!found && !importPath.includes('node_modules')) {
          errors.push({
            line: lineNum,
            message: `Import not found: ${importPath}`,
            type: 'import'
          });
        }
      }
    }
  });
  
  return errors;
};

// Función para verificar configuración de JWT
const checkJWTConfig = (content) => {
  const errors = [];
  
  // Verificar que se use config.JWT_SECRET consistentemente
  if (content.includes('JWT_SECRET') && !content.includes('config.JWT_SECRET')) {
    errors.push({
      message: 'JWT_SECRET should be accessed through config.JWT_SECRET',
      type: 'config'
    });
  }
  
  return errors;
};

// Función para verificar middlewares de autenticación
const checkAuthMiddleware = (content) => {
  const errors = [];
  
  // Verificar que se use el middleware correcto
  if (content.includes('validateToken') && !content.includes('auth.js')) {
    errors.push({
      message: 'Should use auth.js middleware instead of validateToken.js',
      type: 'middleware'
    });
  }
  
  return errors;
};

// Función principal
const main = () => {
  print('🔍 Verificando errores en el proyecto...', 'blue');
  print('=' * 50, 'blue');
  
  const filesToCheck = [
    'src/routes/dashboard.routes.js',
    'src/middlewares/auth.js',
    'src/controllers/auth.controller.js',
    'src/config.js',
    'src/utils/performance.js',
    'src/services/audit.service.js',
    'src/utils/i18n.js'
  ];
  
  let totalErrors = 0;
  
  filesToCheck.forEach(filePath => {
    print(`\n📁 Verificando: ${filePath}`, 'yellow');
    
    const content = readFile(filePath);
    if (!content) {
      print(`❌ No se pudo leer el archivo: ${filePath}`, 'red');
      totalErrors++;
      return;
    }
    
    const errors = [
      ...checkImports(filePath, content),
      ...checkJWTConfig(content),
      ...checkAuthMiddleware(content)
    ];
    
    if (errors.length === 0) {
      print(`✅ Sin errores encontrados`, 'green');
    } else {
      errors.forEach(error => {
        print(`❌ Línea ${error.line || 'N/A'}: ${error.message}`, 'red');
        totalErrors++;
      });
    }
  });
  
  // Verificar archivos faltantes
  print(`\n📁 Verificando archivos faltantes...`, 'yellow');
  
  const requiredFiles = [
    'src/utils/performance.js'
  ];
  
  requiredFiles.forEach(filePath => {
    if (fileExists(filePath)) {
      print(`✅ ${filePath} existe`, 'green');
    } else {
      print(`❌ ${filePath} no existe`, 'red');
      totalErrors++;
    }
  });
  
  // Resumen
  print(`\n${'=' * 50}`, 'blue');
  if (totalErrors === 0) {
    print('🎉 ¡No se encontraron errores!', 'green');
  } else {
    print(`⚠️  Se encontraron ${totalErrors} errores`, 'red');
  }
  
  process.exit(totalErrors > 0 ? 1 : 0);
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;
