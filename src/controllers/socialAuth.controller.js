/**
 * Controlador de Autenticación Social
 */

import socialAuthService from '../services/socialAuth.service.js';
import auditService from '../services/audit.service.js';

/**
 * Login con Google
 */
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google requerido'
      });
    }

    const result = await socialAuthService.loginWithGoogle(idToken);

    if (result.success) {
      // Registrar evento de auditoría
      auditService.logEvent({
        level: 'info',
        category: 'authentication',
        action: 'google_login_success',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: result.user.id,
        details: { provider: 'google' }
      });

      // Configurar cookie de autenticación
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      res.json(result);
    } else {
      // Registrar evento de auditoría
      auditService.logEvent({
        level: 'warning',
        category: 'authentication',
        action: 'google_login_failed',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: result.message }
      });

      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Google login controller error:', error);
    
    // Registrar evento de auditoría
    auditService.logEvent({
      level: 'error',
      category: 'authentication',
      action: 'google_login_error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: { error: error.message }
    });

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Login con Facebook
 */
export const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Token de acceso de Facebook requerido'
      });
    }

    const result = await socialAuthService.loginWithFacebook(accessToken);

    if (result.success) {
      // Registrar evento de auditoría
      auditService.logEvent({
        level: 'info',
        category: 'authentication',
        action: 'facebook_login_success',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: result.user.id,
        details: { provider: 'facebook' }
      });

      // Configurar cookie de autenticación
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      });

      res.json(result);
    } else {
      // Registrar evento de auditoría
      auditService.logEvent({
        level: 'warning',
        category: 'authentication',
        action: 'facebook_login_failed',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: result.message }
      });

      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Facebook login controller error:', error);
    
    // Registrar evento de auditoría
    auditService.logEvent({
      level: 'error',
      category: 'authentication',
      action: 'facebook_login_error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: { error: error.message }
    });

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Desconectar proveedor social
 */
export const disconnectProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.user._id;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Proveedor no válido'
      });
    }

    const result = await socialAuthService.disconnectSocialProvider(userId, provider);

    // Registrar evento de auditoría
    auditService.logEvent({
      level: 'info',
      category: 'authentication',
      action: 'social_provider_disconnected',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      details: { provider }
    });

    res.json(result);
  } catch (error) {
    console.error('Disconnect provider error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al desconectar proveedor'
    });
  }
};

/**
 * Obtener proveedores sociales del usuario
 */
export const getUserProviders = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await socialAuthService.getUserSocialProviders(userId);

    res.json(result);
  } catch (error) {
    console.error('Get user providers error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores sociales'
    });
  }
};

/**
 * Verificar si email es social
 */
export const checkSocialEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido'
      });
    }

    const result = await socialAuthService.isEmailSocial(email);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Check social email error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al verificar email social'
    });
  }
};