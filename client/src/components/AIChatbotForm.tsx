"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MessageCircle, ExternalLink, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    email: z.string().email("Please enter a valid email address"),
    hasWebsite: z.boolean().default(true),
    website: z.string().optional(),
    proposedAgentName: z.string().min(1, "Agent name is required"),
  })
  .refine(
    (data) => {
      if (data.hasWebsite && (!data.website || data.website.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Website URL is required when you have a website",
      path: ["website"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface AgentData {
  id: string;
  [key: string]: any;
}

interface AIChatbotFormProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function AIChatbotForm({ trigger, className }: AIChatbotFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [agentData, setAgentData] = React.useState<AgentData | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      email: "",
      hasWebsite: true,
      website: "",
      proposedAgentName: "",
    },
  });

  const hasWebsite = form.watch("hasWebsite");

  const handleRemoveWebsite = () => {
    form.setValue("hasWebsite", false);
    form.setValue("website", "");
  };

  const handleAddWebsite = () => {
    form.setValue("hasWebsite", true);
  };

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("username", values.firstName);
      formData.append("email", values.email);
      formData.append("name", values.proposedAgentName);
      const utmMedium = new URLSearchParams(window.location.search).get(
        "utm_medium"
      );
      if (utmMedium) {
        formData.append("medium", utmMedium);
      }
      formData.append("source", window.location.href);
      // Send website URL or placeholder if no website
      const websiteUrl =
        values.hasWebsite && values.website
          ? values.website
          : "https://placeholder-no-website.com";
      formData.append("url", websiteUrl);

      const response = await fetch(
        "http://localhost:8000/api/bot/createsimplechatbot",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAgentData(data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error creating AI chatbot:", error);
      setError(
        "Sorry, we couldn't create your chatbot right now. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    form.reset({
      firstName: "",
      email: "",
      hasWebsite: true,
      website: "",
      proposedAgentName: "",
    });
    setAgentData(null);
    setIsSuccess(false);
    setError(null);
    setIsOpen(false);
  };

  const handleTestAgent = () => {
    if (agentData?.assistantData?.id) {
      window.open(
        `https://ai.potential.com/chatbots/${agentData.assistantData.id}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className={className}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Create Free AI Chatbot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {isSuccess
              ? "Your AI Chatbot is Ready!"
              : "Create Your Free AI Chatbot"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Your AI chatbot has been successfully created. You can now test it!"
              : "Fill out the form below to create your personalized AI chatbot in seconds."}
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasWebsite ? (
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        Website URL
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveWebsite}
                          className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3 mr-1" />I don't have a website
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://your-website.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Website</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddWebsite}
                      className="h-auto p-1 text-xs text-primary hover:text-primary"
                    >
                      + Add website
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No website required
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="proposedAgentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Chatbot Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a name for your AI chatbot"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Chatbot"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-green-800 dark:text-green-200">
                <h3 className="font-semibold">Chatbot Created Successfully!</h3>
                <p className="text-sm mt-1">
                  Chatbot Name:{" "}
                  {agentData?.assistantData?.name ||
                    form.getValues("proposedAgentName")}
                </p>
              </div>
            </div>

            <Button
              onClick={handleTestAgent}
              disabled={!agentData?.assistantData?.id}
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Test Your Chatbot Now
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
