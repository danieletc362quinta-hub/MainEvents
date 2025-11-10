import app from './app.js'
import {connectdb} from './db.js'
import { config } from './config.js'
import SchedulerService from './services/scheduler.service.js'

async function startServer() {
  try {
    // Intentar conectar a MongoDB
    await connectdb();
    
    // Inicializar servicios avanzados
    console.log('🔧 Initializing advanced services...');
    
    // Inicializar tareas programadas
    SchedulerService.init();
    
    console.log('✅ Advanced services initialized');
  } catch (error) {
    console.log('⚠️ MongoDB no disponible. El servidor se iniciará sin base de datos.');
    console.log('📖 Consulta setup-mongodb.md para configurar MongoDB.');
    console.log('🔧 Las rutas de autenticación y eventos no funcionarán sin MongoDB.');
  }
  
  const server = app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(`📊 Health check: http://localhost:${config.PORT}/health`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🕐 Scheduled tasks: ${SchedulerService.isRunning ? 'Active' : 'Inactive'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully');
    
    // Detener tareas programadas
    SchedulerService.stopAllTasks();
    
    server.close(() => {
      console.log('📴 Process terminated');
    });
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  // No hacer exit(1) para que nodemon pueda reiniciar
});
