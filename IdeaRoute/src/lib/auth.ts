// lib/auth.ts

// Client-side functions
import Cookies from 'js-cookie';

export function login() {
  Cookies.set('auth', 'true', { 
    expires: 7,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
}

export function logout() {
  Cookies.remove('auth', { path: '/' });
}

export function checkAuthClientSide() {
  return !!Cookies.get('auth');
}

// Server-side utility (for server components)
export function checkAuthServerSide(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  const cookies = new Map(
    cookieHeader.split(';').map(c => {
      const [key, val] = c.trim().split('=');
      return [key, val];
    })
  );
  return cookies.has('auth') && cookies.get('auth') === 'true';
}