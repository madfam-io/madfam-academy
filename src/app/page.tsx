import { Metadata } from 'next';
import { Hero } from '@/components/sections/hero';
import { FeaturedCourses } from '@/components/sections/featured-courses';
import { Categories } from '@/components/sections/categories';
import { Stats } from '@/components/sections/stats';
import { Testimonials } from '@/components/sections/testimonials';
import { Newsletter } from '@/components/sections/newsletter';

export const metadata: Metadata = {
  title: 'Home - Educational Marketplace for the Future',
  description: 'Discover cutting-edge courses, advance your skills, and join a community of forward-thinking learners at MADFAM Academy.',
  openGraph: {
    title: 'MADFAM Academy - Educational Marketplace for the Future',
    description: 'Discover cutting-edge courses, advance your skills, and join a community of forward-thinking learners.',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <Hero />
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <FeaturedCourses />
      </section>

      {/* Categories */}
      <section className="py-20">
        <Categories />
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <Stats />
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <Testimonials />
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <Newsletter />
      </section>
    </div>
  );
}