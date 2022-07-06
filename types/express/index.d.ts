import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | null;
      userId?: Record<string, any> | null;
      isAuth?: boolean;
    }
  }
}
