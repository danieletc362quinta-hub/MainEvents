/**
 * Servicio de Autenticación Social
 * 
 * Proporciona:
 * - Login con Google
 * - Login con Facebook
 * - Integración con sistema de usuarios existente
 * - Manejo de tokens y perfiles
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.js';

class SocialAuthService {
  constructor() {
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.facebookAppId = process.env.FACEBOOK_APP_ID;
    this.facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
    this.jwtSecret = process.env.JWT_SECRET;
  }

  /**
   * Verificar token de Google
   */
  async verifyGoogleToken(idToken) {
    try {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const { sub, email, name, picture, email_verified } = response.data;

      if (!email_verified) {
        throw new Error('Email no verificado por Google');
      }

      return {
        provider: 'google',
        providerId: sub,
        email,
        name,
        picture,
        verified: true
      };
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw new Error('Token de Google inválido');
    }
  }

  /**
   * Verificar token de Facebook
   */
  async verifyFacebookToken(accessToken) {
    try {
      const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
      const { id, email, name, picture } = response.data;

      return {
        provider: 'facebook',
        providerId: id,
        email,
        name,
        picture: picture?.data?.url,
        verified: true
      };
    } catch (error) {
      console.error('Error verifying Facebook token:', error);
      throw new Error('Token de Facebook inválido');
    }
  }

  /**
   * Buscar o crear usuario social
   */
  async findOrCreateSocialUser(profile) {
    try {
      // Buscar usuario existente por providerId
      let user = await User.findOne({
        $or: [
          { [`socialProviders.${profile.provider}.id`]: profile.providerId },
          { email: profile.email }
        ]
      });

      if (user) {
        // Actualizar información del proveedor social
        if (!user.socialProviders) {
          user.socialProviders = {};
        }
        
        user.socialProviders[profile.provider] = {
          id: profile.providerId,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          lastLogin: new Date()
        };

        // Actualizar avatar si no tiene uno
        if (!user.avatar && profile.picture) {
          user.avatar = profile.picture;
        }

        await user.save();
      } else {
        // Crear nuevo usuario
        user = new User({
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          verified: true,
          socialProviders: {
            [profile.provider]: {
              id: profile.providerId,
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
              lastLogin: new Date()
            }
          }
        });

        await user.save();
      }

      return user;
    } catch (error) {
      console.error('Error finding/creating social user:', error);
      throw new Error('Error al procesar usuario social');
    }
  }

  /**
   * Generar token JWT para usuario social
   */
  generateSocialToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      socialLogin: true
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  /**
   * Login con Google
   */
  async loginWithGoogle(idToken) {
    try {
      const profile = await this.verifyGoogleToken(idToken);
      const user = await this.findOrCreateSocialUser(profile);
      const token = this.generateSocialToken(user);

      return {
        success: true,
        message: 'Login con Google exitoso',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          verified: user.verified,
          socialProviders: user.socialProviders
        }
      };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.message || 'Error en login con Google'
      };
    }
  }

  /**
   * Login con Facebook
   */
  async loginWithFacebook(accessToken) {
    try {
      const profile = await this.verifyFacebookToken(accessToken);
      const user = await this.findOrCreateSocialUser(profile);
      const token = this.generateSocialToken(user);

      return {
        success: true,
        message: 'Login con Facebook exitoso',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          verified: user.verified,
          socialProviders: user.socialProviders
        }
      };
    } catch (error) {
      console.error('Facebook login error:', error);
      return {
        success: false,
        message: error.message || 'Error en login con Facebook'
      };
    }
  }

  /**
   * Desconectar proveedor social
   */
  async disconnectSocialProvider(userId, provider) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.socialProviders && user.socialProviders[provider]) {
        delete user.socialProviders[provider];
        await user.save();

        return {
          success: true,
          message: `Proveedor ${provider} desconectado exitosamente`
        };
      } else {
        return {
          success: false,
          message: `Proveedor ${provider} no está conectado`
        };
      }
    } catch (error) {
      console.error('Error disconnecting social provider:', error);
      return {
        success: false,
        message: 'Error al desconectar proveedor social'
      };
    }
  }

  /**
   * Obtener proveedores sociales del usuario
   */
  async getUserSocialProviders(userId) {
    try {
      const user = await User.findById(userId).select('socialProviders');
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        providers: user.socialProviders || {}
      };
    } catch (error) {
      console.error('Error getting user social providers:', error);
      return {
        success: false,
        message: 'Error al obtener proveedores sociales'
      };
    }
  }

  /**
   * Verificar si el email está asociado con proveedores sociales
   */
  async isEmailSocial(email) {
    try {
      const user = await User.findOne({ email }).select('socialProviders');
      if (!user || !user.socialProviders) {
        return { isSocial: false, providers: [] };
      }

      const providers = Object.keys(user.socialProviders);
      return {
        isSocial: providers.length > 0,
        providers
      };
    } catch (error) {
      console.error('Error checking social email:', error);
      return { isSocial: false, providers: [] };
    }
  }
}

const socialAuthService = new SocialAuthService();
export default socialAuthService;