import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AutoSEO } from "@/components/SEO";
import { ConsultationBookingModal } from "@/components/ConsultationBookingModal";
import { useState } from "react";
import { MessageSquare, Users, Target } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().default(""),
  countryCode: z.string().default(""),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z
    .string()
    .refine((value) => {
      if (!value || value.trim() === "" || value.trim() === "https://") {
        return true;
      }
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid website URL"),
  role: z.string().default(""),
  describeInitiative: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "SA" },
  { code: "+33", country: "FR" },
  { code: "+49", country: "DE" },
  { code: "+81", country: "JP" },
  { code: "+86", country: "CN" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
];

export default function Inquire() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      countryCode: "",
      companyName: "",
      companyWebsite: "https://",
      role: "",
      describeInitiative: "",
    },
  });

  const handleWebsiteChange = (value: string) => {
    if (
      value &&
      !value.startsWith("http://") &&
      !value.startsWith("https://")
    ) {
      form.setValue("companyWebsite", `https://${value}`);
    } else {
      form.setValue("companyWebsite", value);
    }
  };

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("/api/inquire/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      toast({
        title: "Thank you for getting in touch",
        description: "Choose a time for your free consultation session.",
      });
      form.reset();
      setShowBookingModal(true);
    } catch (error) {
      console.error("Inquiry form submission error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-inter min-h-screen bg-background">
      <AutoSEO />
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-secondary pt-24 pb-10 md:pt-28 md:pb-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-white/80">
                Human consultation
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white lg:text-6xl">
                Discuss your{" "}
                <span className="bg-gradient-to-r from-amber-300 via-pink-200 to-white bg-clip-text text-transparent">
                  initiative
                </span>{" "}
                with our team.
              </h1>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/85">
                Share your organisation, mandate and audience. We&apos;ll help
                you shape the right next step for your people and your
                organisation.
              </p>

            </div>
          </div>
        </section>

        <section id="inquire-form" className="scroll-mt-24 bg-muted/5 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <div className="mb-12 space-y-4 text-center">
                <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                  Start the conversation
                </h2>
                <p className="text-lg text-muted-foreground">
                  Fill out the form and choose a time to speak with the
                  Potential.com team.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-8 shadow-lg">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              First Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Last Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email Address <span className="text-destructive">*</span>
                          </FormLabel>
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

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Country Code <span className="text-muted-foreground">(optional)</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryCodes.map((country) => (
                                  <SelectItem
                                    key={country.code}
                                    value={country.code}
                                  >
                                    {country.code} ({country.country})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Phone Number <span className="text-muted-foreground">(optional)</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your phone number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Company Name <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your company name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Company Website <span className="text-muted-foreground">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://yourcompany.com"
                                {...field}
                                onChange={(event) =>
                                  handleWebsiteChange(event.target.value)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Role <span className="text-muted-foreground">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your role (e.g., Manager, Director, Executive)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="describeInitiative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Describe your Initiative/Program{" "}
                            <span className="text-muted-foreground">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your initiative or program"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-primary py-6 text-lg font-semibold text-white hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting your details..."
                        : "Book Your Free Consultation Session"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: "Clarify the mandate",
                  text: "Define the outcomes, audience and organisational priorities that matter most.",
                },
                {
                  icon: Users,
                  title: "Explore the journey",
                  text: "Identify the learning, engagement and support your people need to move forward.",
                },
                {
                  icon: MessageSquare,
                  title: "Leave with next steps",
                  text: "Get a practical view of what to do next and where Potential.com can help.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ConsultationBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}