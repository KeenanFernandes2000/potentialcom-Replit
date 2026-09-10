import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import UTMLink from "@/components/UTMLink";

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
          <UTMLink
            href="/platform"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Platform
          </UTMLink>
          <UTMLink
            href="/usecases"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Use Cases
          </UTMLink>
          <UTMLink
            href="/case-studies"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            Case Studies
          </UTMLink>
          <UTMLink
            href="/about"
            className="text-foreground/80 hover:text-primary font-medium transition-colors"
          >
            About
          </UTMLink>
          <UTMLink
            href="/ayla"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Talk to Ayla
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
          <UTMLink
            href="/platform"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Platform
          </UTMLink>
          <UTMLink
            href="/usecases"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Use Cases
          </UTMLink>
          <UTMLink
            href="/case-studies"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Case Studies
          </UTMLink>
          <UTMLink
            href="/about"
            className="py-3 text-foreground hover:text-primary font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </UTMLink>
          <UTMLink
            href="/ayla"
            className="mt-3 rounded-full bg-primary px-5 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => setIsMenuOpen(false)}
          >
            Talk to Ayla
          </UTMLink>
        </div>
      )}
    </header>
  );
};

export default Header;
