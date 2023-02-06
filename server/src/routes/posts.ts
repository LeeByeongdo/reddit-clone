import { Request, Response, Router } from 'express';
import Post from '../entity/Post';
import Sub from '../entity/Sub';
import authMiddleware from '../middlewares/auth';
import userMiddleware from '../middlewares/user';

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;

  const user = res.locals.user;

  if (!title.trim()) {
    return res.status(40).json({ title: '제목은 비워둘 수 없습니다.' });
  }

  try {
    const subRecord = await Sub.findOneByOrFail({ name: sub });
    const post = new Post();
    post.title = title;
    post.body = body;
    post.user = user;
    post.sub = subRecord;

    await post.save();

    return res.json(post);
  } catch (e) {
    return res.status(500).json({ error: '문제가 발생했습니다.' });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const post = await Post.findOneOrFail({
      where: { identifier, slug },
      relations: ['sub', 'votes'],
    });

    if (res.locals.user) {
      post.setUserVote(res.locals.user);
    }

    return res.json(post);
  } catch (e) {
    return res.status(500).json({ error: '문제가 발생했습니다.' });
  }
};

const router = Router();
router.get('/:identifier/:slug', userMiddleware, getPost);
router.post('/', userMiddleware, authMiddleware, createPost);

export default router;
