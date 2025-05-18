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
    
    // In a real implementation, you would send this to your backend
    // For now we'll just simulate a successful submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Success!",
        description: "Your whitepaper is ready to download.",
      });
      
      // Trigger the download
      const link = document.createElement('a');
      link.href = '/assets/pdfs/amplified-intelligence-whitepaper.pdf';
      link.download = 'Amplified-Intelligence-Whitepaper.pdf';
      link.click();
      
      // Clear the email field
      setEmail("");
    }, 1000);
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
          <div className="glass-effect p-8 rounded-2xl border border-border shadow-lg flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-4 mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Amplified Intelligence</h3>
            <p className="text-lg mb-4">The Future of Enterprise AI</p>
            <div className="w-full max-w-xs h-72 bg-background/40 rounded-lg flex items-center justify-center mb-4 border border-border">
              <div className="text-center p-4">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Amplified Intelligence Whitepaper</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
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