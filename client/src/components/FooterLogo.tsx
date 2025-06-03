import { useEffect, useState } from "react";

// Import the logo images directly
import logoLight from "@assets/Potential.com Logos Main-01.png";
import logoDark from "@assets/Potential.com Logos Main-02.png";

interface FooterLogoProps {
  className?: string;
  height?: number;
}

export function FooterLogo({ className = "", height = 40 }: FooterLogoProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a mutation observer to monitor class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          checkDarkMode();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <img
      src={isDarkMode ? logoDark : logoLight}
      alt="Potential.com Logo"
      height={height}
      className={`h-auto ${className}`}
      style={{ 
        height: `${height}px`,
        filter: "brightness(0) invert(1)"
      }}
    />
  );
}
