import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'devsecret';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await userModel.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await userModel.findById(decoded.id).select('-passwordHash');
        if (user) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid, continue without user
      }
    }
    next();
  } catch (error) {
    next();
  }
};

