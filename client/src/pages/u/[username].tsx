import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import PostCard from '../../components/PostCard';
import { User } from '../../types/auth';
import { Comment, Post } from '../../types/subs';

interface UserPost extends Post {
  type: string;
}

interface UserComment extends Comment {
  type: string;
}

type UserData = UserPost | UserComment;

interface UserInfo {
  user: User;
  userData: UserData[];
}

export default function UserPage() {
  const router = useRouter();
  const username = router.query.username;

  const { data } = useSWR<UserInfo>(username ? `/users/${username}` : null);

  if (!data) {
    return null;
  }

  return (
    <div className="flex max-w-5xl px-4 pt-5 mx-auto">
      <div className="w-full md:mr-3 md:w-8/12">
        {data.userData.map((data) => {
          if (data.type === 'Post') {
            const post = data as UserPost;
            return <PostCard key={post.identifier} post={post} />;
          }

          const comment = data as UserComment;
          return (
            <div
              key={comment.identifier}
              className="flex my-4 bg-white rounded"
            >
              <div className="flex-shirink-0 w-10 py-10 text-center border-r rounded-l">
                <i className="text-gray-500 fas fa-comment-alt fa-xs"></i>
              </div>

              <div className="w-full p-2">
                <p className="mb-2 text-xs text-gray-500">
                  <Link
                    className="cursor-pointer hover:underline"
                    href={`/u/${comment.username}`}
                  >
                    {comment.username}
                  </Link>{' '}
                  <span>commented on</span>
                  <Link
                    className="cursor-pointer font-semibold hover:underline"
                    href={`/u/${comment.post?.url}`}
                  >
                    {comment.post?.title}
                  </Link>{' '}
                  <span>*</span>{' '}
                  <Link
                    className="cursor-pointer font-semibold hover:underline"
                    href={`/r/${comment.post?.subName}`}
                  >
                    {comment.post?.subName}
                  </Link>{' '}
                </p>
                <br />
                <p className="p-1">{comment.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden w-4/12 ml-3 md:block">
        <div className="flex items-center p-3 bg-gray-400 rounded-t">
          <Image
            src="https://www.gravatar.com/avatar/0000?d=mp&f=y"
            alt={'user'}
            className="mx-auto border border-white rounded-full"
            width={40}
            height={40}
          />
          <p className="pl-2 text-md">{data.user.username}</p>
        </div>
        <div className="p-2 bg-white rounded-b">
          <p>{dayjs(data.user.createdAt).format('YYYY.MM.dd')}</p>
        </div>
      </div>
    </div>
  );
}
