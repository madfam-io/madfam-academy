'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { 
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/search-bar';
import { UserMenu } from '@/components/layout/user-menu';
import { PersonaSelector } from '@/components/layout/persona-selector';
import { MobileMenu } from '@/components/layout/mobile-menu';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Categories', href: '/categories' },
    { name: 'Instructors', href: '/instructors' },
    { name: 'Business', href: '/business' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="hidden font-bold text-xl sm:inline-block">
                MADFAM Academy
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center section - Search (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <SearchBar />
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Search (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Persona Selector */}
            <PersonaSelector />

            {/* Wishlist */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wishlist">
                <HeartOutline className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <BellIcon className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="lg:hidden border-t bg-background p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <SearchBar />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
      />
    </header>
  );
}