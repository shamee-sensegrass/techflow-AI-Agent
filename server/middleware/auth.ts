import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include session
declare module 'express-serve-static-core' {
  interface Request {
    session: {
      userId?: number;
      destroy: (callback: (err?: any) => void) => void;
    };
  }
}

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Optional authentication middleware (for routes that work with or without auth)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Continue regardless of authentication status
  next();
};