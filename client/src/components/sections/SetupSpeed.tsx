const SetupSpeed = () => {
  const metrics = [
    {
      title: "Hours",
      subtitle: "Not months"
    },
    {
      title: "Days",
      subtitle: "To ROI"
    },
    {
      title: "24/7",
      subtitle: "Availability"
    }
  ];

  return (
    <section id="setup-speed" className="py-20 bg-[#0B1846] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div 
            className="md:w-1/2"
            data-aos="fade-right"
          >
            {/* Digital transformation image */}
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Digital transformation visualization" 
              className="rounded-xl shadow-lg w-full h-auto" 
            />
          </div>
          
          <div 
            className="md:w-1/2"
            data-aos="fade-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Started in Minutes</h2>
            <p className="text-xl mb-8">
              While others take months to implement AI solutions, our pre-built agents can be deployed in hours. 
              We've designed our platform for fast implementation and immediate value.
            </p>
            <div className="flex flex-wrap gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-[#14B6B8]/20 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-[#14B6B8] mb-1">{metric.title}</div>
                  <div className="text-gray-300">{metric.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetupSpeed;
