import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { Layout } from "@/components/layout/Layout";

import Home from "@/pages/home";
import About from "@/pages/about";
import Administration from "@/pages/administration";
import Teachers from "@/pages/teachers";
import News from "@/pages/news";
import Achievements from "@/pages/achievements";
import Gallery from "@/pages/gallery";
import Admissions from "@/pages/admissions";
import Contact from "@/pages/contact";
import Students from "@/pages/students";
import Directions from "@/pages/directions";
import Events from "@/pages/events";
import FAQ from "@/pages/faq";
import Certificates from "@/pages/certificates";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAdministration from "@/pages/admin/administration";
import AdminTeachers from "@/pages/admin/teachers";
import AdminCertificates from "@/pages/admin/certificates";
import AdminNews from "@/pages/admin/news";
import AdminGallery from "@/pages/admin/gallery";
import AdminStudents from "@/pages/admin/students";
import AdminAdmissions from "@/pages/admin/admissions";
import AdminContact from "@/pages/admin/contact";
import AdminSettings from "@/pages/admin/settings";
import AdminMedia from "@/pages/admin/media";

const queryClient = new QueryClient();

function Spinner() {
  return (
    <div className="min-h-screen bg-[#080e1e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdmin();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <AdminLogin />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/administration">
        <AdminGuard><AdminAdministration /></AdminGuard>
      </Route>
      <Route path="/admin/teachers">
        <AdminGuard><AdminTeachers /></AdminGuard>
      </Route>
      <Route path="/admin/certificates">
        <AdminGuard><AdminCertificates /></AdminGuard>
      </Route>
      <Route path="/admin/news">
        <AdminGuard><AdminNews /></AdminGuard>
      </Route>
      <Route path="/admin/gallery">
        <AdminGuard><AdminGallery /></AdminGuard>
      </Route>
      <Route path="/admin/students">
        <AdminGuard><AdminStudents /></AdminGuard>
      </Route>
      <Route path="/admin/admissions">
        <AdminGuard><AdminAdmissions /></AdminGuard>
      </Route>
      <Route path="/admin/contact">
        <AdminGuard><AdminContact /></AdminGuard>
      </Route>
      <Route path="/admin/settings">
        <AdminGuard><AdminSettings /></AdminGuard>
      </Route>
      <Route path="/admin/media">
        <AdminGuard><AdminMedia /></AdminGuard>
      </Route>
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/administration" component={Administration} />
            <Route path="/teachers" component={Teachers} />
            <Route path="/news" component={News} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/admissions" component={Admissions} />
            <Route path="/contact" component={Contact} />
            <Route path="/students" component={Students} />
            <Route path="/directions" component={Directions} />
            <Route path="/events" component={Events} />
            <Route path="/faq" component={FAQ} />
            <Route path="/certificates" component={Certificates} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <LanguageProvider>
        <AdminProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </AdminProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
