'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import styles from './Dashboard.module.css';
import { Checklist, AIGenerate, TimePlanner } from '@/components';

const DashboardPage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Sign Out',
        text: 'Are you sure you want to sign out of your account?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Sign Out',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#374151',
        customClass: {
          popup: 'swal2-responsive-popup',
          title: 'swal2-responsive-title',
          htmlContainer: 'swal2-responsive-content',
          confirmButton: 'swal2-responsive-button',
          cancelButton: 'swal2-responsive-button'
        },
        focusConfirm: false,
        focusCancel: true
      });

      if (result.isConfirmed) {
        // Show loading state while signing out
        Swal.fire({
          title: 'Signing Out...',
          text: 'Please wait while we sign you out.',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-responsive-popup',
            title: 'swal2-responsive-title',
            htmlContainer: 'swal2-responsive-content'
          }
        });

        await signOut();
        
        // Redirect to auth page (success message is handled by AuthContext)
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Show error message
      Swal.fire({
        title: 'Sign Out Failed',
        text: 'There was an error signing you out. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'swal2-responsive-popup',
          title: 'swal2-responsive-title',
          htmlContainer: 'swal2-responsive-content',
          confirmButton: 'swal2-responsive-button'
        }
      });
    }
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
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
          <h1 className={styles.title}>IdeaRoute Dashboard</h1>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              {user.photoURL && (
                <Image 
                  src={user.photoURL} 
                  alt="Profile" 
                  className={styles.avatar}
                  width={40}
                  height={40}
                />
              )}
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {user.displayName || user.email}
                </span>
                <span className={styles.userEmail}>
                  {user.email}
                </span>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className={styles.signOutButton}
              title="Sign out of your account"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>
            Welcome back, {user.displayName || 'User'}! 👋
          </h2>
          <p className={styles.welcomeText}>
            This is your suggestion dashboard. Here you can create, manage, and track your suggestions.
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>0</h3>
              <p className={styles.statLabel}>Total Suggestions</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>0</h3>
              <p className={styles.statLabel}>Favorites</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💬</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>0</h3>
              <p className={styles.statLabel}>Comments</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>0</h3>
              <p className={styles.statLabel}>Following</p>
            </div>
          </div>
        </div>

        <div className={styles.actionSection}>
          <h3 className={styles.sectionTitle}>Core Functions</h3>
          <div className={styles.actionGrid}>
            <button 
              className={styles.actionCard}
              onClick={() => setActiveModal('checklist')}
            >
              <div className={styles.actionIcon}>✓</div>
              <div className={styles.actionContent}>
                <h4 className={styles.actionTitle}>Checklist</h4>
                <p className={styles.actionDescription}>
                  Create and manage your daily tasks and to-do items
                </p>
              </div>
            </button>

            <button 
              className={styles.actionCard}
              onClick={() => setActiveModal('ai-generate')}
            >
              <div className={styles.actionIcon}>🤖</div>
              <div className={styles.actionContent}>
                <h4 className={styles.actionTitle}>AI Generate</h4>
                <p className={styles.actionDescription}>
                  Generate ideas, content, and solutions using AI assistance
                </p>
              </div>
            </button>

            <button 
              className={styles.actionCard}
              onClick={() => setActiveModal('time-planner')}
            >
              <div className={styles.actionIcon}>⏰</div>
              <div className={styles.actionContent}>
                <h4 className={styles.actionTitle}>Time Planner</h4>
                <p className={styles.actionDescription}>
                  Plan and organize your schedule with time blocks
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className={styles.actionSection}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionGrid}>
            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>➕</div>
              <div className={styles.actionContent}>
                <h4 className={styles.actionTitle}>Create Suggestion</h4>
                <p className={styles.actionDescription}>
                  Share a new idea or suggestion with the community
                </p>
              </div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>🔍</div>
              <div className={styles.actionContent}>
                <h4 className={styles.actionTitle}>Browse Suggestions</h4>
                <p className={styles.actionDescription}>
                  Explore suggestions from other community members
                </p>
              </div>
            </button>

            <button 
              className={styles.actionCard}
              onClick={() => router.push('/account')}
            >
              <div className={styles.actionIcon}>⚙️</div>
              <div className={styles.actionContent}>
                <h4 className={styles.actionTitle}>Account Settings</h4>
                <p className={styles.actionDescription}>
                  Manage your profile and preferences
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeModal === 'checklist' && (
        <Checklist onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'ai-generate' && (
        <AIGenerate onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'time-planner' && (
        <TimePlanner onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default DashboardPage;
