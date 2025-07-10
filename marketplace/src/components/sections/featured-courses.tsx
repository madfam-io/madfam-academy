export function FeaturedCourses() {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Featured Courses</h2>
        <p className="text-lg text-muted-foreground">
          Discover our most popular and highly-rated courses
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Course cards will be loaded here */}
        <div className="text-center py-12 col-span-full">
          <p className="text-muted-foreground">Loading featured courses...</p>
        </div>
      </div>
    </div>
  );
}