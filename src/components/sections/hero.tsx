import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MagnifyingGlassIcon, PlayIcon } from '@heroicons/react/24/outline';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Learn Skills for the{' '}
            <span className="text-gradient bg-gradient-to-r from-primary to-blue-600">
              Future
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join millions of learners worldwide and master in-demand skills with expert-led courses. 
            Build your career, advance your knowledge, and achieve your goals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="magic-hover" asChild>
              <Link href="/marketplace">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Explore Courses
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="magic-hover">
              <PlayIcon className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">2M+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}