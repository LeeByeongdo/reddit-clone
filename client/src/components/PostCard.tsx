import Link from 'next/link';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { Post, Sub } from '../types/subs';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useAuthState } from '../context/auth';
import { useRouter } from 'next/router';
import axios from 'axios';
import { KeyedMutator, mutate } from 'swr';

interface PostCardProps {
  post: Post;
  subMutate?: KeyedMutator<Sub>;
  mutate?: KeyedMutator<Post[]>;
}

export default function PostCard({
  post: {
    identifier,
    slug,
    title,
    body,
    subName,
    createdAt,
    voteScore,
    userVote,
    url,
    username,
    sub,
    commentCount,
  },
  subMutate,
  mutate,
}: PostCardProps) {
  const { authenticated } = useAuthState();
  const router = useRouter();
  const isSubPage = router.pathname === '/r/[subId]';

  const vote = async (value: number) => {
    if (!authenticated) {
      router.push('/login');
    }

    if (value === userVote) {
      value = 0;
    }

    try {
      await axios.post('/votes', { identifier, slug, value });
      if (subMutate) {
        subMutate();
      }

      if (mutate) {
        mutate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex mb-4 bg-white rounded" id={identifier}>
      <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
        <div
          className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(1)}
        >
          {userVote === 1 ? (
            <FaArrowUp className="text-red-500" />
          ) : (
            <FaArrowUp />
          )}
        </div>
        <p className="text-xs font-bold">{voteScore}</p>
        <div
          className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(-1)}
        >
          {userVote === -1 ? (
            <FaArrowDown className="text-blue-500" />
          ) : (
            <FaArrowDown />
          )}
        </div>
      </div>

      <div className="w-full p-2">
        {!isSubPage && (
          <div className="flex items-center">
            <Link href={`/r/${subName}`}>
              {sub && (
                <Image
                  src={sub?.imageUrl}
                  alt="sub"
                  className="rounded-full cursor-pointer"
                  width={12}
                  height={12}
                />
              )}
            </Link>
            <Link
              href={`/r/${subName}`}
              className="ml-2 text-xs font-bold cursor-pointer hover:underline"
            >
              /r/{subName}
            </Link>
            <span className="mx-1 text-xs text-gray-400">*</span>
          </div>
        )}
        <p className="text-xs text-gray-400">
          Posted by
          <Link href={`/r/${username}`} className="mx-1 hover:underline">
            /u/{username}
          </Link>
          <Link href={url} className="mx-1 hover:underline">
            {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
          </Link>
        </p>

        <Link href={url} className="my-1 text-lg font-medium">
          {title}
        </Link>
        {body && <p className="my-1 text-sm">{body}</p>}
        <div className="flex">
          <Link href={url}>
            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
            <span>{commentCount}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
