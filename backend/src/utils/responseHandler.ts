import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, unknown>;
  count?: number;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    data
  };
  if (message) payload.message = message;
  if (Array.isArray(data)) payload.count = data.length;
  return res.status(statusCode).json(payload);
};

export const sendError = (res: Response, error: string | Record<string, unknown>, statusCode = 400, message?: string): Response => {
  const payload: ApiResponse = {
    success: false,
    error
  };
  if (message) payload.message = message;
  return res.status(statusCode).json(payload);
};
