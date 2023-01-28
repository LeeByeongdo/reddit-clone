import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { useAuthState } from '../../context/auth';
import { Sub } from '../../types/subs';

export default function SubDetail() {
  const [ownSub, setOwnSub] = useState(false);
  const { authenticated, user } = useAuthState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetcher = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
  };

  const router = useRouter();
  const subName = router.query.subId;

  const {
    data: sub,
    error,
    isLoading,
  } = useSWR<Sub>(subName ? `/subs/${subName}` : null, fetcher);

  useEffect(() => {
    if (!sub || !user) return;

    setOwnSub(authenticated && user.username === sub.username);
  }, [sub, authenticated, user]);

  if (error) {
    return <h1 className="text-red-500">Community not found</h1>;
  }

  if (!sub) {
    return <></>;
  }

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return;
    }

    if (!fileInputRef.current) {
      return;
    }

    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileInputRef.current.name);

    try {
      await axios.post(`/subs/${sub.name}/upload`, formData, {
        headers: { 'Context-Type': 'multipart/form-data' },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const openFileInput = (type: string) => {
    const fileInput = fileInputRef.current;
    if (!fileInput) {
      return;
    }

    if (!ownSub) {
      return;
    }

    fileInput.name = type;
    fileInput.click();
  };

  return (
    <>
      <>
        <div>
          <input
            type={'file'}
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />
          <div className="bg-gray-400">
            {sub.bannerUrl ? (
              <div
                className="h-56"
                style={{
                  backgroundImage: `url(${sub.bannerUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onClick={() => openFileInput('banner')}
              >
                hello
              </div>
            ) : (
              <div className="h-20 bg-gray-400"></div>
            )}
          </div>

          <div className="h-20 bg-white">
            <div className="relative flex max-w-5xl px-5 mx-auto">
              <div className="absolute" style={{ top: -15 }}>
                {sub.imageUrl && (
                  <Image
                    src={sub.imageUrl}
                    alt={'커뮤니티 이미지'}
                    width={70}
                    height={70}
                    className="rounded-full"
                    onClick={() => openFileInput('image')}
                  />
                )}
              </div>
              <div className="pt-1 pl-24">
                <div className="flex items-center">
                  <h1 className="mb-1 text-3xl font-bold">{sub.title}</h1>
                </div>
                <p className="font-bold text-gray-400 text-small">
                  /r/{sub.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex max-w-5xl px-4 pt-5 mx-auto"></div>
      </>
    </>
  );
}
