import express from 'express';
import morgan from 'morgan';
import { AppDataSource } from './data-source';
import authRouter from './routes/auth';
import subsRouter from './routes/subs';
import postsRouter from './routes/posts';
import votesRouter from './routes/votes';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const origin = process.env.ORIGIN;

app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.get('/', (_, res) => res.send('running'));

app.use('/api/auth', authRouter);
app.use('/api/subs', subsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/votes', votesRouter);

app.use(express.static('public'));

const port = 4000;
app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log('db connected');
    })
    .catch((error) => console.log(error));
});
