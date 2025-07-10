interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{ name: string; href: string }>;
}

export function MobileMenu({ isOpen, onClose, navigation }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={onClose} className="p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block py-3 text-base font-medium text-foreground hover:text-primary"
              onClick={onClose}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}