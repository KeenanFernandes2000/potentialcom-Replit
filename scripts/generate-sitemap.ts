import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WordPress API configuration
const WORDPRESS_API_URL = "https://blog.potential.com/wp-json/wp/v2";
const SITE_URL = "https://potential.com";

// Static pages configuration
const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/about", priority: "0.9", changefreq: "monthly" },
  { url: "/solutions", priority: "0.9", changefreq: "weekly" },
  { url: "/offerings", priority: "0.8", changefreq: "weekly" },
  { url: "/pricing", priority: "0.9", changefreq: "monthly" },
  { url: "/resources", priority: "0.8", changefreq: "weekly" },
  { url: "/partner", priority: "0.8", changefreq: "monthly" },
  { url: "/vera", priority: "0.9", changefreq: "monthly" },
  { url: "/login", priority: "0.5", changefreq: "yearly" },
  { url: "/register", priority: "0.5", changefreq: "yearly" },
  { url: "/forgot-password", priority: "0.3", changefreq: "yearly" },
  { url: "/profile", priority: "0.3", changefreq: "yearly" },
  { url: "/terms", priority: "0.4", changefreq: "yearly" },
  { url: "/privacy", priority: "0.4", changefreq: "yearly" },
  { url: "/blog", priority: "0.7", changefreq: "daily" },
];

// Homepage sections with anchors
const HOMEPAGE_SECTIONS = [
  { url: "/#agents", priority: "0.8", changefreq: "weekly" },
  { url: "/#vera", priority: "0.7", changefreq: "monthly" },
  { url: "/#rachel", priority: "0.7", changefreq: "monthly" },
  { url: "/#start", priority: "0.7", changefreq: "monthly" },
];

interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  modified: string;
  title: { rendered: string };
}

interface WordPressCategory {
  id: number;
  slug: string;
  name: string;
  count: number;
}

async function fetchWordPressData(
  endpoint: string,
  lang: "en" | "ar" = "en"
): Promise<any> {
  const allData: any[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const url = new URL(`${WORDPRESS_API_URL}${endpoint}`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", currentPage.toString());
    if (lang === "ar") {
      url.searchParams.set("lang", "ar");
    }

    console.log(`   Fetching page ${currentPage}: ${url.toString()}`);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get pagination info from headers
      const totalPagesHeader = response.headers.get("X-WP-TotalPages");
      if (totalPagesHeader) {
        totalPages = parseInt(totalPagesHeader, 10);
      }

      const data = await response.json();
      const itemsReceived = Array.isArray(data) ? data.length : 1;
      console.log(
        `   ✓ Page ${currentPage}/${totalPages}: Received ${itemsReceived} items`
      );

      if (Array.isArray(data)) {
        allData.push(...data);
      } else {
        allData.push(data);
      }

      currentPage++;
    } catch (error) {
      console.error(
        `   ✗ Failed to fetch ${endpoint} page ${currentPage}:`,
        error
      );
      throw error;
    }
  } while (currentPage <= totalPages);

  console.log(
    `   📊 Total items fetched: ${allData.length} across ${totalPages} pages`
  );
  return allData;
}

async function fetchAllPosts(): Promise<WordPressPost[]> {
  const allPosts: WordPressPost[] = [];

  // Fetch English posts
  try {
    console.log("   Fetching English posts...");
    const englishPosts = await fetchWordPressData("/posts", "en");
    allPosts.push(...englishPosts);
  } catch (error) {
    console.warn("   Could not fetch English posts:", error);
  }

  // Fetch Arabic posts
  try {
    console.log("   Fetching Arabic posts...");
    const arabicPosts = await fetchWordPressData("/posts", "ar");
    allPosts.push(...arabicPosts);
  } catch (error) {
    console.warn("   Could not fetch Arabic posts:", error);
  }

  return allPosts;
}

async function fetchAllCategories(): Promise<WordPressCategory[]> {
  const allCategories: WordPressCategory[] = [];

  // Fetch English categories
  try {
    console.log("   Fetching English categories...");
    const englishCategories = await fetchWordPressData("/categories", "en");
    allCategories.push(...englishCategories);
  } catch (error) {
    console.warn("   Could not fetch English categories:", error);
  }

  // Fetch Arabic categories
  try {
    console.log("   Fetching Arabic categories...");
    const arabicCategories = await fetchWordPressData("/categories", "ar");
    allCategories.push(...arabicCategories);
  } catch (error) {
    console.warn("   Could not fetch Arabic categories:", error);
  }

  return allCategories.filter((cat) => cat.count > 0); // Only include categories with posts
}

function generateSitemapXML(
  pages: Array<{
    url: string;
    lastmod?: string;
    priority: string;
    changefreq: string;
  }>
): string {
  const urlEntries = pages
    .map((page) => {
      const lastmodTag = page.lastmod
        ? `    <lastmod>${page.lastmod}</lastmod>`
        : "";
      return `  <url>
    <loc>${SITE_URL}${page.url}</loc>${lastmodTag}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urlEntries}

</urlset>`;
}

function formatDateForSitemap(dateString: string): string {
  return new Date(dateString).toISOString().split("T")[0];
}

async function generateSitemap(): Promise<void> {
  console.log("🚀 Starting sitemap generation...");

  try {
    const allPages: Array<{
      url: string;
      lastmod?: string;
      priority: string;
      changefreq: string;
    }> = [];

    // Add static pages
    console.log("📄 Adding static pages...");
    allPages.push(...STATIC_PAGES);

    // Add homepage sections
    console.log("🏠 Adding homepage sections...");
    allPages.push(...HOMEPAGE_SECTIONS);

    // Fetch and add blog posts
    console.log("📝 Fetching blog posts...");
    const posts = await fetchAllPosts();
    console.log(`   Found ${posts.length} blog posts total`);

    for (const post of posts) {
      allPages.push({
        url: `/articles/${post.slug}`,
        lastmod: formatDateForSitemap(post.modified || post.date),
        priority: "0.6",
        changefreq: "monthly",
      });
    }

    // Fetch and add blog categories
    console.log("📂 Fetching blog categories...");
    const categories = await fetchAllCategories();
    console.log(`   Found ${categories.length} blog categories total`);

    for (const category of categories) {
      allPages.push({
        url: `/blog/category/${category.slug}`,
        lastmod: formatDateForSitemap(new Date().toISOString()),
        priority: "0.5",
        changefreq: "weekly",
      });
    }

    // Generate sitemap XML
    console.log("⚡ Generating sitemap XML...");
    const sitemapXML = generateSitemapXML(allPages);

    // Write to client/public directory
    const publicDir = path.resolve(__dirname, "../client/public");
    const sitemapPath = path.join(publicDir, "sitemap.xml");

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(sitemapPath, sitemapXML, "utf8");

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${allPages.length}`);
    console.log(
      `   - Static pages: ${STATIC_PAGES.length + HOMEPAGE_SECTIONS.length}`
    );
    console.log(`   - Blog posts: ${posts.length}`);
    console.log(`   - Blog categories: ${categories.length}`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap()
  .then(() => {
    console.log("🎉 Sitemap generation completed!");
  })
  .catch((error) => {
    console.error("Failed to generate sitemap:", error);
    process.exit(1);
  });

export { generateSitemap };
