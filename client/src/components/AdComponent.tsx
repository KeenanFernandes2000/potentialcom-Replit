import React, { useEffect, useRef } from "react";

interface AdComponentProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
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
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Initialize adsbygoogle array if it doesn't exist
      if (typeof window !== "undefined") {
        window.adsbygoogle = window.adsbygoogle || [];

        // Push the ad for initialization
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error("AdSense initialization error:", error);
    }
  }, []);

  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div ref={adRef} className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4560705956205775"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
        data-adtest={!isProduction ? "on" : undefined}
      />
    </div>
  );
};

export default AdComponent;
