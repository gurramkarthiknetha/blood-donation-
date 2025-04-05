import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RootLayout from './pages/rootLayout/RootLayout';
import Home from './pages/home/Home';
import Donor from './pages/donor/Donor';
import Reciever from './pages/reciever/Reciever';
import SigninPage from './pages/signinPage/SigninPage';
import BloodCamp from './pages/bloodCamp/BloodCamp';
import ReedemPage from './pages/reedemPage/ReedemPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SignupPage from './pages/signupPage/SignupPage';
import { authService } from './services/authService';
import { useEffect } from 'react';
import { NotificationComponent } from './components/NotificationComponent';
import { wsService } from './services/websocketService';
import { WebSocketErrorBoundary } from './components/WebSocketErrorBoundary';

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  useEffect(() => {
    if (authService.isAuthenticated()) {
      wsService.connect();
    }
    
    return () => {
      wsService.disconnect();
    };
  }, []);

  const browserRouterObj = createBrowserRouter([
    {
      element: (
        <WebSocketErrorBoundary>
          {authService.isAuthenticated() && (
            <div className="notification-wrapper">
              <NotificationComponent />
            </div>
          )}
          <RootLayout />
        </WebSocketErrorBoundary>
      ),
      path: '/',
      children: [
        {
          element: <Home />,
          path: '/'
        },
        {
          element: (
            <ProtectedRoute allowedRoles={['donor']}>
              <Donor />
            </ProtectedRoute>
          ),
          path: '/donor'
        },
        {
          element: (
            <ProtectedRoute allowedRoles={['hospital']}>
              <Reciever totalRequests={0} unitsReceived={0} />
            </ProtectedRoute>
          ),
          path: '/receiver'
        },
        {
          element: <SigninPage />,
          path: '/signin'
        },
        {
          element: (
            <ProtectedRoute allowedRoles={['donor', 'hospital']}>
              <BloodCamp />
            </ProtectedRoute>
          ),
          path: '/bloodCamp'
        },
        {
          element: (
            <ProtectedRoute allowedRoles={['donor']}>
              <ReedemPage />
            </ProtectedRoute>
          ),
          path: '/reedemPage'
        },
        {
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
          path: '/admin'
        },
        {
          element: <SignupPage />,
          path: '/signup'
        },
        {
          element: <SigninPage />,
          path: '/signinPage'
        }
      ]
    }
  ]);

  return (
    <>
      <RouterProvider router={browserRouterObj} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App