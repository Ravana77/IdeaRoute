export const passwordResetEmailConfig = {
  url: process.env.NEXT_PUBLIC_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
    : 'http://localhost:3000/reset-password',
  
  handleCodeInApp: true,
  
  iOS: {
    bundleId: 'com.yourdomain.idearoute'
  },
  
  android: {
    packageName: 'com.yourdomain.idearoute',
    installApp: true,
    minimumVersion: '12'
  },
  
  dynamicLinkDomain: 'yourdomain.page.link'
};


export const emailVerificationConfig = {
  url: process.env.NEXT_PUBLIC_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth?verified=true`
    : 'http://localhost:3000/auth?verified=true',
  handleCodeInApp: true
};

// Firebase Console Email Template Configuration Instructions
export const FIREBASE_CONSOLE_SETUP_INSTRUCTIONS = {
  steps: [
    "1. Go to Firebase Console → Your Project → Authentication → Templates",
    "2. Click on 'Password reset' template",
    "3. Click 'Edit template'", 
    "4. In 'Action URL' field, change from default to your domain:",
    "   - Development: http://localhost:3000/reset-password",
    "   - Production: https://yourdomain.com/reset-password",
    "5. Save the template",
    "6. Repeat for 'Email address verification' template if needed"
  ],
  note: "This ensures users are redirected to your custom styled page instead of Firebase's generic page"
};
