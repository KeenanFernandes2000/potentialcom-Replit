import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Blog from "@/pages/Blog";
import BlogCategory from "@/pages/BlogCategory";
import BlogPost from "@/pages/BlogPost";
import Partner from "@/pages/Partner";
import About from "@/pages/About";
import Vera from "@/pages/Vera";

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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/category/:slug" component={BlogCategory} />
      <Route path="/articles/:slug" component={BlogPost} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
