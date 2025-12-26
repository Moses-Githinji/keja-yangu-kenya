import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  User,
  Bell,
  Menu,
  X,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Building,
  Heart,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  // Keyboard shortcut for global search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignIn = () => {
    navigate("/auth/signin");
  };

  const handleSignUp = () => {
    navigate("/auth/register");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const { firstName, lastName } = user;
    return (
      `${firstName?.charAt(0) || ""}${
        lastName?.charAt(0) || ""
      }`.toUpperCase() || "U"
    );
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    const { firstName, lastName } = user;
    return `${firstName || ""} ${lastName || ""}`.trim() || "User";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gradient-primary">
                KejaYangu
              </h1>
              <p className="text-xs text-muted-foreground">
                Space That Suits You
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/buy"
              className="text-foreground hover:text-primary transition-colors"
            >
              Buy
            </Link>
            <Link
              to="/rent"
              className="text-foreground hover:text-primary transition-colors"
            >
              Rent
            </Link>
            {user?.role === "AGENT" || user?.role === "ADMIN" ? null : (
              <button
                onClick={() => {
                  const event = new CustomEvent("openBecomeAgentModal");
                  window.dispatchEvent(event);
                }}
                className="text-foreground hover:text-primary transition-colors"
              >
                Sell
              </button>
            )}
            <Link
              to="/agents"
              className="text-foreground hover:text-primary transition-colors"
            >
              Agents
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <NotificationDropdown />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGlobalSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Section */}
            {isAuthenticated ? (
              <DropdownMenu
                open={isUserMenuOpen}
                onOpenChange={setIsUserMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 hover:bg-accent transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profilePicture}
                        alt={getUserDisplayName()}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="absolute -bottom-1 -right-1 h-4 w-4 bg-background rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-2"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/profile");
                      setIsUserMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/account");
                      setIsUserMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account & Settings</span>
                  </DropdownMenuItem>

                  {user?.role === "AGENT" && (
                    <DropdownMenuItem
                      onClick={() => {
                        navigate("/agent");
                        setIsUserMenuOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Building className="mr-2 h-4 w-4" />
                      <span>Agent Dashboard</span>
                    </DropdownMenuItem>
                  )}

                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem
                      onClick={() => {
                        navigate("/system-admin");
                        setIsUserMenuOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Building className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/favorites");
                      setIsUserMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/messages");
                      setIsUserMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/notifications");
                      setIsUserMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>

                  {/* Agent Menu Items */}
                  {user?.role === "AGENT" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/agent/properties");
                          setIsUserMenuOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Building className="mr-2 h-4 w-4" />
                        <span>My Properties</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/agent/finance");
                          setIsUserMenuOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Finance</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Content Creator Menu Items */}
                  {user?.role === "CONTENT_CREATOR" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/content-creator-dashboard");
                          setIsUserMenuOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Creator Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="outline" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button variant="default" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/buy"
                className="text-foreground hover:text-primary transition-colors"
              >
                Buy
              </Link>
              <Link
                to="/rent"
                className="text-foreground hover:text-primary transition-colors"
              >
                Rent
              </Link>
              {user?.role === "AGENT" || user?.role === "ADMIN" ? null : (
                <button
                  onClick={() => {
                    const event = new CustomEvent("openBecomeAgentModal");
                    window.dispatchEvent(event);
                  }}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Sell
                </button>
              )}
              <Link
                to="/agents"
                className="text-foreground hover:text-primary transition-colors"
              >
                Agents
              </Link>

              {/* Mobile User Section */}
              {isAuthenticated ? (
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.profilePicture}
                        alt={getUserDisplayName()}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/account"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account & Settings</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Building className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favorites</span>
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                  </Link>

                  <Link
                    to="/notifications"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </Link>

                  {user?.role === "AGENT" && (
                    <Link
                      to="/agent-dashboard"
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building className="h-4 w-4" />
                      <span>Agent Dashboard</span>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSignIn}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleSignUp}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
    </header>
  );
};

export default Header;
