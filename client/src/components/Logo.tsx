import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className = '', height = 40 }: LogoProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a mutation observer to monitor class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
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
      src={isDarkMode ? '/assets/images/logo-dark.png' : '/assets/images/logo-light.png'}
      alt="Potential.com Logo"
      height={height}
      className={`h-${height/4} ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}