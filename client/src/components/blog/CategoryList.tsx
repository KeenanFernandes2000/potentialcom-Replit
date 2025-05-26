import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/blog-api";
import { useBlogContext } from "@/lib/blog-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { detectLanguage } from "@/lib/language-utils";

export function CategoryList() {
  const { language } = useBlogContext();

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", language],
    queryFn: () => fetchCategories(language),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold mb-3">
          {language === "en" ? "Categories" : "التصنيفات"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
        </div>
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="text-red-500">
        {language === "en"
          ? "Failed to load categories"
          : "فشل تحميل التصنيفات"}
      </div>
    );
  }

  // Filter out categories with zero posts
  const nonEmptyCategories = categories.filter(
    (category) => category.count > 0
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        {language === "en" ? "Categories" : "التصنيفات"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {nonEmptyCategories.map((category) => {
          // TODO: Re-enable category links when Arabic categories issue is fixed
          // const baseUrl = `/blog/category/${category.slug}`;
          // const categoryUrl =
          //   language === "ar" || detectLanguage(category.slug) === "ar"
          //     ? `${baseUrl}?lang=ar`
          //     : baseUrl;

          return (
            <Badge
              key={category.id}
              variant="outline"
              className="cursor-default"
            >
              {category.name} ({category.count})
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
