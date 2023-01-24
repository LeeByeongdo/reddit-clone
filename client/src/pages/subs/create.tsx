import axios, { AxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import Router from 'next/router';
import { FormEvent, useState } from 'react';
import { InputGroup } from '../../components/InputGroup';
import { SubsCreationError } from '../../types/subs';

export default function SubCreation() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<SubsCreationError>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post('/subs', {
        name,
        title,
        description,
      });
      Router.push(`/r/${res.data.name}`);
    } catch (e) {
      console.error(e);
      if (e instanceof AxiosError<SubsCreationError>) {
        const error = e as AxiosError<SubsCreationError>;
        setErrors(error.response?.data ?? {});
      }
    }
  };

  return (
    <div className="flex flex-col justify-center pt-16">
      <div className="w-10/12 mx-auto md:w-96">
        <h1 className="mb-2 text-lg font-medium">커뮤니티 만들기</h1>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="my-6">
            <p className="font-medium">Name</p>
            <p className="mb-2 text-xs text-gray-400">
              커뮤니티 이름은 변경할 수 없습니다.
            </p>
            <InputGroup
              placeholder="이름"
              value={name}
              error={errors.name}
              setValue={setName}
            />
          </div>

          <div className="my-6">
            <p className="font-medium">Title</p>
            <p className="mb-2 text-xs text-gray-400">
              커뮤니티 제목은 주제를 나타냅니다. 언제든지 변경할 수 있습니다.
            </p>
            <InputGroup
              placeholder="제목"
              value={title}
              error={errors.title}
              setValue={setTitle}
            />
          </div>

          <div className="my-6">
            <p className="font-medium">Description</p>
            <p className="mb-2 text-xs text-gray-400">
              해당 커뮤니티에 대한 설명입니다.
            </p>
            <InputGroup
              placeholder="설명"
              value={description}
              setValue={setDescription}
            />
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-1 text-sm font-semibold rounded text-white bg-gray-400 border">
              커뮤니티 만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;

    if (!cookie) {
      throw new Error('Missing auth token cookie');
    }

    await axios.get('/auth/me', { headers: { cookie } });

    return { props: {} };
  } catch (e) {
    res.writeHead(307, { Location: '/login' }).end();
    return { props: {} };
  }
};
