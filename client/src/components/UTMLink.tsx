import React from "react";
import { Link as WouterLink } from "wouter";
import { addUTMToUrl, isInternalUrl } from "@/lib/utm-utils";

interface UTMLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}

/**
 * Custom Link component that preserves UTM parameters for internal navigation
 */
export const UTMLink: React.FC<UTMLinkProps> = ({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  "aria-label": ariaLabel,
  ...props
}) => {
  // For external URLs, use regular anchor tag
  if (!isInternalUrl(href)) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </a>
    );
  }

  // For internal URLs, use wouter Link with UTM parameters
  const urlWithUTM = addUTMToUrl(href);

  return (
    <WouterLink
      href={urlWithUTM}
      className={className}
      onClick={onClick}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </WouterLink>
  );
};

export default UTMLink;
