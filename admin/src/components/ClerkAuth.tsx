import { SignIn, SignUp, useAuth, useUser, useSession } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useAuth as useAdminAuth } from '../context/AuthContext';

interface ClerkAuthProps {
  mode: 'signin' | 'signup';
}

export function ClerkAuth({ mode }: ClerkAuthProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const { login } = useAdminAuth();

  useEffect(() => {
    if (isSignedIn && user && session) {
      // When admin signs in with Clerk, sync with our context
      const syncAdminWithContext = async () => {
        try {
          // Use session token instead of user.getToken()
          const token = await session.getToken();

          // Store token in admin context
          if (token) {
            login(token);
          }
        } catch (error) {
          console.error('Error syncing admin with context:', error);
        }
      };

      syncAdminWithContext();
    }
  }, [isSignedIn, user, session, login]);

  return (
    <div className="clerk-auth-container">
      {mode === 'signin' ? (
        <SignIn routing="virtual" />
      ) : (
        <SignUp routing="virtual" />
      )}
    </div>
  );
}
