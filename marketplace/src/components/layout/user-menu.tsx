import { UserIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  return (
    <Button variant="ghost" size="sm">
      <UserIcon className="h-5 w-5" />
      <span className="sr-only">User menu</span>
    </Button>
  );
}