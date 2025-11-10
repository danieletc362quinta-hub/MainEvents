import mongoose from 'mongoose';
import { config } from './config.js';
import memoryDB from './db-memory.js';

export async function connectdb() {
  try {
    // Si se debe usar la base de datos en memoria
    if (config.USE_MEMORY_DB) {
      console.log('💾 Using memory database for development');
      return memoryDB;
    }

    // Desconectar cualquier conexión existente
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔄 Disconnected existing MongoDB connection');
    }
    
    // Configuración optimizada de conexión
    const mongooseOptions = {
      // Pool de conexiones
      maxPoolSize: 10, // Máximo 10 conexiones en el pool
      minPoolSize: 2,  // Mínimo 2 conexiones siempre activas
      maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30 segundos
      
      // Configuración de rendimiento
      bufferCommands: true, // Buffer de comandos para mejor rendimiento
      
      // Configuración de timeouts
      serverSelectionTimeoutMS: 5000, // 5 segundos para seleccionar servidor
      socketTimeoutMS: 45000, // 45 segundos timeout de socket
      connectTimeoutMS: 10000, // 10 segundos para conectar
      
      // Configuración de heartbeat
      heartbeatFrequencyMS: 10000, // Heartbeat cada 10 segundos
      
      // Configuración de retry
      retryWrites: true,
      retryReads: true,
      
      // Configuración de compresión
      compressors: ['zlib'],
      
      // Configuración de SSL (para producción)
      ...(config.NODE_ENV === 'production' && {
        ssl: true,
        sslValidate: true,
      }),
    };

    console.log('🔗 Connecting to MongoDB:', config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB connected successfully');
    
    // Configurar eventos de conexión
    mongoose.connection.on('connected', () => {
      console.log('🔗 MongoDB connection established');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Configurar eventos de proceso
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    mongoose.connection.on('close', () => {
      console.log('🔒 MongoDB connection closed');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Re-lanzar el error para que el servidor lo maneje
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
