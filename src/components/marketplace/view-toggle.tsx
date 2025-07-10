import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-border rounded-md">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-l-md transition-colors ${
          view === 'grid' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-background text-muted-foreground hover:text-foreground'
        }`}
      >
        <Squares2X2Icon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-r-md transition-colors ${
          view === 'list' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-background text-muted-foreground hover:text-foreground'
        }`}
      >
        <ListBulletIcon className="h-4 w-4" />
      </button>
    </div>
  );
}