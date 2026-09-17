import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeUTMTracking } from "@/lib/utm-utils";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Offerings from "@/pages/Offerings";
import Resources from "@/pages/Resources";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import ForgotPassword from "@/pages/ForgotPassword";
import TermsOfUse from "@/pages/TermsOfUse";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import PromptingGuide from "@/pages/PromptingGuide";
import Blog from "@/pages/Blog";
import BlogCategory from "@/pages/BlogCategory";
import BlogPost from "@/pages/BlogPost";
import Partner from "@/pages/Partner";
import About from "@/pages/About";
import Vera from "@/pages/Vera";
import Ayla from "@/pages/Ayla";
import Inquire from "@/pages/Inquire";
import Voice from "@/pages/Voice";
import Chatbot from "@/pages/Chatbot";
import UseCases from "@/pages/UseCases";
import Demo from "@/pages/Demo";
import Lumi from "@/pages/Lumi";
import AIForCSR from "@/pages/AIForCSR";
import AIAgents from "@/pages/AIAgents";
import YearOfFamily from "@/pages/YearOfFamily";
import NationalPrograms from "@/pages/NationalPrograms";
import Book from "@/pages/Book";
import CaseStudies from "@/pages/CaseStudies";
import Platform from "@/pages/Platform";
import WorkforceCapability from "@/pages/WorkforceCapability";
import NationalCommunityEmpowerment from "@/pages/NationalCommunityEmpowerment";
import CustomerPartnerEnablement from "@/pages/CustomerPartnerEnablement";
import CSRCommunityImpact from "@/pages/CSRCommunityImpact";
import EntrepreneurshipSMEDevelopment from "@/pages/EntrepreneurshipSMEDevelopment";

function LegacyPricingRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/inquire", { replace: true });
  }, [navigate]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={LegacyPricingRedirect} />
      <Route path="/platform" component={Platform} />
      <Route path="/solutions/workforce-capability" component={WorkforceCapability} />
      <Route path="/solutions/national-community-empowerment" component={NationalCommunityEmpowerment} />
      <Route path="/solutions/customer-partner-enablement" component={CustomerPartnerEnablement} />
      <Route path="/solutions/csr-community-impact" component={CSRCommunityImpact} />
      <Route path="/solutions/entrepreneurship-sme-development" component={EntrepreneurshipSMEDevelopment} />
      <Route path="/solutions" component={Offerings} />
      <Route path="/resources" component={Resources} />
      <Route path="/partner" component={Partner} />
      <Route path="/about" component={About} />
      <Route path="/vera" component={Vera} />
      <Route path="/ayla" component={Ayla} />
      <Route path="/inquire" component={Inquire} />
      <Route path="/voice" component={Voice} />
      <Route path="/chatbot" component={Chatbot} />
      <Route path="/usecases" component={UseCases} />
      <Route path="/demo" component={Demo} />
      <Route path="/lumi" component={Lumi} />
      <Route path="/ai-for-csr" component={AIForCSR} />
      <Route path="/ai-agents" component={AIAgents} />
      <Route path="/year-of-family" component={YearOfFamily} />
      <Route path="/launch-programs" component={NationalPrograms} />
      <Route path="/book" component={Book} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/promptingguide" component={PromptingGuide} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/category/:slug" component={BlogCategory} />
      <Route path="/articles/:slug" component={BlogPost} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize UTM tracking on app load
  useEffect(() => {
    initializeUTMTracking();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
