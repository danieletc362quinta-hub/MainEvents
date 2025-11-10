import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para avatares
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1 // Solo un archivo
    }
});

// Middleware para subir avatar
export const uploadAvatar = upload.single('avatar');

// Función para eliminar archivo de avatar anterior
export const deleteOldAvatar = (avatarPath) => {
    if (avatarPath && fs.existsSync(avatarPath)) {
        try {
            fs.unlinkSync(avatarPath);
            console.log('✅ Avatar anterior eliminado:', avatarPath);
        } catch (error) {
            console.error('❌ Error al eliminar avatar anterior:', error);
        }
    }
};

// Función para obtener la URL del avatar
export const getAvatarUrl = (req, filename) => {
    if (!filename) return null;
    return `${req.protocol}://${req.get('host')}/uploads/avatars/${filename}`;
};