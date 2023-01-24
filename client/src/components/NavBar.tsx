import axios from 'axios';
import Link from 'next/link';
import { MouseEvent } from 'react';
import { useAuthDispatch, useAuthState } from '../context/auth';

export default function NavBar() {
  const dispatch = useAuthDispatch();

  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();

    try {
      await axios.post('/auth/logout');
      dispatch('LOGOUT');
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const { loading, authenticated } = useAuthState();
  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-16 px-5 bg-white">
      <span className="text-2xl font-semibold text-gray-400">
        <Link href="/">Community</Link>
      </span>
      <div className="max-w-full px-4">
        <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 bg-transparent rounded focus:outline-none"
          />
        </div>
      </div>
      <div className="flex">
        {!loading &&
          (authenticated ? (
            <button
              className="w-20 p-2 mr-2 text-center text-white bg-gray-400 rounded"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          ) : (
            <>
              <Link
                className="w-20 p-2 mr-2 text-center text-blue-500 border-blue-500 rounded"
                href={'/login'}
              >
                로그인
              </Link>
              <Link
                className="w-20 p-2 text-center text-white bg-gray-400 rounded"
                href="/register"
              >
                회원가입
              </Link>
            </>
          ))}
      </div>
    </div>
  );
}
