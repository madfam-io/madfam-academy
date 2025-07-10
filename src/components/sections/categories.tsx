export function Categories() {
  const categories = [
    { name: 'Web Development', icon: '💻', count: 1250 },
    { name: 'Data Science', icon: '📊', count: 890 },
    { name: 'Design', icon: '🎨', count: 654 },
    { name: 'Business', icon: '💼', count: 432 },
    { name: 'Marketing', icon: '📈', count: 398 },
    { name: 'Photography', icon: '📷', count: 287 },
    { name: 'Music', icon: '🎵', count: 234 },
    { name: 'Health & Fitness', icon: '💪', count: 189 },
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Popular Categories</h2>
        <p className="text-lg text-muted-foreground">
          Explore courses across different fields of expertise
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="magic-card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.count} courses</p>
          </div>
        ))}
      </div>
    </div>
  );
}