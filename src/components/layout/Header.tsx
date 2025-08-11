import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Search, User, Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthModal from "@/components/auth/AuthModal";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gradient-primary">KejaYangu</h1>
              <p className="text-xs text-muted-foreground">Space That Suits You</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/buy" className="text-foreground hover:text-primary transition-colors">
              Buy
            </Link>
            <Link to="/rent" className="text-foreground hover:text-primary transition-colors">
              Rent
            </Link>
            <Link to="/sell" className="text-foreground hover:text-primary transition-colors">
              Sell
            </Link>
            <Link to="/agents" className="text-foreground hover:text-primary transition-colors">
              Agents
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-secondary-foreground text-xs">
                3
              </Badge>
            </Button>
            
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>

            <Button 
              variant="default" 
              className="hidden sm:inline-flex"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign In
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/buy" className="text-foreground hover:text-primary transition-colors">
                Buy
              </Link>
              <Link to="/rent" className="text-foreground hover:text-primary transition-colors">
                Rent
              </Link>
              <Link to="/sell" className="text-foreground hover:text-primary transition-colors">
                Sell
              </Link>
              <Link to="/agents" className="text-foreground hover:text-primary transition-colors">
                Agents
              </Link>
              <Button 
                variant="default" 
                className="w-full mt-2"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In
              </Button>
            </nav>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Header;