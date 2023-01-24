import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entity/User';

export default async function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'server secret error' });
    }

    const { username } = jwt.verify(token, process.env.JWT_SECRET) as User;

    const user = await User.findOneBy({ username });

    if (!user) {
      throw new Error('Unauthenticated');
    }

    res.locals.user = user;
    next();
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: 'token error' });
  }
}
