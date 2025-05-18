import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to update header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
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
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect border-b shadow-sm' : 'bg-background/90 backdrop-blur-sm'
    }`}>
      <div className="container py-4 flex justify-between items-center">
        <div className="logo">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="flex items-center"
          >
            <Logo height={40} />
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Home
          </a>
          <a 
            href="#agents" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("agents");
            }}
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            AI Agents
          </a>
          <a 
            href="/offerings"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Offerings
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("pricing");
            }}
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Pricing
          </a>
          <a 
            href="#learn" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("learn");
            }}
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Learn
          </a>
          <a 
            href="#start" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("start");
            }}
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Get Started
          </a>
          
          <div className="pl-4">
            <ThemeToggle />
          </div>
        </nav>
        
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="mobile-nav flex flex-col glass-effect w-full py-6 px-6 md:hidden shadow-md">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
          >
            Home
          </a>
          <a 
            href="#agents" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("agents");
            }}
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
          >
            AI Agents
          </a>
          <a 
            href="/offerings"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Offerings
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("pricing");
            }}
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
          >
            Pricing
          </a>
          <a 
            href="#learn" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("learn");
            }}
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
          >
            Learn
          </a>
          <a 
            href="#start" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("start");
            }}
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
          >
            Get Started
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
