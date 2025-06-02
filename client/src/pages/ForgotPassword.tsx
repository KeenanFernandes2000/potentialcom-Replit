import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AutoSEO } from "@/components/SEO";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      // Success
      setIsSuccess(true);
      toast({
        title: "Success",
        description:
          "Password reset instructions have been sent to your email.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AutoSEO />
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-8 mt-14">
        <div className="container max-w-md py-16">
          <div className="mb-8">
            <Link
              href="/login"
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
            <h1 className="text-3xl font-bold mb-2">Reset Your Password</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-secondary/40 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-secondary-foreground/10">
              <h2 className="text-xl font-semibold mb-4">Check Your Email</h2>
              <p className="mb-6">
                We've sent password reset instructions to your email. Please
                check your inbox and follow the link to reset your password.
              </p>
              <div className="flex flex-col space-y-4">
                <Button asChild>
                  <Link href="/login">Return to Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/40 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-secondary-foreground/10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
