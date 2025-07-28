import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword, validateEmail, validatePassword } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, currentPassword, newPassword } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'hash-password':
        if (!password) {
          return NextResponse.json(
            { error: 'Password is required' },
            { status: 400 }
          );
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          return NextResponse.json(
            { error: passwordValidation.error },
            { status: 400 }
          );
        }

        const hashedPassword = await hashPassword(password);
        return NextResponse.json({ hashedPassword });

      case 'verify-password':
        if (!password || !currentPassword) {
          return NextResponse.json(
            { error: 'Both password and current password are required' },
            { status: 400 }
          );
        }

        const isValid = await verifyPassword(password, currentPassword);
        return NextResponse.json({ isValid });

      case 'validate-credentials':
        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }
          );
        }

        const emailValid = validateEmail(email);
        const passValidation = validatePassword(password);

        return NextResponse.json({
          emailValid,
          passwordValid: passValidation.isValid,
          passwordMessage: passValidation.error
        });

      case 'change-password':
        if (!currentPassword || !newPassword) {
          return NextResponse.json(
            { error: 'Current password and new password are required' },
            { status: 400 }
          );
        }

        const newPasswordValidation = validatePassword(newPassword);
        if (!newPasswordValidation.isValid) {
          return NextResponse.json(
            { error: newPasswordValidation.error },
            { status: 400 }
          );
        }

        const newHashedPassword = await hashPassword(newPassword);
        return NextResponse.json({ hashedPassword: newHashedPassword });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Auth API is running' },
    { status: 200 }
  );
}
