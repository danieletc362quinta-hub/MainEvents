import mongoose from 'mongoose';
import { config } from '../config.js';

const connectDB = async () => {
  try {
    const mongoURI = config.MONGODB_URI || 'mongodb://localhost:27017/MainEvents';
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Event listeners para monitoreo
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
    });

    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
