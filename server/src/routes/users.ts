import { Request, Response, Router } from 'express';
import { Comment } from '../entity/Comment';
import Post from '../entity/Post';
import { User } from '../entity/User';
import userMiddleware from '../middlewares/user';

const getUserData = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneOrFail({
      where: { username: req.params.username },
      select: ['username', 'createdAt'],
    });

    const posts = await Post.find({
      where: { username: user.username },
      relations: ['comments', 'votes', 'sub'],
    });

    const comments = await Comment.find({
      where: { username: user.username },
      relations: ['post'],
    });

    if (res.locals.user) {
      const { user } = res.locals;
      posts.forEach((p) => p.setUserVote(user));
      comments.forEach((c) => c.setUserVote(user));
    }

    let userData: any[] = [];

    posts.forEach((p) => userData.push({ type: 'Post', ...p.toJSON() }));
    comments.forEach((c) => userData.push({ type: 'Comment', ...c.toJSON() }));

    userData.sort((a, b) => {
      if (b.createdAt < a.createdAt) {
        return -1;
      }

      if (b.createdAt > a.createdAt) {
        return 1;
      }

      return 0;
    });

    return res.json({ user, userData });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const userRouter = Router();

userRouter.get('/:username', userMiddleware, getUserData);
export default userRouter;
