import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { PendingCountProvider } from '../context/PendingCountContext';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // Pages that should not have the main layout
  const noLayoutPages = ['/login', '/register', '/', '/pending-approval', '/profile-setup', '/reset-password', '/forgot-password', '/rejected'];

  if (noLayoutPages.includes(router.pathname)) {
    return (
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    );
  }

  // Apply layout to all other pages
  return (
    <SessionProvider session={session}>
      <PendingCountProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      </PendingCountProvider>
    </SessionProvider>
  );
}

export default MyApp;