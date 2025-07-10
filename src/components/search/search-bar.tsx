export function SearchBar() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search courses..."
        className="w-full h-10 pl-4 pr-10 rounded-md border border-input bg-background text-sm"
      />
      <button className="absolute right-2 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  );
}