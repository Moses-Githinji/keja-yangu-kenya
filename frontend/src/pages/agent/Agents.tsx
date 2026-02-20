import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Award,
  Users,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await apiService.agents.getAll({
          search: searchQuery,
          city: location,
          specialization: specialization,
          limit: 20,
        });
        setAgents(response.data.data || []);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError("Failed to load agents. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load agents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [searchQuery, location, specialization, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Find Real Estate Agents</h1>
          <p className="text-muted-foreground text-lg">
            Connect with experienced agents who know the Kenyan market
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>500+ Agents</CardTitle>
              <CardDescription>
                Verified real estate professionals across Kenya
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Expert Knowledge</CardTitle>
              <CardDescription>
                Local market expertise and professional certifications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-tertiary" />
              </div>
              <CardTitle>Proven Results</CardTitle>
              <CardDescription>
                Track record of successful property transactions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nairobi">Nairobi</SelectItem>
                <SelectItem value="mombasa">Mombasa</SelectItem>
                <SelectItem value="kisumu">Kisumu</SelectItem>
                <SelectItem value="nakuru">Nakuru</SelectItem>
                <SelectItem value="eldoret">Eldoret</SelectItem>
              </SelectContent>
            </Select>

            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="luxury">Luxury Homes</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="investment">
                  Investment Properties
                </SelectItem>
                <SelectItem value="rentals">Rentals</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-primary hover:bg-primary/90">
              Search Agents
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge variant="secondary">Loading agents...</Badge>
            ) : error ? (
              <Badge variant="destructive">Error loading agents</Badge>
            ) : (
              <Badge variant="secondary">{agents.length} agents found</Badge>
            )}
            <span className="text-muted-foreground">in your area</span>
          </div>

          <Select defaultValue="rating">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
              <SelectItem value="sales">Most Sales</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : agents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Agents Available
                </h3>
                <p className="text-muted-foreground mb-6">
                  There are currently no approved agents in our network. Check
                  back later or consider becoming an agent yourself.
                </p>
                <Button onClick={() => window.open("/become-agent", "_blank")}>
                  Become an Agent
                </Button>
              </div>
            </div>
          ) : (
            agents.map((agent) => (
              <Card
                key={agent.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage
                      src={agent.avatar}
                      alt={`${agent.firstName} ${agent.lastName}`}
                    />
                    <AvatarFallback>{`${agent.firstName?.[0] || ""}${
                      agent.lastName?.[0] || ""
                    }`}</AvatarFallback>
                  </Avatar>

                  <CardTitle className="text-xl">{`${agent.firstName} ${agent.lastName}`}</CardTitle>
                  <CardDescription>Real Estate Agent</CardDescription>
                  {agent.agentProfile?.company && (
                    <p className="text-sm font-medium text-primary">
                      {agent.agentProfile.company}
                    </p>
                  )}

                  {agent.agentProfile?.isVerified && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        Verified Agent
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Nairobi, Kenya</span>{" "}
                    {/* Placeholder since location fields aren't in schema */}
                  </div>

                  {agent.agentProfile && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Experience:
                          </span>
                          <span className="font-medium">
                            {agent.agentProfile.experience} years
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Specializations:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(agent.agentProfile.specializations) &&
                          agent.agentProfile.specializations.length > 0 ? (
                            agent.agentProfile.specializations.map((spec) => (
                              <Badge
                                key={spec}
                                variant="outline"
                                className="text-xs"
                              >
                                {spec}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>

                      {agent.agentProfile.languages && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Languages:
                          </p>
                          <p className="text-sm">
                            {agent.agentProfile.languages.join(", ")}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${agent.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${agent.email}`)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">
              Are you a Real Estate Agent?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join KejaYangu and connect with thousands of potential clients.
              Build your professional profile and grow your business.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Join as an Agent
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Agents;
