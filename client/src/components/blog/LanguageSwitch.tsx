import { Button } from "@/components/ui/button";
import { useBlogContext } from "@/lib/blog-context";
import { useLocation, useRoute } from "wouter";
import { containsArabic, formatUrlWithLanguage } from "@/lib/language-utils";

export function LanguageSwitch() {
  const { language, setLanguage } = useBlogContext();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/articles/:slug");

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);

    // If we're on an article page, update the URL appropriately
    if (match && params?.slug) {
      const slug = params.slug;
      const baseUrl = `/articles/${slug}`;

      // Only add language parameter for Arabic slugs
      if (containsArabic(slug) && newLanguage === "ar") {
        setLocation(`${baseUrl}/?lang=ar`);
        console.log(
          `[LANGUAGE-SWITCH] Added lang=ar parameter for Arabic slug: ${slug}`
        );
      } else {
        setLocation(baseUrl);
      }
    }
  };

  return (
    <Button
      variant="outline"
      onClick={toggleLanguage}
      className="rounded-full px-4"
    >
      {language === "en" ? "العربية" : "English"}
    </Button>
  );
}
