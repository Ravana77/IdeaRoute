'use client' // Client component for interactivity

import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth'; // Import the login function

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    await login(); // Set auth state
    router.push('/app'); // Redirect to protected page after login
  };

  return (
    <div>
      {/* Minimal UI since design isn't required */}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}