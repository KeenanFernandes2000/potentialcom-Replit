import React from "react";
import parse, {
  HTMLReactParserOptions,
  Element,
  domToReact,
} from "html-react-parser";
import AdComponent from "./AdComponent";

interface BlogContentWithAdsProps {
  content: string;
  className?: string;
}

export const BlogContentWithAds: React.FC<BlogContentWithAdsProps> = ({
  content,
  className = "",
}) => {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      // Remove all script tags for security
      if (domNode.type === "tag" && domNode.name === "script") {
        return <></>;
      }

      // Replace AdSense ins tags with our AdComponent
      if (
        domNode.type === "tag" &&
        domNode.name === "ins" &&
        domNode.attribs &&
        domNode.attribs.class?.includes("adsbygoogle")
      ) {
        const slot = domNode.attribs["data-ad-slot"];
        const format = domNode.attribs["data-ad-format"] || "auto";
        const responsive =
          domNode.attribs["data-full-width-responsive"] !== "false";

        console.log(domNode);

        // Check if this ins tag is inside a paragraph or other inline context
        // We'll determine this by checking if the parent context suggests inline usage
        const isInlineContext = !!(
          domNode.parent &&
          domNode.parent.type === "tag" &&
          ["p", "span", "a", "em", "strong", "i", "b", "u", "small"].includes(
            domNode.parent.name
          )
        );

        if (slot) {
          return (
            <AdComponent
              slot={slot}
              format={format}
              responsive={responsive}
              className={isInlineContext ? "my-2" : "my-8"}
              inline={isInlineContext}
            />
          );
        }
      }

      // For all other elements, continue with default parsing
      return undefined;
    },
  };

  return <div className={className}>{parse(content, options)}</div>;
};

export default BlogContentWithAds;
