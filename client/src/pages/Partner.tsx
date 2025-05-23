import { Handshake, Award, BarChart, Check, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BecomePartner from "@/components/sections/BecomePartner";

// Partner benefit component
interface BenefitProps {
  icon: React.FC<LucideProps>;
  title: string;
  description: string;
}

const Benefit = ({ icon: Icon, title, description }: BenefitProps) => (
  <div className="flex flex-col items-start p-6 border rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-md">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Partner type component
interface PartnerTypeProps {
  title: string;
  description: string;
  benefits: string[];
}

const PartnerType = ({ title, description, benefits }: PartnerTypeProps) => (
  <div className="p-6 border rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-md">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    <ul className="space-y-2">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start">
          <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default function Partner() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      companyName: "",
      companyWebsite: "",
      jobTitle: "",
      companySize: "11-50",
      partnerReason: "",
      isSubscribedToNewsletter: true
    }
  });

  // Form submission handler
  const onSubmit = async (values: PartnerFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Application Submitted!",
          description: "We've received your partner application and will be in touch soon.",
        });
        form.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Partner program benefits
  const benefits = [
    {
      icon: BarChart,
      title: "Revenue Growth",
      description: "Access new markets and increase your revenue stream by offering cutting-edge AI solutions to your clients."
    },
    {
      icon: Award,
      title: "Market Differentiation",
      description: "Stand out from competitors with exclusive access to our innovative AI ecosystem and technology."
    },
    {
      icon: Users,
      title: "Co-Marketing Support",
      description: "Joint marketing initiatives, lead generation programs, and co-branded materials to boost your visibility."
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Join our worldwide network of partners and access opportunities for collaboration and knowledge sharing."
    }
  ];

  // Partner types
  const partnerTypes = [
    {
      title: "Solutions Partners",
      description: "Integrate our AI technologies into your service offerings to deliver enhanced value to your clients.",
      benefits: [
        "Comprehensive sales and technical training",
        "Access to partner portal resources",
        "Joint customer success stories",
        "Dedicated partner manager"
      ]
    },
    {
      title: "Technology Partners",
      description: "Build seamless integrations between your technologies and our AI ecosystem.",
      benefits: [
        "API documentation and integration support",
        "Technical co-development opportunities",
        "Joint product roadmap planning",
        "Regular technology deep-dive sessions"
      ]
    },
    {
      title: "Referral Partners",
      description: "Refer potential customers to us and earn competitive commissions on successful sales.",
      benefits: [
        "Simple onboarding process",
        "Attractive commission structure",
        "Deal registration protection",
        "Sales enablement resources"
      ]
    }
  ];

  return (
    <>
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-background py-16 md:py-24">
          <div className="container text-center max-w-4xl mx-auto">
            <div 
              className="inline-flex items-center bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-6 text-sm font-medium"
              data-aos="fade-up"
            >
              <Handshake className="h-4 w-4 mr-2" /> Partner Program
            </div>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Become a <span className="text-primary">Partner</span>
            </h1>
            <p 
              className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Join our ecosystem of technology partners and help organizations empower
              their stakeholders with cutting-edge AI solutions.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">Partner Program Benefits</h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              Our partner program is designed to create win-win relationships, providing you with the resources, 
              technology, and support needed to grow your business.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {benefits.map((benefit, index) => (
                <div key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                  <Benefit {...benefit} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Types Section */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-4">Partnership Options</h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              We offer multiple partnership models to fit your business goals and expertise.
              Choose the path that aligns best with your organization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {partnerTypes.map((type, index) => (
                <div key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                  <PartnerType {...type} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Partners Say</h2>
            <div className="bg-card p-8 rounded-xl shadow-md border" data-aos="fade-up">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <blockquote className="text-lg italic mb-4">
                    "Partnering with Potential.com has transformed our service offerings. The AI technologies 
                    we've integrated have not only impressed our clients but significantly increased our revenue. 
                    The support and resources provided have been exceptional."
                  </blockquote>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">CEO, TechAdvance Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section id="partner-application" className="py-16">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-4">Apply to Become a Partner</h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              Fill out the form below to express your interest in our partner program. 
              Our team will review your application and get back to you within 2 business days.
            </p>
            
            {isSuccess ? (
              <div className="text-center p-8 border rounded-xl bg-card" data-aos="fade-up">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for your interest in partnering with us. Our team will review your application 
                  and contact you shortly to discuss the next steps.
                </p>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setIsSuccess(false)}
                >
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <div className="border rounded-xl p-8 bg-card shadow-sm" data-aos="fade-up">
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
                              <Input placeholder="John" {...field} />
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
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 555 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Ltd." {...field} />
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="CEO / Marketing Director / CTO" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="partnerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interested Partnership Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Solutions Partner / Technology Partner / Referral Partner" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Information</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please share any additional information about your company and your interest in partnering with us." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}