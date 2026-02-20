import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-max mx-auto text-center">
          <div className="sm:flex">
            <p className="text-4xl font-extrabold text-blue-600 sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-4 text-base text-gray-500">
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center sm:justify-start">
                <Button onClick={() => navigate("/")} className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Go back home
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go back
                </Button>
                <Button variant="ghost" asChild className="flex items-center">
                  <Link to="/buy">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-gray-400">
              Transforming Real Estate in Kenya using Artificial Intelligence
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
