import React, { useEffect, useRef } from "react";
import { safelyObserveDOM } from "@/lib/utils";

interface AdComponentProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  inline?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdComponent: React.FC<AdComponentProps> = ({
  slot,
  format = "auto",
  responsive = true,
  style,
  className = "",
  inline = false,
}) => {
  const adRef = useRef<HTMLElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return;
    }

    // Only initialize if we have a valid DOM element
    if (!adRef.current) {
      return;
    }

    // Use the safe DOM utility to ensure proper initialization
    safelyObserveDOM.onReady(() => {
      initializeAd();
    });

    function initializeAd() {
      try {
        // Check if element is still valid
        if (!safelyObserveDOM.isValidElement(adRef.current)) {
          return;
        }

        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || [];

        // Use requestAnimationFrame to ensure DOM is fully ready
        requestAnimationFrame(() => {
          try {
            // Final check before initialization
            if (
              safelyObserveDOM.isValidElement(adRef.current) &&
              !initialized.current
            ) {
              initialized.current = true;
              window.adsbygoogle.push({});
            }
          } catch (error) {
            console.error("AdSense requestAnimationFrame error:", error);
          }
        });
      } catch (error) {
        console.error("AdSense initialization error:", error);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      initialized.current = false;
    };
  }, []);

  const isProduction = process.env.NODE_ENV === "production";

  // Use span for inline rendering, div for block rendering
  const Container = inline ? "span" : "div";

  return (
    <Container
      ref={adRef as any}
      className={`ad-container ${className}`}
      style={style}
    >
      <ins
        className="adsbygoogle"
        style={{ display: inline ? "inline-block" : "block" }}
        data-ad-client="ca-pub-4560705956205775"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
        data-adtest={!isProduction ? "on" : undefined}
      />
    </Container>
  );
};

export default AdComponent;
