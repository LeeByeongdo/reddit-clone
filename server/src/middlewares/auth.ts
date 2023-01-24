import { Response, Request, NextFunction } from 'express';

export default async function authMiddleware(
  _: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = res.locals.user;

    if (!user) {
      throw new Error('Unauthenticated');
    }

    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Unauthenticated' });
  }
}
