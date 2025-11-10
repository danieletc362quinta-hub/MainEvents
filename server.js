import app from './src/app.js';
import { config } from './src/config.js';
import monitoringService from './src/services/monitoring.service.js';
import recoveryService from './src/services/recovery.service.js';

const PORT = config.PORT || 4000;

// Inicializar servicios de monitoreo y recuperación
monitoringService.start();
recoveryService.initialize();

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${config.NODE_ENV}`);
  console.log(`📊 Monitoreo 24/7: Activo`);
  console.log(`🔄 Recuperación automática: Activa`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
  } else {
    console.error('❌ Error del servidor:', error);
  }
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  monitoringService.stop();
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  monitoringService.stop();
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  monitoringService.log('error', 'Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Intentar recuperación automática
  recoveryService.attemptRecovery('system', error, {
    type: 'uncaughtException'
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada:', reason);
  monitoringService.log('error', 'Unhandled promise rejection', {
    reason: reason.toString(),
    promise: promise.toString()
  });
  
  // Intentar recuperación automática
  recoveryService.attemptRecovery('system', new Error(reason), {
    type: 'unhandledRejection'
  });
});

export default server;
