import { Router, Request, Response, NextFunction } from 'express';
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';
import { isEmpty } from 'class-validator';
import { AppDataSource } from '../data-source';
import Sub from '../entity/Sub';
import { SubsCreationErrors } from '../types/subs';
import Post from '../entity/Post';
import { User } from '../entity/User';
import multer from 'multer';
import { makeId } from '../utils/helper';
import path from 'path';
import { unlinkSync } from 'fs';

const create = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;
  try {
    const errors: SubsCreationErrors = {};

    if (isEmpty(name)) {
      errors.name = '이름은 비워둘 수  없습니다.';
    }

    if (isEmpty(title)) {
      errors.title = '제목은 비워둘 수 없습니다.';
    }

    const sub = await AppDataSource.getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = '서브 이름이 이미 존재합니다.';

    if (Object.keys(errors).length) {
      return res.status(400).json(errors);
    }

    console.log(name, title, description);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '문제가 발생했습니다.' });
  }

  try {
    const user = res.locals.user;

    const sub = new Sub();
    sub.name = name;
    sub.title = title;
    sub.description = description;
    sub.user = user;

    await sub.save();

    return res.json(sub);
  } catch (e) {
    return res.status(500).json({ error: '문제가 발생했습니다.' });
  }
};

const topSubs = async (req: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn", 'https://www.gravatar.com/avatar?d=mp&f=y')`;
    const subs = await AppDataSource.createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, 's')
      .leftJoin(Post, 'p', `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, 'DESC')
      .limit(5)
      .execute();
    return res.json(subs);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '문제가 발생하였습니다. ' });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;
  try {
    const sub = await Sub.findOneByOrFail({ name });

    const posts = await Post.find({
      where: { subName: sub.name },
      order: { createdAt: 'DESC' },
      relations: ['comments', 'votes'],
    });

    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (e) {
    console.error(e);
    return res.status(404).json({ error: '커뮤니티를 찾을 수 없습니다.' });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: '잘못된 접근입니다.' });
    }

    res.locals.sub = sub;
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '문제가 발생하였습니다.' });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images',
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      callback(null, true);
    } else {
      callback(new Error('지원하지 않는 파일 타입입니다.'));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;

  try {
    const type = req.body.type;
    if (type !== 'image' && type !== 'banner') {
      if (!req.file?.path) {
        return res.status(400).json({ error: '파일 업로드 오류입니다. ' });
      }

      unlinkSync(req.file.path);
      return res.status(400).json({ error: '파일 업로드 오류입니다. ' });
    }

    let oldImageUrn = '';
    if (type === 'image') {
      oldImageUrn = sub.imageUrn ?? '';
      sub.imageUrn = req.file?.filename ?? '';
    } else if (type === 'banner') {
      oldImageUrn = sub.bannerUrn ?? '';
      sub.bannerUrn = req.file?.filename ?? '';
    }

    await sub.save();

    if (oldImageUrn) {
      const fullFilename = path.resolve(
        process.cwd(),
        'public',
        'images',
        oldImageUrn
      );
      unlinkSync(fullFilename);
    }

    console.log(sub);

    return res.json(sub);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: '에러입니다' });
  }
};

const router = Router();

router.post('/', userMiddleware, authMiddleware, create);
router.get('/topSubs', topSubs);
router.get('/:name', userMiddleware, getSub);
router.post(
  '/:name/upload',
  userMiddleware,
  authMiddleware,
  ownSub,
  upload.single('file'),
  uploadSubImage
);

export default router;
