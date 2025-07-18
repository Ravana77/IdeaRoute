import { redirect } from 'next/navigation';

// Redirect to login by default
export default function Home() {
  redirect('/login');
}