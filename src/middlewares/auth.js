import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/user.model.js';

export const authRequired = async (req, res, next) => {
  try {
    // Obtener token de cookies o headers
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No se ha encontrado el token - Acceso Denegado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Si hay error, continuar sin usuario autenticado
    next();
  }
};

export const adminRequired = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Acceso denegado - Se requieren permisos de administrador'
      });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de admin:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};
