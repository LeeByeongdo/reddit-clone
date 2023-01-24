import Axios from 'axios';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { AuthProvider } from '../context/auth';
import './../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  Axios.defaults.baseURL = 'http://localhost:4000/api';
  Axios.defaults.withCredentials = true;

  const { pathname } = useRouter();
  const authRoutes = ['/register', '/login'];
  const authRoute = authRoutes.includes(pathname);

  return (
    <AuthProvider>
      {!authRoute && <NavBar />}
      <div className={authRoute ? '' : 'pt-12'}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
