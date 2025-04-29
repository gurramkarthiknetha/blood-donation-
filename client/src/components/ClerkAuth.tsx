import { SignIn, SignUp, useAuth, useUser, useSession } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface ClerkAuthProps {
  mode: 'signin' | 'signup';
}

export function ClerkAuth({ mode }: ClerkAuthProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && user && session) {
      // When user signs in with Clerk, sync with our backend
      const syncUserWithBackend = async () => {
        try {
          // Get session token for API authentication
          const token = await session.getToken();

          // Extract user data from Clerk
          const userData = {
            email: user.primaryEmailAddress?.emailAddress,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            // Default role - can be changed later
            role: 'donor',
            // Other fields can be added as needed
          };

          // Store Clerk user data in local storage
          localStorage.setItem('clerkUser', JSON.stringify(userData));

          // Set token to ensure isAuthenticated() returns true
          localStorage.setItem('token', token || 'clerk-auth');
          localStorage.setItem('userRole', 'donor');

          // Navigate to donor dashboard after successful authentication
          navigate('/donor');

          // You can also call your backend to sync the user
          // await authService.syncClerkUser(userData);
        } catch (error) {
          console.error('Error syncing user with backend:', error);
        }
      };

      syncUserWithBackend();
    }
  }, [isSignedIn, user, session, navigate]);

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
