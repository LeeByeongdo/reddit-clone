import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { InputGroup } from '../components/InputGroup';
import { useAuthState } from '../context/auth';
import { RegisterError } from '../types/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<RegisterError>();

  const { authenticated } = useAuthState();
  const router = useRouter();

  if (authenticated) {
    router.push('/');
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`/auth/register`, {
        email: email,
        username,
        password,
      });

      router.push('/login');
    } catch (e) {
      console.error('error', e);
      if (e instanceof AxiosError<RegisterError>) {
        const error = e as AxiosError<RegisterError>;
        setErrors(error.response?.data);
      }
    }
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="w-10/12 mx-auto md:w-96">
          <h1 className="mb-2 text-lg font-medium">회원가입</h1>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Email"
              value={email}
              setValue={setEmail}
              error={errors && errors.email}
            />
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
              SIGN UP
            </button>
          </form>

          <small>
            이미 가입하셨나요?
            <Link className="ml-1 text-blue-500 uppercase" href="/login">
              <span>로그인</span>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
