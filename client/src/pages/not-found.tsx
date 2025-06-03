import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="font-inter min-h-screen">
      <SEO
        title="Page Not Found - Potential.com"
        description="The page you're looking for doesn't exist."
        noIndex={true}
      />
      <Header />
      <main className="min-h-screen flex items-center justify-center pt-24 pb-12">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Page Not Found
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                The page you're looking for doesn't exist or has been moved to a
                different location.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button className="flex items-center gap-2" size="lg">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
