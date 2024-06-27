import { Request, Response, NextFunction } from 'express';
import { redisConnection } from '../services/redisService';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.query.userEmail as string;
  const token = await redisConnection.get(userEmail);

  if (!token) {
    return res.status(401).send('User not authenticated');
  }

  next();
};
