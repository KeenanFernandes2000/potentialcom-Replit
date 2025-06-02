import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/blog-api";
import { useBlogContext } from "@/lib/blog-context";
import { BlogProvider } from "@/lib/blog-context";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/blog/Pagination";
import { LanguageSwitch } from "@/components/blog/LanguageSwitch";
import { CategoryList } from "@/components/blog/CategoryList";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function BlogContent() {
  const { language, isRTL } = useBlogContext();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", language, currentPage, postsPerPage],
    queryFn: () => fetchPosts(language, currentPage, postsPerPage),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? "rtl" : "ltr"}`}>
      <SEO />
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 mt-14">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === "en" ? "Blog" : "المدونة"}
            </h1>
            <p className="text-muted-foreground">
              {language === "en"
                ? "Explore the latest articles and insights"
                : "استكشف أحدث المقالات والرؤى"}
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <LanguageSwitch />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {isLoading ? (
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

export default function Blog() {
  return (
    <BlogProvider>
      <BlogContent />
    </BlogProvider>
  );
}
