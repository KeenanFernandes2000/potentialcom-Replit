import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Mail, ArrowRight, Check } from "lucide-react";

const Whitepaper = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
    
    // In a real implementation, you would post to an API endpoint
    // The actual download would either be immediate or sent via email
  };
  
  return (
    <section id="whitepaper" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent"></div>
      <div className="absolute -right-20 bottom-20 w-40 h-40 rounded-full bg-primary/10 filter blur-3xl"></div>
      
      <div className="container">
        <div className="max-w-4xl mx-auto glass-effect border border-border p-8 md:p-12 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left side - Content */}
            <div className="md:w-3/5" data-aos="fade-right">
              <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <FileText className="h-4 w-4 mr-2" /> Free Resource
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Download Our <span className="text-primary">"Amplified Intelligence"</span> Whitepaper
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Learn how organizations are combining human expertise with AI to achieve breakthrough results. Our comprehensive whitepaper provides actionable strategies for implementing AI across your business.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Case studies from leading organizations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Implementation frameworks and best practices</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>ROI metrics and measurement strategies</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Form */}
            <div className="md:w-2/5" data-aos="fade-left">
              <div className="bg-background border border-border p-6 rounded-xl">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit}>
                    <h3 className="font-semibold mb-4">Get Instant Access</h3>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          required
                        />
                      </div>
                      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full rounded-md bg-primary hover:bg-primary/90 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Download Whitepaper"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      We respect your privacy and will never share your information.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Thank You!</h3>
                    <p className="text-muted-foreground mb-4">Your download will begin shortly.</p>
                    <a 
                      href="#"
                      className="text-primary font-medium hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real implementation, this would be the actual download link
                        alert("In a real implementation, this would download the PDF");
                      }}
                    >
                      Click here if your download doesn't start
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Whitepaper;