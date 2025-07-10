import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, GraduationCap, Award, BarChart3, 
  Users, Settings, LogOut, Menu, X, Plus, DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { PersonaType } from '@/types/persona';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const navigationConfig: Record<PersonaType, NavigationItem[]> = {
  learner: [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Browse Courses', path: '/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'My Learning', path: '/my-learning', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Certificates', path: '/certificates', icon: <Award className="w-5 h-5" /> },
  ],
  instructor: [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'My Courses', path: '/instructor/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Analytics', path: '/instructor/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Revenue', path: '/instructor/revenue', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Students', path: '/instructor/students', icon: <Users className="w-5 h-5" /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Courses', path: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ],
  super_admin: [
    { label: 'Platform', path: '/super/platform', icon: <Home className="w-5 h-5" /> },
    { label: 'Tenants', path: '/super/tenants', icon: <Users className="w-5 h-5" /> },
    { label: 'Analytics', path: '/super/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Settings', path: '/super/settings', icon: <Settings className="w-5 h-5" /> },
  ],
};

export const PersonaNavigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return null;

  const navigation = navigationConfig[user.persona] || [];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">MADFAM Academy</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.persona}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Create Course Button for Instructors */}
            {user.persona === 'instructor' && (
              <div className="px-6 mt-6">
                <Link
                  to="/instructor/courses/new"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Course</span>
                </Link>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">MADFAM</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-white z-40">
            <div className="flex flex-col h-full">
              {/* User Info */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.persona}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                  {navigation.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                          location.pathname === item.path
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Logout */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};