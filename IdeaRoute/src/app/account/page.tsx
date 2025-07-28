'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProfileSettings } from '@/components';
import styles from './Account.module.css';

const AccountPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your account settings...</p>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            onClick={() => router.push('/dashboard')}
            className={styles.backButton}
            title="Back to Dashboard"
          >
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Account Settings</h1>
        </div>
      </header>

      <main className={styles.main}>
        <ProfileSettings />
      </main>
    </div>
  );
};

export default AccountPage;
