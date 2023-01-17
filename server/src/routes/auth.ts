import { validate, ValidationError } from 'class-validator';
import { Router, Request, Response } from 'express';
import { User } from '../entity/User';

const mapErrors = (errors: ValidationError[]) => {
  return errors.reduce((prev, err) => {
    if (!err.constraints) {
      return prev;
    }

    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {} as { [key: string]: string});
}

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

const router = Router();
router.post('/register', register);

export default router;
