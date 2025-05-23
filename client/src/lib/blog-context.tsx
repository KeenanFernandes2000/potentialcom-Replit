import { createContext, useContext, useState, ReactNode } from "react";

type BlogLanguage = "en" | "ar";

interface BlogContextType {
  language: BlogLanguage;
  setLanguage: (lang: BlogLanguage) => void;
  isRTL: boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<BlogLanguage>("en");

  const value = {
    language,
    setLanguage,
    isRTL: language === "ar",
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlogContext() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlogContext must be used within a BlogProvider");
  }
  return context;
}
