import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CodeBlockTabsProps {
  lessEffective: string;
  recommended: string;
}

export const CodeBlockTabs: React.FC<CodeBlockTabsProps> = ({
  lessEffective,
  recommended,
}) => {
  const [activeTab, setActiveTab] = useState<"less" | "recommended">("less");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const currentCode = activeTab === "less" ? lessEffective : recommended;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
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
      {/* Tabs */}
      <div className="flex items-center justify-between bg-muted border-b border-border min-w-0">
        <div className="flex flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("less")}
            className={cn(
              "px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
              activeTab === "less"
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            Less effective approach
          </button>
          <button
            onClick={() => setActiveTab("recommended")}
            className={cn(
              "px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
              activeTab === "recommended"
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            Recommended approach
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 sm:h-7 sm:w-7 mr-1 sm:mr-2 text-muted-foreground hover:text-foreground hover:bg-transparent flex-shrink-0",
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

      {/* Code Content */}
      <div className="relative group">
        <div className="overflow-auto bg-muted/30 dark:bg-card/50 code-block-scrollbar max-h-96">
          <pre className="flex text-xs sm:text-sm text-foreground p-2 sm:p-3 lg:p-4">
            <code className="font-mono flex">
              <span className="select-none text-muted-foreground mr-3 sm:mr-4 lg:mr-6 text-right">
                {currentCode.split('\n').map((_, i) => (
                  <span key={i} className="block">
                    {i + 1}
                  </span>
                ))}
              </span>
              <span className="flex-1">
                {currentCode.split('\n').map((line, i) => (
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

