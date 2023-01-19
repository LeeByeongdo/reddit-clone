import Axios from 'axios';
import { AppProps } from 'next/app';
import { AuthProvider } from '../context/auth';
import './../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  Axios.defaults.baseURL = 'http://localhost:4000/api';

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
