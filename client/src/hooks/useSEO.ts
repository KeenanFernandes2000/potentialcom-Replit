import { useMemo } from "react";
import { useLocation } from "wouter";
import seoConfig from "@/config/seo-config.json";

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  author?: string;
  image?: string;
  url?: string;
}

export const useSEO = (customSEO?: Partial<SEOData>): SEOData => {
  const [location] = useLocation();

  return useMemo(() => {
    // Handle dynamic routes (like blog posts) by checking for patterns
    let matchedRoute = location;

    // Check for blog category pattern
    if (location.startsWith("/blog/category/")) {
      matchedRoute = "/blog/category/:slug";
    }
    // Check for blog post pattern
    else if (location.startsWith("/articles/")) {
      matchedRoute = "/articles/:slug";
    }

    // Get page-specific SEO or fall back to defaults
    const pageSEO =
      seoConfig.pages[matchedRoute as keyof typeof seoConfig.pages] || {};
    const defaultSEO = seoConfig.defaultSEO;

    // Generate full URL
    const fullUrl = customSEO?.url || `${defaultSEO.url}${location}`;

    // Merge in this order: defaults -> page-specific -> custom overrides
    const seoData: SEOData = {
      title: customSEO?.title || pageSEO.title || defaultSEO.title,
      description:
        customSEO?.description || pageSEO.description || defaultSEO.description,
      keywords: customSEO?.keywords || pageSEO.keywords || defaultSEO.keywords,
      author: customSEO?.author || defaultSEO.author,
      image: customSEO?.image || defaultSEO.image,
      url: fullUrl,
    };

    return seoData;
  }, [location, customSEO]);
};

// Helper hook for blog posts and dynamic content
export const useDynamicSEO = (
  title?: string,
  description?: string,
  keywords?: string,
  image?: string
): SEOData => {
  const [location] = useLocation();

  return useMemo(() => {
    const defaultSEO = seoConfig.defaultSEO;

    return {
      title: title || defaultSEO.title,
      description: description || defaultSEO.description,
      keywords: keywords || defaultSEO.keywords,
      author: defaultSEO.author,
      image: image || defaultSEO.image,
      url: `${defaultSEO.url}${location}`,
    };
  }, [title, description, keywords, image, location]);
};
