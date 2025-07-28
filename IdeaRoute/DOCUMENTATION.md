# Idea Route - Complete Documentation

A modern, production-ready Next.js application for sharing and discovering suggestions from the community. Built with React 19, Next.js 15, TypeScript, and Firebase for authentication.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Firebase Setup](#firebase-setup)
6. [Google OAuth Setup](#google-oauth-setup)
7. [Environment Configuration](#environment-configuration)
8. [Firestore Security Rules](#firestore-security-rules)
9. [SweetAlert2 Implementation](#sweetalert2-implementation)
10. [Password Reset System](#password-reset-system)
11. [Production Deployment](#production-deployment)
12. [Authentication Functions](#authentication-functions)
13. [Firebase Functions](#firebase-functions)
14. [API Reference](#api-reference)

## Quick Start

### Prerequisites
- Node.js 18 or later
- npm or yarn package manager
- Firebase project
- Google Cloud Console project

### Installation
```bash
git clone <your-repo-url>
cd idea-route
npm install
```

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### 🔐 Authentication System
- **Email/Password Authentication** with Firebase
- **Google OAuth Integration** with popup and redirect fallback
- **Secure Password Handling** with bcrypt encryption
- **Form Validation** with real-time feedback
- **Password Reset** functionality via email
- **Protected Routes** with authentication guards
- **User Profile Management** with Firestore integration

### 🎨 Modern UI/UX
- **Mobile-First Responsive Design**
- **CSS Modules** for component-specific styling
- **SweetAlert2** for professional notifications
- **Loading States** and smooth transitions
- **Accessibility Features** with proper ARIA labels
- **TypeScript** for type safety

### 🛡️ Security Features
- **Password Encryption** using bcrypt
- **Input Sanitization** to prevent XSS
- **Environment Variables** for sensitive data
- **Firebase Security Rules** for database protection
- **Protected API Routes**

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: CSS Modules (no Tailwind)
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Notifications**: SweetAlert2
- **Security**: bcryptjs for password hashing
- **Deployment Ready**: Vercel, Netlify compatible

## Project Structure

```
src/
├── app/
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # User dashboard
│   ├── api/                  # API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (redirects)
├── components/
│   └── ProtectedRoute.tsx    # Route protection component
├── context/
│   └── AuthContext.tsx       # Authentication context
├── hooks/
│   └── useAuthForm.ts        # Form handling hook
├── lib/
│   └── firebase.ts           # Firebase configuration
├── types/
│   └── auth.ts               # TypeScript interfaces
└── utils/
    └── auth.ts               # Authentication utilities
```

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Note your project ID

### 2. Enable Authentication
1. Click "Authentication" in left sidebar
2. Click "Get Started" button
3. Go to "Sign-in method" tab

### 3. Enable Sign-in Providers

#### Email/Password Provider
1. Click "Email/Password" in Sign-in providers
2. Toggle "Enable" switch
3. Save

#### Google Provider
1. Click "Google" in Sign-in providers
2. Toggle "Enable" switch
3. Select your project support email
4. Click "Save"
5. **Copy the Web client ID** (needed for environment variables)

### 4. Enable Firestore Database
1. Click "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (choose closest to your users)
5. Click "Done"

### 5. Required Firebase APIs
Ensure these APIs are enabled in your Firebase project:
- **Authentication API** - For user authentication
- **Firestore API** - For database operations
- **Analytics API** - For usage tracking (optional)

## Google OAuth Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" → "Credentials"
4. Create OAuth 2.0 credentials

### 2. Configure OAuth Client
1. Set application type to "Web application"
2. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - Your production domain
3. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - Your production domain
4. Copy the Client ID

### 3. Authentication Features
- **Popup-based Authentication** (primary method)
- **Redirect fallback** when popups are blocked
- **Enhanced user experience** with loading indicators
- **Automatic popup closure** after authentication
- **Account selection prompt** for security

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Optional Configuration
NEXTAUTH_SECRET=your_jwt_secret_key
NEXTAUTH_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=12
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | Optional |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `NEXTAUTH_SECRET` | JWT secret for sessions | Optional |
| `NEXTAUTH_URL` | App URL for auth callbacks | Development |
| `BCRYPT_SALT_ROUNDS` | Password hashing salt rounds | Optional (default: 12) |

## Firestore Security Rules

Copy these rules to Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User documents - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && isValidUserData(request.resource.data);
      
      // Allow user creation during signup
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && isValidNewUser(request.resource.data);
    }
    
    // User profiles (public subset of user data)
    match /user-profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && isValidProfileData(request.resource.data);
    }
    
    // Ideas/suggestions collection
    match /ideas/{ideaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && isValidIdeaData(request.resource.data)
        && request.resource.data.authorId == request.auth.uid;
      allow update: if request.auth != null 
        && resource.data.authorId == request.auth.uid;
      allow delete: if request.auth != null 
        && resource.data.authorId == request.auth.uid;
    }
    
    // Validation functions
    function isValidUserData(data) {
      return data.keys().hasAll(['email', 'displayName', 'createdAt']) &&
             data.email is string &&
             data.displayName is string &&
             data.createdAt is timestamp;
    }
    
    function isValidNewUser(data) {
      return isValidUserData(data) &&
             data.createdAt == request.time;
    }
    
    function isValidProfileData(data) {
      return data.keys().hasAll(['displayName']) &&
             data.displayName is string &&
             data.displayName.size() > 0;
    }
    
    function isValidIdeaData(data) {
      return data.keys().hasAll(['title', 'description', 'authorId', 'createdAt']) &&
             data.title is string &&
             data.description is string &&
             data.authorId is string &&
             data.createdAt is timestamp;
    }
  }
}
```

## SweetAlert2 Implementation

The app uses SweetAlert2 for professional notifications:

### Installation
```bash
npm install sweetalert2
```

### Usage in Authentication Context
- **Success notifications** for successful operations
- **Error alerts** for authentication failures
- **Confirmation dialogs** for sensitive actions
- **Loading indicators** during async operations

### Common Notification Types
- Sign-up success
- Sign-in success
- Password reset email sent
- Authentication errors
- Form validation errors

## Password Reset System

### Features
- **Custom Password Reset Page** with consistent UI/UX design
- **Email-based password reset** using Firebase Auth
- **Secure token generation** handled by Firebase
- **Custom email templates** (configurable in Firebase Console)
- **Real-time validation** of email addresses and password strength
- **Success/error notifications** via SweetAlert2

### Custom UI Implementation
Your app includes a custom password reset page (`/reset-password`) that maintains design consistency:

- **Consistent Styling** - Uses the same Auth.module.css as login page
- **Gradient Background** - Matches your app's purple gradient theme
- **Loading States** - Professional loading spinners during verification
- **Error Handling** - Comprehensive error messages for all scenarios
- **Security** - Proper action code verification and validation
- **Responsive Design** - Mobile-first design matching your auth page

### How It Works
1. User enters email address in reset modal
2. System validates email format
3. Firebase sends password reset email with link to your custom page
4. User clicks link and is directed to `/reset-password`
5. Custom page verifies the action code
6. User sets new password with real-time validation
7. User can sign in with new password

### Firebase Console Configuration
**Important**: To use your custom UI instead of Firebase's generic page:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Templates**
3. Click **"Password reset"** template → **"Edit template"**
4. Change **Action URL** from Firebase default to:
   - Development: `http://localhost:3000/reset-password`
   - Production: `https://yourdomain.com/reset-password`
5. Save the template

### Implementation
```typescript
const resetPassword = async (email: string) => {
  try {
    const actionCodeSettings = {
      url: passwordResetEmailConfig.url,
      handleCodeInApp: passwordResetEmailConfig.handleCodeInApp,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    // Success notification shown via SweetAlert2
  } catch (error) {
    // Error handling with specific error messages
  }
};
```

## Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

### Manual Deployment
```bash
npm run build
npm run start
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Firebase project in production mode
- [ ] Firestore security rules applied
- [ ] Google OAuth domains configured
- [ ] Analytics enabled (optional)
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled

## Authentication Functions

### Core Functions in AuthContext

#### `signUp(email: string, password: string, confirmPassword: string)`
- Creates new user account with email/password
- Validates password confirmation
- Creates user document in Firestore
- Returns success/error result

#### `signIn(email: string, password: string)`
- Signs in existing user with email/password
- Handles authentication errors
- Updates user state on success

#### `signInWithGoogle()`
- Initiates Google OAuth flow
- Uses popup method with redirect fallback
- Creates user document if first sign-in
- Handles popup blocking gracefully

#### `signOut()`
- Signs out current user
- Clears authentication state
- Redirects to authentication page

#### `resetPassword(email: string)`
- Sends password reset email via Firebase
- Validates email format
- Provides user feedback via notifications

#### `checkUserExists(email: string)`
- Checks if user account exists for email
- Used for form validation
- Returns boolean result

### Protected Route Component
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};
```

## Firebase Functions

### Core Firebase Configuration

#### `initializeApp(firebaseConfig)`
- Initializes Firebase app with environment configuration
- Prevents re-initialization in development
- Returns Firebase app instance

#### `getAuth(app)`
- Initializes Firebase Authentication
- Returns authentication instance

#### `getFirestore(app)`
- Initializes Firestore database
- Returns database instance

#### `getAnalytics(app)`
- Initializes Firebase Analytics (browser only)
- Conditionally loaded based on support

### Firebase Utilities

#### `canUseFirestore()`
- Checks if Firestore is available and enabled
- Used before database operations
- Returns boolean status

#### `showFirestoreSetupInstructions()`
- Displays setup instructions if Firestore not enabled
- Helps developers with initial configuration
- Provides direct links to Firebase Console

#### `testFirestoreConnection()`
- Tests database connectivity on app initialization
- Sets availability status
- Handles offline/unavailable scenarios

## API Reference

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Authentication Flow
1. **Initial Load**: App checks authentication state
2. **Unauthenticated**: Redirects to `/auth`
3. **Sign Up/Sign In**: User chooses email/password or Google OAuth
4. **Validation**: Real-time form validation with security checks
5. **Success**: Redirects to `/dashboard`
6. **Protected Routes**: Automatically redirects to auth if not logged in

### Responsive Design Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, create an issue in the repository or refer to the Firebase documentation for specific Firebase-related questions.
