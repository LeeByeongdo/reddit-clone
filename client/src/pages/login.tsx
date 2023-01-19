'use client';

import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { InputGroup } from '../components/InputGroup';
import { useAuthDispatch } from '../context/auth';
import { LoginError } from '../types/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>();

  const dispatch = useAuthDispatch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `/auth/login`,
        { password, username },
        { withCredentials: true }
      );

      dispatch('LOGIN', res.data.user);

      console.log(res);
    } catch (e) {
      console.error(e);
      if (e instanceof AxiosError<LoginError>) {
        const error = e as AxiosError<LoginError>;
        setErrors(error.response?.data);
      }
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">로그인</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Username"
              value={username}
              setValue={setUsername}
              error={errors && errors.username}
            />
            <InputGroup
              placeholder="Password"
              value={password}
              setValue={setPassword}
              error={errors && errors.password}
            />

            <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded">
              로그인
            </button>
          </form>

          <small>
            이미 아이디가 없으신가요?
            <Link className="ml-1 text-blue-500 uppercase" href="/register">
              <span>가입하기</span>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
