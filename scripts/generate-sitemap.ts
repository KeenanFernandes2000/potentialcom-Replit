import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WordPress API configuration
const WORDPRESS_API_URL = "https://blog.potential.com/wp-json/wp/v2";
const SITE_URL = "https://potential.com";

// Route priority and change frequency defaults based on route patterns
const ROUTE_DEFAULTS = {
  "/": { priority: "1.0", changefreq: "weekly" },
  auth: { priority: "0.3", changefreq: "yearly" }, // login, register, etc.
  legal: { priority: "0.4", changefreq: "yearly" }, // terms, privacy, etc.
  blog: { priority: "0.7", changefreq: "daily" },
  high: { priority: "0.9", changefreq: "monthly" }, // about and other core pages
  medium: { priority: "0.8", changefreq: "weekly" }, // offerings, resources, etc.
  default: { priority: "0.5", changefreq: "monthly" },
};

interface StaticRoute {
  url: string;
  priority: string;
  changefreq: string;
}

/**
 * Determine route priority and change frequency based on route path
 */
function getRouteConfig(routePath: string): {
  priority: string;
  changefreq: string;
} {
  // Homepage
  if (routePath === "/") {
    return ROUTE_DEFAULTS["/"];
  }

  // Authentication pages
  if (
    ["login", "register", "forgot-password", "profile"].some((auth) =>
      routePath.includes(auth)
    )
  ) {
    return ROUTE_DEFAULTS.auth;
  }

  // Legal pages
  if (
    ["terms", "privacy", "policy"].some((legal) => routePath.includes(legal))
  ) {
    return ROUTE_DEFAULTS.legal;
  }

  // Blog pages
  if (routePath.includes("blog")) {
    return ROUTE_DEFAULTS.blog;
  }

  // High priority pages
  if (["about"].some((high) => routePath.includes(high))) {
    return ROUTE_DEFAULTS.high;
  }

  // Medium priority pages
  if (
    ["offerings", "solutions", "resources", "partner", "vera"].some((medium) =>
      routePath.includes(medium)
    )
  ) {
    return ROUTE_DEFAULTS.medium;
  }

  // Default
  return ROUTE_DEFAULTS.default;
}

/**
 * Extract homepage sections with anchors from Home.tsx and section components
 */
async function extractHomepageSections(): Promise<StaticRoute[]> {
  const sectionsDir = path.resolve(
    __dirname,
    "../client/src/components/sections"
  );
  const homeTsxPath = path.resolve(__dirname, "../client/src/pages/Home.tsx");

  const sections: StaticRoute[] = [];
  const foundIds = new Set<string>();

  // First, scan the sections directory for components with id attributes
  if (fs.existsSync(sectionsDir)) {
    try {
      const sectionFiles = fs
        .readdirSync(sectionsDir)
        .filter((file) => /\.(tsx?|jsx?)$/.test(file));

      for (const file of sectionFiles) {
        const filePath = path.join(sectionsDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        // Look for id attributes in section components
        const idRegex = /id=["']([^"']+)["']/g;
        let match;

        while ((match = idRegex.exec(content)) !== null) {
          const id = match[1];
          // Skip common IDs that aren't likely to be navigation anchors
          if (
            !["root", "app", "main", "header", "footer", "nav"].includes(
              id.toLowerCase()
            )
          ) {
            foundIds.add(id);
          }
        }
      }

      console.log(`📁 Scanned ${sectionFiles.length} section components`);
    } catch (error) {
      console.warn("⚠️  Error scanning sections directory:", error);
    }
  }

  // Also scan Home.tsx for any additional id attributes
  if (fs.existsSync(homeTsxPath)) {
    try {
      const homeContent = fs.readFileSync(homeTsxPath, "utf8");

      // Look for id attributes in Home.tsx
      const idRegex = /id=["']([^"']+)["']/g;
      let match;

      while ((match = idRegex.exec(homeContent)) !== null) {
        const id = match[1];
        if (
          !["root", "app", "main", "header", "footer", "nav"].includes(
            id.toLowerCase()
          )
        ) {
          foundIds.add(id);
        }
      }

      // Also look for scrollToSection calls which indicate valid anchor sections
      const scrollRegex = /scrollToSection\(["']([^"']+)["']\)/g;
      while ((match = scrollRegex.exec(homeContent)) !== null) {
        foundIds.add(match[1]);
      }
    } catch (error) {
      console.warn("⚠️  Error scanning Home.tsx:", error);
    }
  }

  // Convert IDs to anchor routes
  foundIds.forEach((id) => {
    sections.push({
      url: `/#${id}`,
      priority: "0.7",
      changefreq: "monthly",
    });
  });

  console.log(
    `🏠 Found ${sections.length} homepage sections:`,
    sections.map((s) => s.url).join(", ")
  );

  return sections;
}

/**
 * Scan pages directory to discover all available page components
 */
function scanPagesDirectory(): string[] {
  const pagesDir = path.resolve(__dirname, "../client/src/pages");

  if (!fs.existsSync(pagesDir)) {
    console.warn("⚠️  Pages directory not found");
    return [];
  }

  try {
    const pageFiles = fs
      .readdirSync(pagesDir)
      .filter((file) => /\.(tsx?|jsx?)$/.test(file))
      .map((file) => file.replace(/\.(tsx?|jsx?)$/, ""));

    console.log(
      `📁 Found ${pageFiles.length} page components:`,
      pageFiles.join(", ")
    );
    return pageFiles;
  } catch (error) {
    console.error("❌ Error scanning pages directory:", error);
    return [];
  }
}

/**
 * Validate that discovered routes have corresponding page components
 */
function validateRoutes(routes: StaticRoute[]): StaticRoute[] {
  const pagesDir = path.resolve(__dirname, "../client/src/pages");

  if (!fs.existsSync(pagesDir)) {
    console.warn("⚠️  Pages directory not found, skipping validation");
    return routes;
  }

  try {
    // Read the App.tsx to get component mappings
    const appTsxPath = path.resolve(__dirname, "../client/src/App.tsx");
    const appContent = fs.readFileSync(appTsxPath, "utf8");

    // Extract import mappings (e.g., import Home from "@/pages/Home")
    const importRegex = /import\s+(\w+)\s+from\s+["']@\/pages\/(\w+)["']/g;
    const componentToFile = new Map<string, string>();
    let match;

    while ((match = importRegex.exec(appContent)) !== null) {
      componentToFile.set(match[1], match[2]);
    }

    // Extract route to component mappings
    const routeToComponent = new Map<string, string>();
    const routeComponentRegex =
      /<Route\s+path="([^"]*)"\s+component=\{(\w+)\}/g;

    while ((match = routeComponentRegex.exec(appContent)) !== null) {
      routeToComponent.set(match[1], match[2]);
    }

    const validatedRoutes: StaticRoute[] = [];
    const pageFiles = fs.readdirSync(pagesDir);

    for (const route of routes) {
      const componentName = routeToComponent.get(route.url);
      if (componentName) {
        const fileName = componentToFile.get(componentName);
        if (fileName) {
          // Check if the page file exists
          const possibleFiles = [
            `${fileName}.tsx`,
            `${fileName}.ts`,
            `${fileName}.jsx`,
            `${fileName}.js`,
          ];

          const fileExists = possibleFiles.some((file) =>
            pageFiles.includes(file)
          );

          if (fileExists) {
            validatedRoutes.push(route);
          } else {
            console.warn(
              `⚠️  Route ${route.url} -> component ${componentName} -> file ${fileName} not found`
            );
          }
        } else {
          console.warn(
            `⚠️  Route ${route.url} -> component ${componentName} not found in imports`
          );
        }
      } else {
        // If we can't find the component mapping, include the route anyway
        // This handles cases where the regex might miss some patterns
        validatedRoutes.push(route);
      }
    }

    console.log(
      `✅ Validated ${validatedRoutes.length}/${routes.length} routes`
    );
    return validatedRoutes;
  } catch (error) {
    console.warn("⚠️  Error during route validation:", error);
    return routes; // Return original routes if validation fails
  }
}

/**
 * Dynamically extract static routes from the App.tsx router configuration
 */
async function extractStaticRoutes(): Promise<StaticRoute[]> {
  const appTsxPath = path.resolve(__dirname, "../client/src/App.tsx");

  if (!fs.existsSync(appTsxPath)) {
    console.warn(
      "⚠️  App.tsx not found, attempting to generate routes from pages directory"
    );
    return generateRoutesFromPages();
  }

  try {
    const appContent = fs.readFileSync(appTsxPath, "utf8");
    const routes: StaticRoute[] = [];

    // More comprehensive regex patterns to match different Route syntax variations
    const routePatterns = [
      // <Route path="/path" component={Component} />
      /<Route\s+path="([^":]*)"\s+component=\{[^}]+\}\s*\/>/g,
      // <Route path="/path" component={Component}></Route>
      /<Route\s+path="([^":]*)"\s+component=\{[^}]+\}[^>]*>[^<]*<\/Route>/g,
      // <Route component={Component} path="/path" />
      /<Route\s+component=\{[^}]+\}\s+path="([^":]*)"\s*\/>/g,
    ];

    const foundPaths = new Set<string>();

    for (const pattern of routePatterns) {
      let match;
      while ((match = pattern.exec(appContent)) !== null) {
        const routePath = match[1];

        // Skip empty paths, dynamic routes (containing :), wildcard routes, and fallback routes
        if (
          !routePath ||
          routePath.includes(":") ||
          routePath.includes("*") ||
          routePath === "" ||
          routePath === "/pricing" ||
          routePath === "/ai-agents"
        ) {
          continue;
        }

        foundPaths.add(routePath);
      }
    }

    // Convert paths to route objects with configuration
    foundPaths.forEach((routePath) => {
      const config = getRouteConfig(routePath);
      routes.push({
        url: routePath,
        priority: config.priority,
        changefreq: config.changefreq,
      });
    });

    console.log(
      `📄 Discovered ${routes.length} static routes from App.tsx:`,
      routes.map((r) => r.url).join(", ")
    );

    // If no routes found, generate from pages directory
    if (routes.length === 0) {
      console.warn(
        "⚠️  No routes found in App.tsx, generating from pages directory"
      );
      return generateRoutesFromPages();
    }

    // Validate routes against actual page files
    const validatedRoutes = validateRoutes(routes);

    return validatedRoutes;
  } catch (error) {
    console.error("❌ Error parsing App.tsx:", error);
    console.warn("⚠️  Generating routes from pages directory");
    return generateRoutesFromPages();
  }
}

/**
 * Generate routes based on the pages directory structure (fallback method)
 */
function generateRoutesFromPages(): StaticRoute[] {
  const pageComponents = scanPagesDirectory();
  const routes: StaticRoute[] = [];

  for (const component of pageComponents) {
    let routePath: string;

    // Convert component names to route paths
    switch (component.toLowerCase()) {
      case "home":
        routePath = "/";
        break;
      case "not-found":
      case "notfound":
        continue; // Skip 404 pages
      case "termsofuse":
        routePath = "/terms";
        break;
      case "privacypolicy":
        routePath = "/privacy";
        break;
      case "forgotpassword":
        routePath = "/forgot-password";
        break;
      case "blogpost":
        continue; // Skip dynamic blog post pages
      case "blogcategory":
        continue; // Skip dynamic blog category pages
      default:
        routePath = `/${component.toLowerCase()}`;
    }

    const config = getRouteConfig(routePath);
    routes.push({
      url: routePath,
      priority: config.priority,
      changefreq: config.changefreq,
    });
  }

  console.log(
    `📁 Generated ${routes.length} routes from pages directory:`,
    routes.map((r) => r.url).join(", ")
  );

  return routes;
}

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
    const staticRoutes = await extractStaticRoutes();
    allPages.push(...staticRoutes);

    // Add homepage sections
    console.log("🏠 Adding homepage sections...");
    const homepageSections = await extractHomepageSections();
    allPages.push(...homepageSections);

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
      `   - Static pages: ${staticRoutes.length + homepageSections.length}`
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
