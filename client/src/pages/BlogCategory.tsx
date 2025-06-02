import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { fetchPosts, fetchCategories } from "@/lib/blog-api";
import { useBlogContext } from "@/lib/blog-context";
import { BlogProvider } from "@/lib/blog-context";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/blog/Pagination";
import { LanguageSwitch } from "@/components/blog/LanguageSwitch";
import { CategoryList } from "@/components/blog/CategoryList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from "react";
import { detectLanguage } from "@/lib/language-utils";
import { AutoSEO } from "@/components/SEO";

function BlogCategoryContent() {
  const { language, isRTL, setLanguage } = useBlogContext();
  const [, params] = useRoute("/blog/category/:slug");
  const [location] = useLocation();
  const slug = params?.slug || "";

  // Parse URL parameters to detect language
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const urlLanguage = urlParams.get("lang") as "en" | "ar" | null;

  // Detect language from slug or URL parameter
  const slugLanguage = detectLanguage(slug);
  const effectiveLanguage = urlLanguage || slugLanguage;

  // Set language based on URL parameter or slug language
  React.useEffect(() => {
    if (effectiveLanguage === "ar" && language !== "ar") {
      console.log(
        `[BLOG-CATEGORY] Setting language to Arabic based on slug/URL: ${slug}, lang param: ${urlLanguage}`
      );
      setLanguage("ar");
    } else if (effectiveLanguage === "en" && language !== "en") {
      console.log(
        `[BLOG-CATEGORY] Setting language to English based on slug/URL: ${slug}, lang param: ${urlLanguage}`
      );
      setLanguage("en");
    }
  }, [
    slug,
    slugLanguage,
    urlLanguage,
    effectiveLanguage,
    language,
    setLanguage,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // Fetch categories to get the current category ID and name
  const { data: categories } = useQuery({
    queryKey: ["categories", effectiveLanguage],
    queryFn: () => fetchCategories(effectiveLanguage),
  });

  // Find the current category
  const currentCategory = categories?.find((cat) => cat.slug === slug);

  // Fetch posts for this category
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "category-posts",
      effectiveLanguage,
      slug,
      currentPage,
      postsPerPage,
    ],
    queryFn: () =>
      fetchPosts(
        effectiveLanguage,
        currentPage,
        postsPerPage,
        currentCategory?.id
      ),
    enabled: !!currentCategory?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? "rtl" : "ltr"}`}>
      <AutoSEO />
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

        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {currentCategory?.name ||
                (language === "en" ? "Category" : "التصنيف")}
            </h1>
            <p className="text-muted-foreground">
              {language === "en"
                ? `Articles in ${currentCategory?.name || "this category"}`
                : `مقالات في ${currentCategory?.name || "هذا التصنيف"}`}
            </p>
          </div>

          {/* <div className="mt-4 md:mt-0">
            <LanguageSwitch />
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {isLoading || !currentCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex flex-col">
                      <Skeleton className="w-full h-48 rounded-t-lg" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-8">
                {language === "en"
                  ? "Failed to load blog posts. Please try again later."
                  : "فشل تحميل المقالات. يرجى المحاولة مرة أخرى لاحقًا."}
              </div>
            ) : data?.posts.length === 0 ? (
              <div className="text-center p-8">
                {language === "en"
                  ? "No posts found in this category."
                  : "لا توجد مقالات في هذا التصنيف."}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {data && data.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>

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

export default function BlogCategory() {
  return (
    <BlogProvider>
      <BlogCategoryContent />
    </BlogProvider>
  );
}
