import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import {
  googleLogin,
  facebookLogin,
  disconnectProvider,
  getUserProviders,
  checkSocialEmail
} from '../controllers/socialAuth.controller.js';

const router = Router();

// Rutas públicas
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.get('/check-email', checkSocialEmail);

// Rutas que requieren autenticación
router.get('/providers', authRequired, getUserProviders);
router.delete('/providers/:provider', authRequired, disconnectProvider);

export default router;