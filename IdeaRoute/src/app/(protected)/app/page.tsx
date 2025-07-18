import { redirect } from 'next/navigation';
import { checkAuthServerSide } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function AppPage() {
  // Await the headers() call
  const cookieHeader = (await headers()).get('cookie') || undefined;
  const isAuthenticated = checkAuthServerSide(cookieHeader);
  
  if (!isAuthenticated) {
    console.warn('Unauthorized access attempt to protected app page');
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome to the protected app!</h1>
    </div>
  );
}