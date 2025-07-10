import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from '@/components/layout/Layout';
import { CourseCatalog } from '@/pages/CourseCatalog';
import { useAuthStore } from '@/store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

// Mock login page for demo
const LoginPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = (persona: 'learner' | 'instructor' | 'admin') => {
    const mockUser = {
      id: '123',
      email: `${persona}@demo.com`,
      name: `Demo ${persona}`,
      persona,
      avatar: undefined,
    };
    setAuth(mockUser, 'mock-token');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MADFAM Academy Login</h1>
        <p className="text-gray-600 mb-6">Choose a persona to explore the platform:</p>
        <div className="space-y-3">
          <button
            onClick={() => handleLogin('learner')}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login as Learner
          </button>
          <button
            onClick={() => handleLogin('instructor')}
            className="w-full py-3 px-4 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
          >
            Login as Instructor
          </button>
          <button
            onClick={() => handleLogin('admin')}
            className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/courses" />} />
            <Route
              path="courses"
              element={
                <ProtectedRoute>
                  <CourseCatalog />
                </ProtectedRoute>
              }
            />
            <Route path="dashboard" element={<ProtectedRoute><div className="p-6">Dashboard (Coming Soon)</div></ProtectedRoute>} />
            <Route path="my-learning" element={<ProtectedRoute><div className="p-6">My Learning (Coming Soon)</div></ProtectedRoute>} />
            <Route path="certificates" element={<ProtectedRoute><div className="p-6">Certificates (Coming Soon)</div></ProtectedRoute>} />
            
            {/* Instructor Routes */}
            <Route path="instructor">
              <Route path="dashboard" element={<ProtectedRoute><div className="p-6">Instructor Dashboard (Coming Soon)</div></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute><div className="p-6">My Courses (Coming Soon)</div></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute><div className="p-6">Analytics (Coming Soon)</div></ProtectedRoute>} />
              <Route path="revenue" element={<ProtectedRoute><div className="p-6">Revenue (Coming Soon)</div></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute><div className="p-6">Students (Coming Soon)</div></ProtectedRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin">
              <Route path="dashboard" element={<ProtectedRoute><div className="p-6">Admin Dashboard (Coming Soon)</div></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute><div className="p-6">User Management (Coming Soon)</div></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute><div className="p-6">Platform Analytics (Coming Soon)</div></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><div className="p-6">Settings (Coming Soon)</div></ProtectedRoute>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;