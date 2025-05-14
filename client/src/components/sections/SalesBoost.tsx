import { Button } from "@/components/ui/button";

const SalesBoost = () => {
  return (
    <section id="sales-boost" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div 
            className="md:w-1/2"
            data-aos="fade-right"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] mb-6">
              AI Agents to Boost Revenue
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our AI sales agents work 24/7 to generate leads, qualify prospects, and set appointments. 
              They integrate with your CRM and provide detailed analytics to optimize your sales funnel.
            </p>
            
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <div className="text-3xl md:text-4xl font-bold text-[#14B6B8] mb-2">50%</div>
              <p className="text-lg text-gray-600">
                Businesses using AI for sales see 50% more leads & appointments.
              </p>
            </div>
            
            <Button 
              className="rounded-full bg-[#14B6B8] hover:bg-[#14B6B8]/90 text-white font-bold uppercase px-8 py-6"
            >
              Boost Your Sales
            </Button>
          </div>
          
          <div 
            className="md:w-1/2 relative"
            data-aos="fade-left"
          >
            {/* Modern office technology image */}
            <img 
              src="https://images.unsplash.com/photo-1539193143244-c83d9436d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Modern sales technology interface" 
              className="rounded-xl shadow-lg w-full h-auto" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesBoost;
