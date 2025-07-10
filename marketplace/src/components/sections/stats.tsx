export function Stats() {
  const stats = [
    { label: 'Students Enrolled', value: '2,000,000+' },
    { label: 'Courses Available', value: '10,000+' },
    { label: 'Expert Instructors', value: '500+' },
    { label: 'Countries Reached', value: '190+' },
  ];

  return (
    <div className="container mx-auto px-4 text-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-white">
            <div className="text-4xl font-bold mb-2">{stat.value}</div>
            <div className="text-lg opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}