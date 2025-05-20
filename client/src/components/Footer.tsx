import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
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
              <Logo height={36} />
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
            <p className="opacity-80">© {new Date().getFullYear()} Potential.com. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
