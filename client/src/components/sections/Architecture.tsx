const Architecture = () => {
  // Partner logos - placeholders
  const partners = Array.from({ length: 6 }).map((_, i) => `Partner ${i + 1}`);

  return (
    <section id="architecture" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1846] text-center mb-6">
          API-Based Agentic AI Solution Architecture
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          We guide you in connecting agents to each other or to your systems via our API to supercharge productivity.
        </p>
        
        <div 
          className="bg-gray-100 p-8 rounded-xl shadow-sm mb-16"
          data-aos="fade-up"
        >
          <div className="bg-white p-8 rounded-lg">
            {/* Architecture diagram SVG */}
            <svg 
              className="w-full h-64 md:h-96" 
              viewBox="0 0 1000 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Architecture diagram showing API connections between AI agents and systems"
            >
              {/* Central API Hub */}
              <circle cx="500" cy="250" r="100" fill="#14B6B8" fillOpacity="0.2" />
              <text x="500" y="250" textAnchor="middle" fill="#0B1846" fontWeight="bold" fontSize="20">API Hub</text>
              
              {/* AI Agent Nodes */}
              <circle cx="250" cy="150" r="60" fill="#0B1846" fillOpacity="0.1" />
              <text x="250" y="150" textAnchor="middle" fill="#0B1846" fontWeight="bold" fontSize="16">Agent 1</text>
              
              <circle cx="250" cy="350" r="60" fill="#0B1846" fillOpacity="0.1" />
              <text x="250" y="350" textAnchor="middle" fill="#0B1846" fontWeight="bold" fontSize="16">Agent 2</text>
              
              <circle cx="750" cy="150" r="60" fill="#0B1846" fillOpacity="0.1" />
              <text x="750" y="150" textAnchor="middle" fill="#0B1846" fontWeight="bold" fontSize="16">System 1</text>
              
              <circle cx="750" cy="350" r="60" fill="#0B1846" fillOpacity="0.1" />
              <text x="750" y="350" textAnchor="middle" fill="#0B1846" fontWeight="bold" fontSize="16">System 2</text>
              
              {/* Connection lines */}
              <line x1="310" y1="150" x2="400" y2="200" stroke="#14B6B8" strokeWidth="3" strokeDasharray="5,5" />
              <line x1="310" y1="350" x2="400" y2="300" stroke="#14B6B8" strokeWidth="3" strokeDasharray="5,5" />
              <line x1="600" y1="200" x2="690" y2="150" stroke="#14B6B8" strokeWidth="3" strokeDasharray="5,5" />
              <line x1="600" y1="300" x2="690" y2="350" stroke="#14B6B8" strokeWidth="3" strokeDasharray="5,5" />
            </svg>
          </div>
        </div>
        
        <div 
          className="flex flex-wrap justify-center gap-8 mb-8"
          data-aos="fade-up"
        >
          {partners.map((partner, index) => (
            <div 
              key={index} 
              className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Architecture;
