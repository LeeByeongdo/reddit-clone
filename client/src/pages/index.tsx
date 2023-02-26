import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuthState } from '../context/auth';
import { Post, Sub } from '../types/subs';
import useSWRInfinite from 'swr/infinite';
import PostCard from '../components/PostCard';
import { useEffect, useState } from 'react';

export default function Home() {
  const { authenticated } = useAuthState();

  const address = '/subs/topSubs';

  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    if (previousPageData && !previousPageData.length) {
      return null;
    }

    return `/posts?page=${pageIndex}`;
  };

  const {
    data,
    error,
    size: page,
    setSize: setPage,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey);

  const posts: Post[] = data ? [].concat(...data) : [];
  const isInitialLoading = !posts && !error;

  const [observedPost, setObservedPost] = useState('');

  const observeElement = (element: HTMLElement | null) => {
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          console.log('마지막 포스트입니다.');
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 }
    );

    observer.observe(element);
  };

  useEffect(() => {
    if (!posts || posts.length === 0) {
      return;
    }

    const id = posts[posts.length - 1].identifier;

    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const { data: topSubs } = useSWR<Sub[]>(address);

  return (
    <div className="flex max-w-5xl px-4 pt-5 mx-auto">
      <div className="w-full md:mr-3 md:w-8/12">
        {isInitialLoading && (
          <p className="text-lg text-center">로딩중입니다.</p>
        )}
        {posts &&
          posts?.map((post) => {
            return (
              <PostCard key={post.identifier} post={post} mutate={mutate} />
            );
          })}
      </div>

      <div className="hidden w-4/12 ml-3 md:block">
        <div className="bg-white border rounded">
          <div className="p-4 border-b">
            <p className="text-lg font-semibold text-center">상위 커뮤니티</p>
          </div>

          <div>
            {topSubs?.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center px-4 py-2 text-xs border-b"
              >
                <Link href={`/r/${sub.name}`}>
                  <Image
                    src={sub.imageUrl}
                    className="rounded-full cursor-pointer w-6 h-6"
                    alt="Sub"
                    width={24}
                    height={24}
                  />
                </Link>
                <Link
                  href={`/r/${sub.name}`}
                  className="ml-2 font-bold hover:cursor-pointer"
                >
                  /r/{sub.name}
                </Link>
                <p className="ml-auto font-md">{sub.postCount}</p>
              </div>
            ))}
          </div>

          {authenticated && (
            <div className="w-full py-6 text-center">
              <Link
                href="/subs/create"
                className="w-full p-2 text-center text-white bg-gray-400 rounded"
              >
                커뮤니티 만들기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
