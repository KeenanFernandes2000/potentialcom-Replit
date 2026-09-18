const SITE_URL = "https://potential.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export interface PageSeo {
  title: string;
  description: string;
  robots?: string;
  image?: string;
}

const DEFAULT_SEO: PageSeo = {
  title: "AI-powered Learning & Engagement Platform | Potential",
  description:
    "Build workforce capability, deliver empowerment programmes and enable customers and partners with Potential’s learning and engagement platform.",
  image: DEFAULT_IMAGE,
};

const PAGE_SEO: Record<string, PageSeo> = {
  "/": DEFAULT_SEO,
  "/platform": {
    title: "Learning & Engagement Platform | Potential",
    description:
      "Connect learning, certification, coaching, communities and innovation with programme administration and outcome evidence.",
  },
  "/solutions": {
    title: "Solutions | AI-powered Learning & Engagement Platform | Potential",
    description:
      "Design and deliver workforce capability, national and community empowerment, and customer and partner enablement programmes with Potential.",
  },
  "/solutions/workforce-capability": {
    title: "Workforce Capability | Potential",
    description:
      "Develop workforce capability through learning, practice and certification, with evidence of readiness and application.",
  },
  "/solutions/national-community-empowerment": {
    title: "National & Community Empowerment | Potential",
    description:
      "Deliver entrepreneurship, financial capability and community programmes with connected learning, mentoring and progress reporting.",
  },
  "/solutions/customer-partner-enablement": {
    title: "Customer & Partner Enablement | Potential",
    description:
      "Help customers and partners adopt products and build proficiency through dedicated learning, onboarding and certification journeys.",
  },
  "/solutions/csr-community-impact": {
    title: "CSR & Community Impact | Potential",
    description:
      "Turn CSR and community priorities into structured participation, learning, action and evidence with Potential.com.",
  },
  "/solutions/entrepreneurship-sme-development": {
    title: "Entrepreneurship & SME Development | Potential",
    description:
      "Support entrepreneurs and SMEs through structured assessment, learning, mentoring, challenges and practical milestones.",
  },
  "/usecases": {
    title: "Learning & Engagement Use Cases | Potential",
    description:
      "Explore programme paths, platform capabilities and audience lenses built on Potential’s learning and engagement platform.",
  },
  "/case-studies": {
    title: "Case Studies | Potential",
    description:
      "Explore delivered initiatives and programme experience from Potential’s learning and engagement work.",
  },
  "/resources": {
    title: "Resources | Potential",
    description:
      "Practical guidance for designing workforce capability, certification, empowerment and engagement programmes with measurable outcomes.",
  },
  "/partner": {
    title: "Partner with Potential | Potential",
    description:
      "Partner with Potential to deliver learning and engagement programmes through mandate access, specialist expertise, implementation capability or referrals.",
  },
  "/about": {
    title: "About Potential | Potential",
    description:
      "Learn how Potential combines experience in empowerment programmes with a proven learning and engagement platform for government and enterprise initiatives.",
  },
  "/inquire": {
    title: "Discuss Your Initiative | Potential",
    description:
      "Discuss your initiative with Potential and book a consultation to explore the right learning and engagement platform approach for your organisation.",
  },
  "/ayla": {
    title: "Talk to Ayla | Potential",
    description:
      "Talk to Ayla, Potential’s AI advisor, to explore your initiative, audience and priorities during the discovery stage.",
  },
  "/blog": {
    title: "Insights and Programme Resources | Potential",
    description:
      "Explore practical insights on workforce capability, empowerment programmes, customer enablement and measurable engagement.",
  },
  "/year-of-family": {
    title: "Year of Family | Potential",
    description:
      "Explore a measurable, AI-powered digital initiative for family empowerment, participation and community impact at national scale.",
  },
  "/launch-programs": {
    title: "Launch National Programmes | Potential",
    description:
      "Launch workforce, entrepreneurship and community programmes with structured journeys, engagement and evidence.",
  },
  "/book": {
    title: "Book a Meeting | Potential",
    description:
      "Schedule a consultation with Potential to explore the right learning and engagement programme for your organisation.",
  },
  "/terms": {
    title: "Terms of Use | Potential",
    description: "Read the terms governing use of Potential.com services.",
  },
  "/privacy": {
    title: "Privacy Policy | Potential",
    description:
      "Learn how Potential protects personal information and handles privacy across its services.",
  },
  "/login": {
    title: "Login | Potential",
    description: "Access your Potential.com account.",
    robots: "noindex,follow",
  },
  "/register": {
    title: "Create an Account | Potential",
    description: "Create your Potential.com account.",
    robots: "noindex,follow",
  },
  "/profile": {
    title: "Profile | Potential",
    description: "Manage your Potential.com profile.",
    robots: "noindex,nofollow",
  },
  "/forgot-password": {
    title: "Reset Your Password | Potential",
    description: "Recover access to your Potential.com account.",
    robots: "noindex,nofollow",
  },
};

const EXACT_PUBLIC_ROUTES = new Set([
  "/",
  "/platform",
  "/solutions",
  "/solutions/workforce-capability",
  "/solutions/national-community-empowerment",
  "/solutions/customer-partner-enablement",
  "/solutions/csr-community-impact",
  "/solutions/entrepreneurship-sme-development",
  "/resources",
  "/partner",
  "/about",
  "/ayla",
  "/inquire",
  "/usecases",
  "/year-of-family",
  "/launch-programs",
  "/book",
  "/case-studies",
  "/login",
  "/register",
  "/profile",
  "/forgot-password",
  "/terms",
  "/privacy",
  "/blog",
]);

export function getPathname(url: string): string {
  return new URL(url, "http://potential.local").pathname;
}

export function isKnownPublicRoute(pathname: string): boolean {
  if (EXACT_PUBLIC_ROUTES.has(pathname)) return true;
  return /^\/blog\/category\/[^/]+$/.test(pathname) || /^\/articles\/[^/]+$/.test(pathname);
}

export function getSeoMetadata(pathname: string): PageSeo & { canonical: string } {
  const page = PAGE_SEO[pathname] || (pathname.startsWith("/articles/")
    ? {
        title: "Article | Potential",
        description:
          "Insights on workforce capability, empowerment programmes and learning and engagement.",
      }
    : pathname.startsWith("/blog/category/")
      ? {
          title: "Programme Insights | Potential",
          description:
            "Explore Potential insights on learning, engagement and empowerment programmes.",
        }
      : DEFAULT_SEO);

  return {
    ...DEFAULT_SEO,
    ...page,
    canonical: `${SITE_URL}${pathname === "/" ? "/" : pathname}`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function injectSeoIntoHtml(html: string, pathname: string, is404 = false): string {
  const metadata = getSeoMetadata(pathname);
  const robots = is404 ? "noindex,nofollow" : metadata.robots;
  const headTags = [
    `<title>${escapeHtml(is404 ? "Page Not Found | Potential" : metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
    robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : "",
    `<link rel="canonical" href="${escapeHtml(metadata.canonical)}">`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}">`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escapeHtml(metadata.canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(metadata.image || DEFAULT_IMAGE)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.image || DEFAULT_IMAGE)}">`,
  ]
    .filter(Boolean)
    .join("\n    ");

  const cleanedHtml = html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, "")
    .replace(
      /<meta\s+(?:name|property)=["'](?:description|robots|og:title|og:description|og:type|og:url|og:image|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*>\s*/gi,
      "",
    )
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");

  return cleanedHtml.replace("</head>", `    ${headTags}\n  </head>`);
}