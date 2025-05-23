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
            href="/"
            className="flex items-center"
          >
            <Logo height={40} />
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="/solutions"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Solutions
          </a>
          <a 
            href="/pricing"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Pricing
          </a>
          <a 
            href="/resources"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Resources
          </a>
          <a 
            href="/about"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            About Us
          </a>
          <a 
            href="https://ai.potential.com/login?utm_source=bot&utm_medium=main"
            target="_blank"
            rel="noopener noreferrer"
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
            href="/solutions"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Solutions
          </a>
          <a 
            href="/pricing"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </a>
          <a 
            href="/resources"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Resources
          </a>
          <a 
            href="https://ai.potential.com/login?utm_source=bot&utm_medium=main"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
