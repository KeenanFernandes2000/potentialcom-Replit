import logoDark from '@assets/Potential.com Logos Main-02.png';

interface FooterLogoProps {
  className?: string;
  height?: number;
}

export function FooterLogo({ className = '', height = 40 }: FooterLogoProps) {
  return (
    <img
      src={logoDark}
      alt="Potential.com Logo"
      height={height}
      className={`h-auto ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}