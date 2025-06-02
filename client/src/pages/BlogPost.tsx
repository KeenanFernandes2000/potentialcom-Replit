import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { fetchPost } from "@/lib/blog-api";
import { useBlogContext } from "@/lib/blog-context";
import { BlogProvider } from "@/lib/blog-context";
import { LanguageSwitch } from "@/components/blog/LanguageSwitch";
import { CategoryList } from "@/components/blog/CategoryList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlogSEO } from "@/components/SEO";
import { format } from "date-fns";
import React from "react";
import { detectLanguage } from "@/lib/language-utils";

// Function to remove the first p tag containing the featured image
const removeFirstImageFromContent = (
  content: string,
  featuredImageUrl: string
) => {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // Look for the first p tag with an image matching the featured image URL
  const paragraphs = tempDiv.querySelectorAll("p");
  // Convert NodeList to Array to avoid iteration issues
  const paragraphsArray = Array.from(paragraphs);
  for (let i = 0; i < paragraphsArray.length; i++) {
    const p = paragraphsArray[i];
    const img = p.querySelector("img");
    // Check if this p tag contains an image with the same source
    if (
      img &&
      img.src &&
      img.src.includes(featuredImageUrl.split("/").pop() || "")
    ) {
      // Remove this paragraph
      p.remove();
      break;
    }
  }

  return tempDiv.innerHTML;
};

// Helper function to extract plain text from HTML for description
const extractTextFromHTML = (html: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

function BlogPostContent() {
  const { language, isRTL, setLanguage } = useBlogContext();
  const [, params] = useRoute("/articles/:slug");
  const [location] = useLocation();
  const slug = params?.slug || "";

  // Detect language from slug
  const slugLanguage = detectLanguage(slug);

  // Set language based on slug language
  React.useEffect(() => {
    if (slugLanguage === "ar" && language !== "ar") {
      console.log(
        `[BLOG-POST] Setting language to Arabic based on slug: ${slug}`
      );
      setLanguage("ar");
    }
  }, [slug, slugLanguage, language, setLanguage]);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", slugLanguage, slug],
    queryFn: () => {
      console.log(
        `[BLOG-POST] Fetching post with slug=${slug}, detected language=${slugLanguage}`
      );
      return fetchPost(slug, slugLanguage);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Process content to remove duplicate featured image
  const processedContent = React.useMemo(() => {
    if (!post || !post.content.rendered || !post.featured_image_url) {
      return post?.content.rendered || "";
    }
    return removeFirstImageFromContent(
      post.content.rendered,
      post.featured_image_url
    );
  }, [post]);

  // Generate SEO description from post excerpt or content
  const seoDescription = React.useMemo(() => {
    if (!post) return "";

    if (post.excerpt.rendered) {
      const excerpt = extractTextFromHTML(post.excerpt.rendered);
      return excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt;
    }

    if (post.content.rendered) {
      const content = extractTextFromHTML(post.content.rendered);
      return content.length > 160 ? content.substring(0, 157) + "..." : content;
    }

    return "";
  }, [post]);

  // Extract categories as tags if available
  const postTags = React.useMemo(() => {
    if (!post?._embedded?.["wp:term"]?.[0]) return [];

    // Extract category names from embedded terms
    return post._embedded["wp:term"][0].map(
      (term: any) => term.name || term.slug || String(term)
    );
  }, [post]);

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? "rtl" : "ltr"}`}>
      {post && (
        <BlogSEO
          title={`${extractTextFromHTML(post.title.rendered)} - Potential.com`}
          description={seoDescription}
          image={post.featured_image_url}
          publishedTime={post.date}
          author="Potential.com"
          tags={postTags}
          slug={slug}
        />
      )}

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 mt-14">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">
              {isRTL ? (
                <>
                  <ChevronRight className="mr-1 h-4 w-4" />{" "}
                  {language === "en" ? "Back to Blog" : "العودة إلى المدونة"}
                </>
              ) : (
                <>
                  <ChevronLeft className="mr-1 h-4 w-4" />{" "}
                  {language === "en" ? "Back to Blog" : "العودة إلى المدونة"}
                </>
              )}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="space-y-4">
                  {Array(12)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-8">
                {language === "en"
                  ? "Failed to load blog post. Please try again later."
                  : "فشل تحميل المقال. يرجى المحاولة مرة أخرى لاحقًا."}
              </div>
            ) : post ? (
              <>
                <h1
                  className="text-4xl font-bold mb-4"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                <div className="text-muted-foreground mb-6">
                  {format(new Date(post.date), "MMMM dd, yyyy")}
                </div>
                {post.featured_image_url && (
                  <div className="mb-8">
                    <img
                      src={post.featured_image_url}
                      alt={post.title.rendered}
                      className="w-full rounded-lg object-cover max-h-[500px]"
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              </>
            ) : null}
          </article>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <CategoryList />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BlogPost() {
  return (
    <BlogProvider>
      <BlogPostContent />
    </BlogProvider>
  );
}
