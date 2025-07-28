# Idea Route - Modern Productivity Dashboard

A modern, production-ready Next.js application featuring a comprehensive dashboard with integrated productivity tools. Built with React 19, Next.js 15, TypeScript, and Firebase.

## Core Features

- **📝 Smart Checklist** - Create, manage, and track your daily tasks with local storage persistence
- **🤖 AI Content Generator** - Generate ideas, content, strategies, and solutions using AI assistance
- **⏰ Time Planner** - Organize your schedule with categorized time blocks and progress tracking
- **🔐 Complete Authentication** - Email/password + Google OAuth with Firebase
- **🎨 Modern UI/UX** - Dark theme, mobile-first responsive design with smooth animations
- **🛡️ Security First** - Password encryption, input sanitization, protected routes

## Documentation

📖 **[Complete Documentation](./DOCUMENTATION.md)** - Comprehensive guide covering:
- Firebase setup and configuration
- Google OAuth implementation
- Environment variables
- Firestore security rules
- Authentication system
- Deployment instructions
- API reference

🏗️ **[Project Structure](./PROJECT_STRUCTURE.md)** - Detailed guide covering:
- Component organization and folder structure
- Import strategies and conventions
- UI component system
- Constants management
- Development guidelines

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Styling**: CSS Modules with Dark Theme
- **Notifications**: SweetAlert2
- **Architecture**: Component-based with centralized state management

## Project Structure

```
src/
├── components/           # Organized in feature-based folders
│   ├── Checklist/       # Smart task management
│   ├── AIGenerate/      # AI content generation
│   ├── TimePlanner/     # Schedule management
│   ├── ui/              # Reusable UI components
│   └── shared/          # Shared utilities
├── constants/           # Application constants
├── context/             # React contexts
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

## Environment Setup

Create `.env.local` with your Firebase and Google OAuth credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## License

MIT License
