import { config } from '../config.js';
import jwt from 'jsonwebtoken';

export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN },
            (err, token) => {
                if (err) {
                    console.error('❌ Error creating JWT token:', err);
                    reject(err);
                } else {
                    resolve(token);
                }
            }
        );
    });
}

export function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('❌ Error verifying JWT token:', err);
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}