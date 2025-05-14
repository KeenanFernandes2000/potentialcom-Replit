const Stats = () => {
  const stats = [
    {
      value: "1 M+",
      label: "Empowered stakeholders"
    },
    {
      value: "1 B+",
      label: "AI Agent tasks"
    },
    {
      value: "20",
      label: "Years of Innovation"
    }
  ];

  return (
    <section id="stats" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] text-center mb-16">
          Trusted by Innovators Worldwide
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div 
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-4xl md:text-5xl font-bold text-[#14B6B8] mb-2">
                {stat.value}
              </div>
              <p className="text-xl text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
