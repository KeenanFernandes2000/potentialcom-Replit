import { Switch, Route } from "wouter";
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
import Pricing from "@/pages/Pricing";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/solutions" component={Offerings} />
      <Route path="/resources" component={Resources} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/partner" component={Partner} />
      <Route path="/about" component={About} />
      <Route path="/vera" component={Vera} />
      <Route path="/ayla" component={Ayla} />
      <Route path="/voice" component={Voice} />
      <Route path="/chatbot" component={Chatbot} />
      <Route path="/usecases" component={UseCases} />
      <Route path="/demo" component={Demo} />
      <Route path="/lumi" component={Lumi} />
      <Route path="/ai-for-csr" component={AIForCSR} />
      <Route path="/ai-agents" component={AIAgents} />
      <Route path="/year-of-family" component={YearOfFamily} />
      <Route path="/national-programs" component={NationalPrograms} />
      <Route path="/book" component={Book} />
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
