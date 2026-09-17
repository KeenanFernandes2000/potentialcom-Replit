import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import UTMLink from "@/components/UTMLink";
import { useLocation } from "wouter";

const solutionCategoryLinks = [
  {
    label: "Workforce Capability",
    href: "/solutions/workforce-capability",
  },
  {
    label: "National & Community Empowerment",
    href: "/solutions/national-community-empowerment",
  },
  {
    label: "Customer & Partner Enablement",
    href: "/solutions/customer-partner-enablement",
  },
];

const solutionProgrammeLinks = [
  {
    label: "CSR & Community Impact",
    href: "/solutions/csr-community-impact",
  },
  {
    label: "Entrepreneurship & SME Development",
    href: "/solutions/entrepreneurship-sme-development",
  },
  { label: "Use Cases", href: "/usecases" },
];

const Header = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);
  const isSolutionsActive =
    location === "/solutions" ||
    location === "/usecases" ||
    [...solutionCategoryLinks, ...solutionProgrammeLinks].some((link) => isActive(link.href));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handlePointerDown = (event: PointerEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setIsSolutionsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSolutionsOpen(false);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsSolutionsOpen(false);
  };

  const linkClass = (href: string) =>
    `relative inline-flex items-center py-2 text-sm font-medium transition-colors ${
      isActive(href)
        ? "text-primary"
        : "text-foreground/80 hover:text-primary"
    }`;

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-effect border-b shadow-sm"
          : "bg-background/90 backdrop-blur-sm"
      }`}
    >
      <div className="container flex items-center justify-between py-4">
        <UTMLink href="/" className="flex items-center" aria-label="Potential.com home">
          <Logo height={40} />
        </UTMLink>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          <div className="relative" ref={solutionsRef}>
            <button
              type="button"
              className={`inline-flex items-center gap-1 py-2 text-sm font-medium transition-colors ${
                isSolutionsActive
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
              aria-haspopup="menu"
              aria-expanded={isSolutionsOpen}
              onClick={() => setIsSolutionsOpen((open) => !open)}
            >
              Solutions
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isSolutionsOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isSolutionsOpen && (
              <div
                className="absolute left-1/2 top-full z-50 mt-3 w-[22rem] -translate-x-1/2 rounded-2xl border border-border bg-popover p-3 shadow-xl"
                role="menu"
                aria-label="Solutions"
              >
                <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
                  Programme categories
                </p>
                {solutionCategoryLinks.map((link) => (
                  <UTMLink
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive(link.href)
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    }`}
                    onClick={closeMenus}
                  >
                    {link.label}
                  </UTMLink>
                ))}
                <div className="my-2 border-t border-border/60" />
                <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
                  Programme paths
                </p>
                {solutionProgrammeLinks.map((link) => (
                  <UTMLink
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive(link.href)
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    }`}
                    onClick={closeMenus}
                  >
                    {link.label}
                  </UTMLink>
                ))}
              </div>
            )}
          </div>

          <UTMLink href="/platform" className={linkClass("/platform")} onClick={closeMenus}>
            Platform
          </UTMLink>
          <UTMLink href="/case-studies" className={linkClass("/case-studies")} onClick={closeMenus}>
            Case Studies
          </UTMLink>
          <UTMLink href="/about" className={linkClass("/about")} onClick={closeMenus}>
            About
          </UTMLink>
          <UTMLink
            href="/inquire"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={closeMenus}
          >
            Discuss Your Initiative
          </UTMLink>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-foreground"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-primary-navigation"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-primary-navigation"
          aria-label="Mobile primary navigation"
          className="mobile-nav flex flex-col gap-1 border-t border-border/60 bg-background/95 px-6 py-5 shadow-md backdrop-blur md:hidden"
        >
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            Solutions
          </p>
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
            Programme categories
          </p>
          {solutionCategoryLinks.map((link) => (
            <UTMLink
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted hover:text-primary"
              }`}
              onClick={closeMenus}
            >
              {link.label}
            </UTMLink>
          ))}
          <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
            Programme paths
          </p>
          {solutionProgrammeLinks.map((link) => (
            <UTMLink
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted hover:text-primary"
              }`}
              onClick={closeMenus}
            >
              {link.label}
            </UTMLink>
          ))}
          <div className="my-2 border-t border-border/60" />
          <UTMLink href="/platform" className={linkClass("/platform")} onClick={closeMenus}>
            Platform
          </UTMLink>
          <UTMLink href="/case-studies" className={linkClass("/case-studies")} onClick={closeMenus}>
            Case Studies
          </UTMLink>
          <UTMLink href="/about" className={linkClass("/about")} onClick={closeMenus}>
            About
          </UTMLink>
          <UTMLink
            href="/inquire"
            className="mt-3 rounded-full bg-primary px-5 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={closeMenus}
          >
            Discuss Your Initiative
          </UTMLink>
        </nav>
      )}
    </header>
  );
};

export default Header;