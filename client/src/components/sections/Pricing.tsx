import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/animations";

const Pricing = () => {
  const pricingPlans = [
    {
      name: "Starter",
      price: "$50/mo",
      features: [
        "1 AI Chatbot",
        "10k tokens",
        "Basic analytics",
        "Standard support",
      ],
      isPopular: false,
      ctaText: "Start Free Trial",
    },
    {
      name: "Growth",
      price: "$199/mo",
      features: [
        "1 AI Voice Agent",
        "Multiple Agents",
        "Advanced Analytics",
        "Priority Support",
      ],
      isPopular: true,
      ctaText: "Start Free Trial",
    },
    {
      name: "Micro Platform",
      price: "$499+/mo",
      features: [
        "LMS, CRM, Support linked to agents",
        "Custom branding",
        "API access",
        "Dedicated success manager",
      ],
      isPopular: false,
      ctaText: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "$2K+/mo",
      features: [
        "Custom deployment",
        "Agent orchestration",
        "On-premise options",
        "SLA guarantees",
      ],
      isPopular: false,
      ctaText: "Talk to Vera",
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pricing
          </div>
          <h2 className="section-title mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your business needs, with flexible options
            for growth
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative glass-effect rounded-2xl p-6 border ${
                plan.isPopular ? "border-primary shadow-lg" : "border-border"
              } transition-all duration-300 hover:shadow-xl`}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-max px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-5">{plan.price}</div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full font-medium gtm-pricing-plan-${plan.name
                  .toLowerCase()
                  .replace(" ", "-")} ${
                  plan.isPopular
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                }`}
                onClick={() => {
                  if (plan.name === "Growth") {
                    window.location.href = "/solutions";
                    setTimeout(() => {
                      scrollToSection("agents");
                    }, 100);
                  } else if (plan.name === "Enterprise") {
                    window.location.href = "/vera";
                  }
                }}
              >
                {plan.ctaText}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            All plans include access to our core platform. Need a custom
            solution?
          </p>
          <Button
            variant="link"
            className="text-primary font-medium mt-2 gtm-pricing-contact-sales"
          >
            Contact our sales team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
