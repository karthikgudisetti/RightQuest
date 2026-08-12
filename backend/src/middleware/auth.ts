import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Role } from '@prisma/client';

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
};

export type AuthedRequest = Request & { user?: AuthUser };

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

export function signRefreshToken(user: AuthUser) {
  // jti keeps tokens unique even if issued in the same second
  return jwt.sign({ ...user, jti: randomUUID() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
}

export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
