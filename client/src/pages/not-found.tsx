import { Link } from "wouter";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO
        title="Page Not Found - Potential.com"
        description="The page you're looking for doesn't exist."
        noIndex={true}
      />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <a className="text-primary hover:underline">Go back home</a>
        </Link>
      </div>
    </div>
  );
}
