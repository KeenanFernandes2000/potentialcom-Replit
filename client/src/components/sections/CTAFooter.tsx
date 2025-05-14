import { Button } from "@/components/ui/button";

const CTAFooter = () => {
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

  return (
    <section id="cta-footer" className="py-16 bg-[#0B1846] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 
          className="text-3xl md:text-4xl font-bold mb-6"
          data-aos="fade-up"
        >
          Get Started with Vera – Your AI Growth Partner!
        </h2>
        <p 
          className="text-xl mb-8 max-w-2xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Ready to transform your business with AI? Let Vera guide you through the perfect solution for your needs.
        </p>
        <Button 
          onClick={scrollToVera}
          className="rounded-full bg-[#14B6B8] hover:bg-[#14B6B8]/90 text-white font-bold uppercase px-8 py-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Talk to Vera
        </Button>
      </div>
    </section>
  );
};

export default CTAFooter;
