import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { FooterLogo } from "./FooterLogo";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="py-12 bg-secondary/95 text-secondary-foreground">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <FooterLogo height={36} />
            </div>
            <p className="mb-4">Empowering organizations through AI tools that help them in turn empower their stakeholders.</p>
            <div className="flex items-center space-x-2 mt-6">
              <ThemeToggle />
              <span className="text-sm opacity-70">Switch Theme</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#hero" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("hero");
                  }}
                  className="opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#tools" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("tools");
                  }}
                  className="opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                >
                  AI Tools
                </a>
              </li>
              <li>
                <a 
                  href="#solutions" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("solutions");
                  }}
                  className="opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                >
                  Solutions
                </a>
              </li>
              <li>
                <a 
                  href="https://ai.potential.com/rachel" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                >
                  Meet Rachel
                </a>
              </li>
              <li>
                <a 
                  href="/login"
                  className="opacity-80 hover:opacity-100 hover:text-primary transition-colors"
                >
                  Login / Register
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="opacity-80">contact@potential.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="opacity-80">+1 862 267 9307</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="opacity-80 mb-4">Subscribe to our newsletter for the latest AI innovations.</p>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const emailInput = form.elements.namedItem('email') as HTMLInputElement;
                
                if (!emailInput.value || !emailInput.value.includes('@')) {
                  toast({
                    title: "Invalid Email",
                    description: "Please enter a valid email address.",
                    variant: "destructive",
                  });
                  return;
                }
                
                try {
                  const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: emailInput.value }),
                  });
                  
                  if (response.ok) {
                    toast({
                      title: "Success!",
                      description: "You've been subscribed to our newsletter.",
                    });
                    emailInput.value = '';
                  } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Subscription failed');
                  }
                } catch (error) {
                  console.error("Newsletter subscription error:", error);
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              className="flex gap-2"
            >
              <input 
                type="email" 
                name="email"
                placeholder="Your email" 
                className="bg-secondary-foreground/10 border border-secondary-foreground/20 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/80">
                Join
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="opacity-80">© 2005 - {new Date().getFullYear()} Potential.com. All rights reserved.</p>
            <div className="flex gap-4 mt-2 text-sm opacity-70">
              <a href="/terms" className="hover:text-primary transition-colors">
                Terms of Use
              </a>
              <span>|</span>
              <a href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/potential" className="hover:text-primary transition-colors" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <Linkedin size={20} />
            </a>
            <a href="https://x.com/potentialcom?lang=en" className="hover:text-primary transition-colors" aria-label="X (formerly Twitter)" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
            <a href="https://www.facebook.com/PotentialCom" className="hover:text-primary transition-colors" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/potential_dotcom/" className="hover:text-primary transition-colors" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </a>
            <a href="https://www.youtube.com/c/PotentialCom" className="hover:text-primary transition-colors" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
