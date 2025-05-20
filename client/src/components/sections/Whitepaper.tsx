import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download } from "lucide-react";

const Whitepaper = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Track the download with the backend
      await fetch('/api/resources/track-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resourceName: 'Amplified Intelligence Whitepaper'
        }),
      });
      
      // Subscribe to newsletter if user is not already subscribed
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      toast({
        title: "Success!",
        description: "Your whitepaper is ready to download.",
      });
      
      // Instead of triggering a download programmatically, open the PDF directly in a new tab
      window.open('/amplified-intelligence-whitepaper.pdf', '_blank');
      
      // Clear the email field
      setEmail("");
    } catch (error) {
      console.error("Error tracking download:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="whitepaper" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/5 to-background/0 z-0"></div>
      <div className="container relative z-10">
        <div 
          className="grid md:grid-cols-2 gap-10 items-center"
          data-aos="fade-up"
        >
          {/* Left side - Document Preview */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left bg-black/90 p-8 rounded-2xl">
            <div className="w-24 h-24 rounded-full bg-purple-950 flex items-center justify-center text-primary mb-6">
              <FileText className="h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-3xl font-bold mb-2 text-white">Amplified Intelligence</h3>
            <p className="text-xl mb-8 text-white/80">The Future of Enterprise AI</p>
            
            <div className="w-full px-6 py-3 bg-black/60 rounded-full border border-purple-700/30 flex items-center mb-8">
              <span className="mr-2">📄</span>
              <span className="text-white">Amplifying Human Potential with AI - Whitepaper</span>
            </div>
            
            <p className="text-sm text-gray-400 text-center mb-4">
              Comprehensive research on how AI is transforming businesses and creating new opportunities.
            </p>
          </div>
          
          {/* Right side - Download Form */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold mb-4">Download Our Latest Whitepaper</h2>
            <p className="text-muted-foreground mb-8">
              Explore how AI is revolutionizing business operations and empowering organizations to achieve more. 
              Complete the form to get instant access to our comprehensive whitepaper.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-semibold"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">Processing...</span>
                ) : (
                  <span className="flex items-center">
                    <Download className="mr-2 h-4 w-4" /> Download Whitepaper
                  </span>
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-sm text-muted-foreground">
              <p>By submitting this form, you agree to receive communications from Potential.com. 
              You can unsubscribe at any time. We respect your privacy and will never share your information.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Whitepaper;