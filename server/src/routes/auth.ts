import { isEmpty, validate, ValidationError } from 'class-validator';
import { Router, Request, Response } from 'express';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { mapErrors } from '../utils/helper';
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    const emailUser = await User.findOneBy({ email });

    if (emailUser) {
      errors.email = '이미 해당 이메일 주소가 사용중입니다.';
    }

    const usernameUser = await User.findOneBy({ username });
    if (usernameUser) {
      errors.username = '이미 사용자 이름이 사용중입니다.';
    }

    if (Object.keys(errors).length) {
      return res.status(400).json(errors);
    }

    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    errors = await validate(user);

    if (Object.keys(errors).length) {
      return res.status(400).json(mapErrors(errors));
    }

    await user.save();

    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    if (isEmpty(username)) {
      errors.username = '사용자 이름은 필수입니다.';
    }

    if (isEmpty(password)) {
      errors.password = '비밀번호는 필수입니다.';
    }

    if (Object.keys(errors).length) {
      return res.status(400).json(errors);
    }

    const user = await User.findOneBy({ username });
    if (!user) {
      return res.status(404).json({ username: '없는 아이디 입니다.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ password: '비밀번호가 맞지 않습니다.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'server error' });
    }

    const token = jwt.sign({ username }, secret);

    res.set(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    );

    return res.json({ user, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};

const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

const logout = async (_: Request, res: Response) => {
  res.set(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    })
  );

  res.status(200).json({ success: true });
};

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', userMiddleware, authMiddleware, me);
router.post('/logout', userMiddleware, authMiddleware, logout);

export default router;
