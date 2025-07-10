import { Button } from '@/components/ui/button';

export function Newsletter() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Stay Updated with New Courses
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Get notified about new courses, special offers, and learning tips delivered to your inbox.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 h-12 px-4 rounded-md border border-input bg-background"
          />
          <Button size="lg" className="magic-hover">
            Subscribe
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          No spam, unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}