# Project Structure Documentation

## Overview
This document outlines the improved project structure for the IdeaRoute application.

## Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── Checklist/         # Checklist component
│   │   ├── Checklist.tsx
│   │   ├── Checklist.module.css
│   │   └── index.ts
│   ├── AIGenerate/        # AI content generator
│   │   ├── AIGenerate.tsx
│   │   ├── AIGenerate.module.css
│   │   └── index.ts
│   ├── TimePlanner/       # Time planning component
│   │   ├── TimePlanner.tsx
│   │   ├── TimePlanner.module.css
│   │   └── index.ts
│   ├── ErrorBoundary/     # Error boundary component
│   ├── ProtectedRoute/    # Route protection component
│   ├── PasswordResetModal/ # Password reset functionality
│   ├── ui/                # Reusable UI components
│   │   ├── Button/        # Button component
│   │   ├── Modal/         # Modal component
│   │   └── index.ts
│   ├── shared/            # Shared components (for future use)
│   └── index.ts           # Main components export
├── constants/             # Application constants
│   └── index.ts
├── context/               # React contexts
│   └── AuthContext.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # External library configurations
├── styles/                # Global styles
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── config/                # Configuration files
```

## Component Organization

### Main Features
Each main feature component is organized in its own folder:
- **Checklist**: Task management functionality
- **AIGenerate**: AI-powered content generation
- **TimePlanner**: Schedule and time block management

### Component Structure
Each component folder contains:
- `ComponentName.tsx` - Main component file
- `ComponentName.module.css` - Component-specific styles  
- `index.ts` - Export file for clean imports

### UI Components
Reusable UI components are located in `src/components/ui/`:
- **Button**: Configurable button component with variants
- **Modal**: Reusable modal component with different sizes

## Import Strategy

### Clean Imports
The new structure allows for clean imports:

```typescript
// Main components
import { Checklist, AIGenerate, TimePlanner } from '@/components';

// UI components
import { Button, Modal } from '@/components/ui';

// Constants
import { STORAGE_KEYS, AI_CONTENT_TYPES } from '@/constants';
```

### Individual Imports
You can also import components individually:

```typescript
import Checklist from '@/components/Checklist';
import Button from '@/components/ui/Button';
```

## Constants Organization

All application constants are centralized in `src/constants/index.ts`:
- Storage keys for localStorage
- Content type definitions
- Time block categories
- API endpoints (for future use)

## Benefits of This Structure

1. **Maintainability**: Each component is self-contained with its own folder
2. **Scalability**: Easy to add new components following the same pattern
3. **Clean Imports**: Centralized exports make imports cleaner
4. **Type Safety**: TypeScript definitions are well-organized
5. **Reusability**: UI components can be shared across the application
6. **Constants Management**: Centralized constants prevent duplication

## Adding New Components

To add a new component:

1. Create a new folder in `src/components/`
2. Add the component file, styles, and index.ts
3. Export the component in `src/components/index.ts`
4. Import and use in your pages/components

Example:
```typescript
// src/components/NewComponent/NewComponent.tsx
const NewComponent = () => {
  return <div>New Component</div>;
};

export default NewComponent;

// src/components/NewComponent/index.ts
export { default } from './NewComponent';

// src/components/index.ts
export { default as NewComponent } from './NewComponent';
```

## Development Guidelines

1. Keep components focused and single-purpose
2. Use TypeScript for type safety
3. Follow the established naming conventions
4. Add CSS modules for component-specific styles
5. Export components through index files
6. Use constants from the centralized constants file
7. Document complex components with JSDoc comments
