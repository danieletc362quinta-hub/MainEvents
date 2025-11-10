import { verifyToken } from '../libs/jwt.js';

export const authRequired = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        
        // Si no hay token en cookies, buscar en Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            console.log('🔍 Auth header:', authHeader);
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
                console.log('🔑 Token from header:', token.substring(0, 20) + '...');
            }
        } else {
            console.log('🔑 Token from cookies:', token.substring(0, 20) + '...');
        }
        
        if (!token) {
            console.log('❌ No token found');
            return res.status(401).json({ 
                error: 'No se ha encontrado el token - Acceso Denegado' 
            });
        }

        const decoded = await verifyToken(token);
        console.log('✅ Token decoded successfully for user:', decoded.id);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token validation error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado - Inicia sesión nuevamente' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                error: 'Token inválido' 
            });
        }
        
        return res.status(403).json({ 
            error: 'Token inválido' 
        });
    }
};