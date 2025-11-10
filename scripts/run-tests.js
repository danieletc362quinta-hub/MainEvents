#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    log(`\n${colors.cyan}Running: ${command} ${args.join(' ')}${colors.reset}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
};

const runTests = async () => {
  try {
    log(`${colors.bright}${colors.blue}🧪 Starting MainEvents Test Suite${colors.reset}`);
    log(`${colors.yellow}================================${colors.reset}`);

    // Verificar que las dependencias estén instaladas
    log(`\n${colors.cyan}📦 Checking dependencies...${colors.reset}`);
    try {
      await runCommand('npm', ['list', '--depth=0']);
    } catch (error) {
      log(`${colors.red}❌ Dependencies not installed. Running npm install...${colors.reset}`);
      await runCommand('npm', ['install']);
    }

    // Ejecutar tests unitarios
    log(`\n${colors.cyan}🔬 Running unit tests...${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'test:unit']);
      log(`${colors.green}✅ Unit tests passed${colors.reset}`);
    } catch (error) {
      log(`${colors.red}❌ Unit tests failed${colors.reset}`);
      throw error;
    }

    // Ejecutar tests de integración
    log(`\n${colors.cyan}🔗 Running integration tests...${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'test:integration']);
      log(`${colors.green}✅ Integration tests passed${colors.reset}`);
    } catch (error) {
      log(`${colors.red}❌ Integration tests failed${colors.reset}`);
      throw error;
    }

    // Ejecutar tests de rendimiento
    log(`\n${colors.cyan}⚡ Running performance tests...${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'test:performance']);
      log(`${colors.green}✅ Performance tests passed${colors.reset}`);
    } catch (error) {
      log(`${colors.red}❌ Performance tests failed${colors.reset}`);
      throw error;
    }

    // Ejecutar tests de seguridad
    log(`\n${colors.cyan}🔒 Running security tests...${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'test:security']);
      log(`${colors.green}✅ Security tests passed${colors.reset}`);
    } catch (error) {
      log(`${colors.red}❌ Security tests failed${colors.reset}`);
      throw error;
    }

    // Ejecutar linting
    log(`\n${colors.cyan}🔍 Running code linting...${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'lint:check']);
      log(`${colors.green}✅ Code linting passed${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠️  Code linting issues found${colors.reset}`);
    }

    // Ejecutar análisis de seguridad
    log(`\n${colors.cyan}🛡️  Running security audit...${colors.reset}`);
    try {
      await runCommand('npm', ['audit', '--audit-level=moderate']);
      log(`${colors.green}✅ Security audit passed${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠️  Security vulnerabilities found${colors.reset}`);
    }

    // Generar reporte de cobertura
    log(`\n${colors.cyan}📊 Generating coverage report...${colors.reset}`);
    try {
      await runCommand('npm', ['run', 'test:coverage']);
      log(`${colors.green}✅ Coverage report generated${colors.reset}`);
    } catch (error) {
      log(`${colors.yellow}⚠️  Coverage report generation failed${colors.reset}`);
    }

    log(`\n${colors.bright}${colors.green}🎉 All tests completed successfully!${colors.reset}`);
    log(`${colors.yellow}================================${colors.reset}`);
    
    // Mostrar resumen
    log(`\n${colors.cyan}📋 Test Summary:${colors.reset}`);
    log(`  ✅ Unit Tests: Passed`);
    log(`  ✅ Integration Tests: Passed`);
    log(`  ✅ Performance Tests: Passed`);
    log(`  ✅ Security Tests: Passed`);
    log(`  ✅ Code Quality: Checked`);
    log(`  ✅ Security Audit: Completed`);
    
    log(`\n${colors.green}🚀 MainEvents is ready for production!${colors.reset}`);

  } catch (error) {
    log(`\n${colors.red}❌ Test suite failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
};

// Ejecutar tests
runTests();
