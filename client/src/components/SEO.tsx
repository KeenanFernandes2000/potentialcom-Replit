import { Helmet } from "react-helmet-async";
import { useSEO, SEOData } from "@/hooks/useSEO";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  author?: string;
  type?: string;
  noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  author,
  type = "website",
  noIndex = false,
}) => {
  const seoData = useSEO({
    title,
    description,
    keywords,
    image,
    url,
    author,
  });

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      {seoData.author && <meta name="author" content={seoData.author} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:type" content={type} />
      {seoData.url && <meta property="og:url" content={seoData.url} />}
      {seoData.image && <meta property="og:image" content={seoData.image} />}
      <meta property="og:site_name" content="Potential.com" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      {seoData.image && <meta name="twitter:image" content={seoData.image} />}

      {/* Additional SEO Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />

      {/* Canonical URL */}
      {seoData.url && <link rel="canonical" href={seoData.url} />}
    </Helmet>
  );
};

// Specialized component for blog posts with enhanced SEO
interface BlogSEOProps {
  title: string;
  description: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  slug?: string;
}

export const BlogSEO: React.FC<BlogSEOProps> = ({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  author,
  tags,
  slug,
}) => {
  const keywords = tags ? tags.join(", ") : "";
  const fullUrl = `https://potential.com/articles/${slug || ""}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}

      {/* Open Graph Article Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={fullUrl} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="Potential.com" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Additional SEO Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Article specific tags */}
      {tags &&
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}

      {/* JSON-LD Structured Data for better SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: description,
          image: image,
          author: {
            "@type": "Organization",
            name: author || "Potential.com",
          },
          publisher: {
            "@type": "Organization",
            name: "Potential.com",
            logo: {
              "@type": "ImageObject",
              url: "https://potential.com/logo.png",
            },
          },
          datePublished: publishedTime,
          dateModified: modifiedTime || publishedTime,
          url: fullUrl,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": fullUrl,
          },
        })}
      </script>
    </Helmet>
  );
};

// Auto SEO component that applies default SEO based on current route
export const AutoSEO: React.FC = () => {
  return <SEO />;
};
