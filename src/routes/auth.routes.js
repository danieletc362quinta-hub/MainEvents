import {Router} from 'express'
import { register, login, logout, profile, updateProfile, uploadAvatar } from '../controllers/auth.controller.js'
import {authRequired}  from '../middlewares/auth.js'
import { validateSchema } from "../middlewares/validator.middlewares.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js"; 
import { uploadAvatar as uploadMiddleware } from '../middlewares/upload.js';

const router = Router()

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout);
router.get('/profile', authRequired, profile); 
router.put('/profile', authRequired, updateProfile);
router.post('/profile/avatar', authRequired, uploadMiddleware, uploadAvatar);

export default router;