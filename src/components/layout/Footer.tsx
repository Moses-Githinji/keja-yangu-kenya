import { Home, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">KejaYangu</h1>
                <p className="text-xs text-muted-foreground">Space That Suits You</p>
              </div>
            </Link>
            <p className="text-muted-foreground">
              Kenya's leading real estate platform connecting buyers, sellers, and renters 
              with their perfect properties.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/buy" className="text-muted-foreground hover:text-primary transition-colors">Buy Properties</Link></li>
              <li><Link to="/rent" className="text-muted-foreground hover:text-primary transition-colors">Rent Properties</Link></li>
              <li><Link to="/sell" className="text-muted-foreground hover:text-primary transition-colors">Sell Property</Link></li>
              <li><Link to="/agents" className="text-muted-foreground hover:text-primary transition-colors">Find Agents</Link></li>
              <li><Link to="/mortgage" className="text-muted-foreground hover:text-primary transition-colors">Mortgage Calculator</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/sitemap" className="text-muted-foreground hover:text-primary transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Westlands Towers, 14th Floor<br />
                    Nairobi, Kenya
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <p className="text-muted-foreground text-sm">+254 700 123 456</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-muted-foreground text-sm">info@kejayangu.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 KejaYangu. All rights reserved. Made with ❤️ in Kenya.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;