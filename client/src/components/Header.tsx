import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import UTMLink from "@/components/UTMLink";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);

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
      const offsetTop =
        element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-effect border-b shadow-sm"
          : "bg-background/90 backdrop-blur-sm"
      }`}
    >
      <div className="container py-4 flex justify-between items-center">
        <div className="logo">
          <UTMLink href="/" className="flex items-center">
            <Logo height={40} />
          </UTMLink>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <div
            className="relative"
            onMouseEnter={() => setIsSolutionsDropdownOpen(true)}
            onMouseLeave={() => setIsSolutionsDropdownOpen(false)}
          >
            <button
              className="text-foreground/80 hover:text-primary font-medium transition-colors flex items-center gap-1"
              onClick={() =>
                setIsSolutionsDropdownOpen(!isSolutionsDropdownOpen)
              }
            >
              Solutions
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isSolutionsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSolutionsDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 w-48 z-50">
                <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
                  <div className="py-2">
                    <UTMLink
                      href="/voice"
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      AI Voice Agent
                    </UTMLink>
                    <UTMLink
                      href="/chatbot"
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      AI Chatbot
                    </UTMLink>
                    <UTMLink
                      href="/solutions"
                      className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      All Solutions
                    </UTMLink>
                  </div>
                </div>
              </div>
            )}
          </div>
          <UTMLink
            href="/pricing"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Pricing
          </UTMLink>
          <UTMLink
            href="/usecases"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Use Cases
          </UTMLink>
          <UTMLink
            href="/about"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            About Us
          </UTMLink>
          <UTMLink
            href="/vera"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Talk to Vera
          </UTMLink>

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
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="mobile-nav flex flex-col glass-effect w-full py-6 px-6 md:hidden shadow-md">
          <div className="mb-2">
            <div className="py-3 text-foreground font-medium">Solutions</div>
            <div className="ml-4 space-y-2">
              <UTMLink
                href="/voice"
                className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Voice Agent
              </UTMLink>
              <UTMLink
                href="/chatbot"
                className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Chatbot
              </UTMLink>
              <UTMLink
                href="/solutions"
                className="block py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Solutions
              </UTMLink>
            </div>
          </div>
          <UTMLink
            href="/pricing"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </UTMLink>
          <UTMLink
            href="/usecases"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Use Cases
          </UTMLink>
          <UTMLink
            href="/about"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            About Us
          </UTMLink>
          <UTMLink
            href="/vera"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Talk to Vera
          </UTMLink>
        </div>
      )}
    </header>
  );
};

export default Header;
