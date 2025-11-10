import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { config } from '../config.js';
import EmailService from '../services/email.service.js';
import User from '../models/user.model.js';

export const register = async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        console.log('🔍 Intentando registro para:', email);
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ Email ya registrado');
            return res.status(400).json({ 
                error: 'El email ya está registrado',
                field: 'email'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const userData = {
            email,
            password: passwordHash,
            name: name || 'Usuario',
            lastName: req.body.lastName || '',
            phone: req.body.phone || '',
            role: role || 'user',
            isActive: true
        };
        
        console.log('💾 Creando usuario...');
        const userSave = new User(userData);
        await userSave.save();
        console.log('✅ Usuario creado exitosamente');
        
        const token = generateToken(userSave._id);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days to match JWT expiration
        });
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token: token,
            user: {
                id: userSave._id,
                name: userSave.name,
                email: userSave.email,
                role: userSave.role,
                createdAt: userSave.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error al registrar el usuario:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'El email ya está registrado',
                field: 'email'
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: 'Error de validación',
                details: errors
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al registrar el usuario' 
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔍 Intentando login para:', email);
                                                                                                                                                                                                                                                                                                                                                                                                                        
    try {
        const userFound = await User.findOne({ email });
        console.log('👤 Usuario encontrado:', userFound ? 'Sí' : 'No');
        
        if (!userFound) {
            console.log('❌ Usuario no encontrado');
            return res.status(400).json({ 
                error: 'Credenciales inválidas',
                field: 'email'
            });
        }

        console.log('🔐 Comparando contraseñas...');
        const isMatch = await bcrypt.compare(password, userFound.password);
        console.log('✅ Contraseña válida:', isMatch);
        
        if (!isMatch) {
            console.log('❌ Contraseña incorrecta');
            return res.status(400).json({ 
                error: 'Credenciales inválidas',
                field: 'password'
            });
        }

        const token = generateToken(userFound._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days to match JWT expiration
        });

        console.log('✅ Login exitoso');
        res.json({
            message: 'Inicio de sesión exitoso',
            token: token,
            user: {
                id: userFound._id,
                name: userFound.name,
                email: userFound.email,
                role: userFound.role,
                createdAt: userFound.createdAt
            }
        });
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al iniciar sesión' 
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie('token', "", {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });
        
        return res.status(200).json({ 
            message: 'Sesión cerrada correctamente' 
        });
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al cerrar sesión' 
        });
    }
};

export const profile = async (req, res) => {
    try {
        const userFound = await User.findById(req.user._id).select('-password');
        if (!userFound) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }
        
        // Generar URL del avatar si existe
        let avatarUrl = null;
        if (userFound.avatar) {
            const { getAvatarUrl } = await import('../middlewares/upload.js');
            avatarUrl = getAvatarUrl(req, userFound.avatar);
        }

        return res.json({
            user: {
                id: userFound._id,
                name: userFound.name,
                email: userFound.email,
                role: userFound.role,
                phone: userFound.phone,
                location: userFound.location,
                bio: userFound.bio,
                avatar: avatarUrl,
                servicios: userFound.servicios,
                descripcion: userFound.descripcion,
                contacto: userFound.contacto,
                createdAt: userFound.createdAt,
                updatedAt: userFound.updatedAt
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener perfil' 
        });
    }
};

export const updateProfile = async (req, res) => {
    const { name, email, phone, location, bio } = req.body;

    try {
        const userFound = await User.findById(req.user._id);
        if (!userFound) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        // Verificar si el email ya existe en otro usuario
        if (email && email !== userFound.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    error: 'El email ya está registrado por otro usuario',
                    field: 'email'
                });
            }
        }

        // Actualizar campos permitidos
        if (name) userFound.name = name;
        if (email) userFound.email = email;
        if (phone !== undefined) userFound.phone = phone;
        if (location !== undefined) userFound.location = location;
        if (bio !== undefined) userFound.bio = bio;

        const updatedUser = await userFound.save();
        
        return res.json({
            message: 'Perfil actualizado correctamente',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                location: updatedUser.location,
                bio: updatedUser.bio,
                avatar: updatedUser.avatar,
                servicios: updatedUser.servicios,
                descripcion: updatedUser.descripcion,
                contacto: updatedUser.contacto,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });
    } catch (error) {
        console.error('❌ Error al actualizar perfil:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'El email ya está registrado por otro usuario',
                field: 'email'
            });
        }
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: 'Error de validación',
                details: errors
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al actualizar perfil' 
        });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No se proporcionó ningún archivo' 
            });
        }

        const userFound = await User.findById(req.user._id);
        if (!userFound) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        // Eliminar avatar anterior si existe
        if (userFound.avatar) {
            const { deleteOldAvatar } = await import('../middlewares/upload.js');
            deleteOldAvatar(userFound.avatar);
        }

        // Actualizar avatar del usuario
        userFound.avatar = req.file.filename;
        await userFound.save();

        // Generar URL del avatar
        const { getAvatarUrl } = await import('../middlewares/upload.js');
        const avatarUrl = getAvatarUrl(req, req.file.filename);

        return res.json({
            message: 'Avatar actualizado correctamente',
            avatar: avatarUrl,
            user: {
                id: userFound._id,
                name: userFound.name,
                email: userFound.email,
                role: userFound.role,
                phone: userFound.phone,
                location: userFound.location,
                bio: userFound.bio,
                avatar: avatarUrl,
                createdAt: userFound.createdAt,
                updatedAt: userFound.updatedAt
            }
        });
    } catch (error) {
        console.error('❌ Error al subir avatar:', error);
        
        res.status(500).json({ 
            error: 'Error interno del servidor al subir avatar' 
        });
    }
};


 