import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHandler';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.url} ->`, err);
  }

  sendError(
    res,
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred'
      : message,
    statusCode
  );
};
