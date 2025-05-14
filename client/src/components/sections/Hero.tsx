import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToVera = () => {
    const vera = document.getElementById('vera');
    if (vera) {
      const offsetTop = vera.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Abstract SVG elements for decoration
  const AbstractShape1 = () => (
    <div className="absolute top-0 right-0 opacity-20">
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="150" r="150" fill="#14B6B8" />
      </svg>
    </div>
  );

  const AbstractShape2 = () => (
    <div className="absolute bottom-0 left-0 opacity-20">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#0B1846" />
      </svg>
    </div>
  );

  const AbstractShape3 = () => (
    <div className="absolute top-1/3 left-1/3 opacity-10">
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="50" width="300" height="300" transform="rotate(45 200 200)" fill="#14B6B8" fillOpacity="0.5" />
      </svg>
    </div>
  );

  return (
    <section id="hero" className="pt-32 pb-20 bg-white relative overflow-hidden">
      <AbstractShape1 />
      <AbstractShape2 />
      <AbstractShape3 />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
          <div className="md:w-1/2" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0B1846] leading-tight mb-6">
              Expand Your Human Team with Specialized AI Agents
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Rapidly deploy powerful AI team members who seamlessly integrate with your existing systems—backed by dedicated support to ensure instant ROI.
            </p>
            <Button 
              onClick={scrollToVera}
              className="rounded-full bg-[#14B6B8] hover:bg-[#14B6B8]/90 text-white font-bold uppercase px-8 py-6"
            >
              Talk to Vera
            </Button>
          </div>
          
          <div className="md:w-1/2 relative" data-aos="fade-up" data-aos-delay="200">
            {/* Hero image - AI business collaboration */}
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Business team collaborating with AI interfaces" 
              className="rounded-xl shadow-lg w-full h-auto object-cover" 
            />
          </div>
        </div>
        
        <div className="client-logos py-8 overflow-hidden" data-aos="fade-up" data-aos-delay="300">
          <h3 className="text-center text-gray-500 uppercase text-sm tracking-wider mb-6">Trusted by innovative companies worldwide</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {/* Client logos in grayscale - represented by placeholder divs */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-24 h-12 bg-gray-200 opacity-60 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
