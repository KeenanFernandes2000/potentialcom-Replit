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
import { format } from "date-fns";
import React from "react";
import { detectLanguage } from "@/lib/language-utils";

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

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? "rtl" : "ltr"}`}>
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
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

          <div className="ml-auto">
            <LanguageSwitch />
          </div>
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
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
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
