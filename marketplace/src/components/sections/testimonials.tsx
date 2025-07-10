export function Testimonials() {
  const testimonials = [
    {
      quote: "MADFAM Academy transformed my career. The courses are practical and taught by industry experts.",
      author: "Sarah Johnson",
      role: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b512212f?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The best investment I've made in my professional development. Highly recommend!",
      author: "Michael Chen",
      role: "Data Scientist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "Amazing platform with incredible instructors. I learned more here than in years of self-study.",
      author: "Emily Rodriguez",
      role: "UX Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">What Our Students Say</h2>
        <p className="text-lg text-muted-foreground">
          Join thousands of successful learners who have transformed their careers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="magic-card p-6">
            <blockquote className="text-muted-foreground mb-4">
              "{testimonial.quote}"
            </blockquote>
            <div className="flex items-center">
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}