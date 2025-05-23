import { z } from "zod";
import { containsArabic, detectLanguage } from "./language-utils";

// WordPress API response schemas
export const WordPressImageSchema = z.object({
  id: z.number(),
  source_url: z.string().url(),
  alt_text: z.string().optional(),
});

export const WordPressPostSchema = z.object({
  id: z.number(),
  date: z.string(),
  slug: z.string(),
  status: z.string(),
  type: z.string(),
  link: z.string().url(),
  title: z.object({
    rendered: z.string(),
  }),
  content: z.object({
    rendered: z.string(),
    protected: z.boolean().optional(),
  }),
  excerpt: z.object({
    rendered: z.string(),
    protected: z.boolean().optional(),
  }),
  featured_media: z.number().optional(),
  categories: z.array(z.number()).optional(),
  featured_image_url: z.string().url().optional(),
  _embedded: z
    .object({
      "wp:featuredmedia": z
        .array(
          z.object({
            source_url: z.string().url(),
            alt_text: z.string().optional(),
          })
        )
        .optional(),
      "wp:term": z
        .array(
          z.array(
            z.object({ id: z.number(), name: z.string(), slug: z.string() })
          )
        )
        .optional(),
    })
    .optional(),
});

export type WordPressPost = z.infer<typeof WordPressPostSchema>;

export const WordPressCategorySchema = z.object({
  id: z.number(),
  count: z.number(),
  description: z.string(),
  link: z.string().url(),
  name: z.string(),
  slug: z.string(),
  taxonomy: z.string(),
  parent: z.number(),
});

export type WordPressCategory = z.infer<typeof WordPressCategorySchema>;

// API fetching functions with proper language handling
const API_BASE_URL = "/api/wp";

/**
 * Fetch blog posts with language support
 */
export async function fetchPosts(
  lang: "en" | "ar" = "en",
  page: number = 1,
  perPage: number = 10,
  categoryId?: number
): Promise<{ posts: WordPressPost[]; totalPages: number }> {
  // Build query parameters
  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
  });

  // Add language parameter for Arabic
  if (lang === "ar") {
    params.append("lang", "ar");
  }

  // Add category filter if provided
  if (categoryId) {
    params.append("categories", categoryId.toString());
  }

  const url = `${API_BASE_URL}/posts?${params.toString()}`;
  console.log(`Fetching posts: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  const totalPages = parseInt(
    response.headers.get("X-WP-TotalPages") || "1",
    10
  );

  const postsData = await response.json();

  const posts = Array.isArray(postsData)
    ? postsData.map((post: any) => {
        // Extract featured image if available
        let featuredImageUrl = undefined;
        if (
          post._embedded &&
          post._embedded["wp:featuredmedia"] &&
          post._embedded["wp:featuredmedia"][0]
        ) {
          featuredImageUrl = post._embedded["wp:featuredmedia"][0].source_url;
        }

        return {
          ...post,
          featured_image_url: featuredImageUrl,
        };
      })
    : [];

  return {
    posts: z.array(WordPressPostSchema).parse(posts),
    totalPages,
  };
}

/**
 * Fetch a single blog post by slug with automatic language detection
 */
export async function fetchPost(
  slug: string,
  lang: "en" | "ar" = "en"
): Promise<WordPressPost> {
  // Check if the slug contains Arabic characters
  const slugLanguage = detectLanguage(slug);

  // For Arabic slugs, always use Arabic language parameter
  const effectiveLanguage = slugLanguage === "ar" ? "ar" : lang;

  // Encode the slug for URL safety
  const encodedSlug = encodeURIComponent(slug);

  // Build the query parameters
  const params = new URLSearchParams();

  // Set language parameter - ALWAYS use 'ar' for Arabic slugs
  if (effectiveLanguage === "ar" || slugLanguage === "ar") {
    params.set("lang", "ar");
    console.log(`[CLIENT-API] Using Arabic language for slug: ${slug}`);
  } else {
    params.set("lang", lang);
  }

  // Add _embed parameter to get featured images
  params.set("_embed", "true");

  // Build the URL with query parameters
  const url = `${API_BASE_URL}/posts/${encodedSlug}?${params.toString()}`;

  console.log(
    `[CLIENT-API] Fetching post: ${url}, slug language: ${slugLanguage}, effective language: ${effectiveLanguage}`
  );

  const response = await fetch(url);

  if (!response.ok) {
    console.error(
      `[CLIENT-API] Error fetching post: ${response.status} ${response.statusText}`
    );
    throw new Error(`Failed to fetch post: ${response.statusText}`);
  }

  const post = await response.json();
  console.log(
    `[CLIENT-API] Received post data, title: ${
      post.title?.rendered || "Unknown"
    }`
  );

  // Extract featured image if available
  let featuredImageUrl = undefined;
  if (
    post._embedded &&
    post._embedded["wp:featuredmedia"] &&
    post._embedded["wp:featuredmedia"][0]
  ) {
    featuredImageUrl = post._embedded["wp:featuredmedia"][0].source_url;
  }

  return WordPressPostSchema.parse({
    ...post,
    featured_image_url: featuredImageUrl,
  });
}

/**
 * Fetch blog categories with language support
 */
export async function fetchCategories(
  lang: "en" | "ar" = "en"
): Promise<WordPressCategory[]> {
  // Build query parameters
  const params = new URLSearchParams();

  // Add language parameter for Arabic
  if (lang === "ar") {
    params.append("lang", "ar");
  }

  const url = `${API_BASE_URL}/categories${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  console.log(`Fetching categories: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const categoriesData = await response.json();

  return z.array(WordPressCategorySchema).parse(categoriesData);
}
