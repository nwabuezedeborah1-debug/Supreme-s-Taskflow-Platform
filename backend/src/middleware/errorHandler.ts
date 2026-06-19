import { Request, Response, NextFunction } from 'express';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: 'Route not found' });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
};
