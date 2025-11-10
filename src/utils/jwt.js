import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'mainevents',
      audience: 'mainevents-users'
    }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'mainevents',
      audience: 'mainevents-users'
    }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
