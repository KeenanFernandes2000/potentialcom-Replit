import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm' : 'bg-white/95'}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="logo">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="text-[#0B1846] font-bold text-2xl"
          >
            Potential.com
          </a>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            Home
          </a>
          <a 
            href="#tools" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("tools");
            }}
            className="text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            AI Tools
          </a>
          <a 
            href="#solutions" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("solutions");
            }}
            className="text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            Solutions
          </a>
          <a 
            href="#vera" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("vera");
            }}
            className="text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            Meet Vera
          </a>
        </nav>
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu />
        </Button>
      </div>
      
      {isMenuOpen && (
        <div className="mobile-nav flex flex-col bg-white w-full py-4 px-4 md:hidden shadow-md">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="py-2 text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            Home
          </a>
          <a 
            href="#tools" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("tools");
            }}
            className="py-2 text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            AI Tools
          </a>
          <a 
            href="#solutions" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("solutions");
            }}
            className="py-2 text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            Solutions
          </a>
          <a 
            href="#vera" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("vera");
            }}
            className="py-2 text-gray-700 hover:text-[#14B6B8] font-medium"
          >
            Meet Vera
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
