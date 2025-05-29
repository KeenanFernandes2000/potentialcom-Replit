import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import veraBannerSvg from "@assets/Vera Banner.svg";
import veraAvatarPng from "@assets/vera-avatar.png";
import { Check, Search, Users, Calendar, MessageSquare } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  countryCode: z.string().min(1, "Please select a country code"),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
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

export default function Vera() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      companyWebsite: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      // Here you would integrate with your chat system or backend
      console.log("Form submitted:", values);
      
      toast({
        title: "Welcome to Vera!",
        description: "Your request has been submitted. Vera will be with you shortly!",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const formElement = document.getElementById("vera-form");
    if (formElement) {
      const offsetTop = formElement.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="font-inter min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ml-[25px] mr-[25px]">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                    Hello, I'm Vera,
                    <br />
                    <span className="text-primary">Your AI Business Consultant</span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Chat or talk to me, and I'll help you explore AI solutions for your business—completely free!
                  </p>
                </div>
                
                <Button 
                  onClick={scrollToForm}
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg"
                >
                  Get Started with Vera
                </Button>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg">
                  <img
                    src={veraAvatarPng}
                    alt="Vera AI Business Consultant"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-20 w-64 h-64 opacity-20 dark:opacity-5 blur-3xl">
              <div className="w-full h-full rounded-full bg-primary" />
            </div>
            <div className="absolute bottom-20 right-20 w-80 h-80 opacity-15 dark:opacity-5 blur-3xl">
              <div className="w-full h-full rounded-full bg-accent" />
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section id="vera-form" className="py-20 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Get Started Now
                </h2>
                <p className="text-lg text-muted-foreground">
                  Fill out the form and start chatting with me instantly!
                </p>
              </div>

              <div className="bg-card rounded-xl shadow-lg p-8 border">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
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
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email address" {...field} />
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
                            <FormLabel>Country Code</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
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
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your company name" {...field} />
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
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourcompany.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Connecting to Vera..." : "Talk to Vera"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </section>

        {/* How Can I Help You Section */}
        <section className="py-20 bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                How Can I Help You?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Search,
                  title: "Find the Right AI Solutions",
                  description: "I'll help you identify the best AI tools tailored to your needs."
                },
                {
                  icon: Users,
                  title: "Set up Your Chatbot and Voice Agents",
                  description: "I'll automatically set up your chatbot or voice agents while we speak."
                },
                {
                  icon: Calendar,
                  title: "Schedule a Meeting",
                  description: "Need expert advice? I can set up a call with a human consultant."
                },
                {
                  icon: MessageSquare,
                  title: "Available 24/7",
                  description: "Chat or talk to me anytime—wherever you are! I'm also available on WhatsApp and Phone"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center space-y-4 p-6 bg-card rounded-xl border hover:shadow-lg transition-shadow">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Vera Section */}
        <section className="py-20 bg-background ml-[25px] mr-[25px]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Image */}
              <div className="relative flex justify-center lg:justify-start">
                <div className="relative">
                  {/* Background decorative circles */}
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-200 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-300 rounded-full opacity-40"></div>
                  
                  {/* Vera's image */}
                  <div className="relative w-80 h-80 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg overflow-hidden flex items-center justify-center ml-[25px] mr-[25px]">
                    <img
                      src={veraAvatarPng}
                      alt="Vera AI Business Consultant"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Meet Vera: <span className="text-primary">Your AI Guide</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    I'm Vera, your AI-powered consultant, here to guide you through the world of AI adoption. With my expertise, I can help you:
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    "Automate your customer support with AI solutions",
                    "Boost your sales with intelligent chatbots", 
                    "Optimize your business processes with AI"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <p className="text-lg font-semibold text-foreground mb-4">
                    Best of all? My consultation is completely free!
                  </p>
                  <Button 
                    onClick={scrollToForm}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3"
                  >
                    Start Your Free Consultation →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}