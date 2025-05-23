import React from "react";

interface XLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

export function XLogo({ size = 24, color = "currentColor", className = "" }: XLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Z"
        fill={color}
      />
    </svg>
  );
}