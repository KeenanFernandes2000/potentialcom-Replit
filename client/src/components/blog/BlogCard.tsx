import { format } from "date-fns";
import { Link } from "wouter";
import { useBlogContext } from "@/lib/blog-context";
import { WordPressPost } from "@/lib/blog-api";
import { formatUrlWithLanguage } from "@/lib/language-utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  post: WordPressPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const { isRTL } = useBlogContext();

  // Base URL for the post
  const baseUrl = `/articles/${post.slug}`;

  // Format URL with language parameter only if needed (for Arabic slugs)
  const postUrl = formatUrlWithLanguage(baseUrl, post.slug);

  return (
    <Card
      className={`overflow-hidden h-full flex flex-col ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {post.featured_image_url && (
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title.rendered}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <h3
          className="text-xl font-bold hover:text-primary transition-colors"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div className="text-sm text-muted-foreground">
          {format(new Date(post.date), "MMMM dd, yyyy")}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div
          className="line-clamp-3 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={postUrl}>{isRTL ? "اقرأ المزيد" : "Read More"}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
