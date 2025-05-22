interface FooterLogoProps {
  className?: string;
  height?: number;
}

export function FooterLogo({ className = '', height = 40 }: FooterLogoProps) {
  return (
    <img
      src="/logo-white.png"
      alt="Potential.com Logo"
      height={height}
      className={`h-auto ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}