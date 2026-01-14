import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  title,
  language = "mdx",
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="my-4 sm:my-5 lg:my-6 rounded-lg border border-border bg-card overflow-hidden not-prose">
      {title && (
        <div className="flex items-center justify-between px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-muted border-b border-border">
          <span className="text-xs sm:text-sm font-medium text-foreground">{title}</span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-foreground hover:bg-transparent",
              copied && "bg-success/20 text-success hover:bg-success/20"
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
      )}
      <div className="relative group">
        {!title && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-foreground hover:bg-transparent z-10",
              copied && "bg-success/20 text-success hover:bg-success/20"
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        )}
        <div className="overflow-auto bg-muted/30 dark:bg-card/50 code-block-scrollbar max-h-96">
          <pre className="flex text-xs sm:text-sm text-foreground p-2 sm:p-3 lg:p-4">
            <code className="font-mono flex">
              <span className="select-none text-muted-foreground mr-3 sm:mr-4 lg:mr-6 text-right">
                {code.split('\n').map((_, i) => (
                  <span key={i} className="block">
                    {i + 1}
                  </span>
                ))}
              </span>
              <span className="flex-1">
                {code.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line || '\u00A0'}
                  </span>
                ))}
              </span>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

