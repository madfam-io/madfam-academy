import React from 'react';
import { Outlet } from 'react-router-dom';
import { PersonaNavigation } from './PersonaNavigation';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export const Layout: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <PersonaNavigation />}
      
      <main className={cn(
        'min-h-screen',
        user ? 'lg:ml-64 pt-16 lg:pt-0' : ''
      )}>
        <Outlet />
      </main>
    </div>
  );
};