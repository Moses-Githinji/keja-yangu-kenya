import { useState } from "react";
import { Search, MapPin, Star, Phone, Mail, MessageCircle, Award, Users, TrendingUp } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");

  // Sample agents data
  const agents = [
    {
      id: "1",
      name: "Sarah Kamau",
      title: "Senior Real Estate Agent",
      company: "Prime Properties Kenya",
      location: "Nairobi, Kenya",
      avatar: "/api/placeholder/120/120",
      rating: 4.9,
      reviews: 156,
      sales: 45,
      specializations: ["Luxury Homes", "Investment Properties"],
      languages: ["English", "Swahili", "Kikuyu"],
      experience: "8 years",
      phone: "+254 700 123 456",
      email: "sarah@primeproperties.co.ke"
    },
    {
      id: "2",
      name: "John Ochieng",
      title: "Property Consultant",
      company: "Urban Living Realty",
      location: "Mombasa, Kenya",
      avatar: "/api/placeholder/120/120",
      rating: 4.7,
      reviews: 89,
      sales: 32,
      specializations: ["Residential", "Commercial"],
      languages: ["English", "Swahili", "Luo"],
      experience: "5 years",
      phone: "+254 700 234 567",
      email: "john@urbanliving.co.ke"
    },
    {
      id: "3",
      name: "Grace Wanjiku",
      title: "Real Estate Broker",
      company: "Keja Solutions",
      location: "Kisumu, Kenya",
      avatar: "/api/placeholder/120/120",
      rating: 4.8,
      reviews: 124,
      sales: 67,
      specializations: ["First-time Buyers", "Rentals"],
      languages: ["English", "Swahili"],
      experience: "12 years",
      phone: "+254 700 345 678",
      email: "grace@kejasolutions.co.ke"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Find Real Estate Agents</h1>
          <p className="text-muted-foreground text-lg">Connect with experienced agents who know the Kenyan market</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>500+ Agents</CardTitle>
              <CardDescription>Verified real estate professionals across Kenya</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Expert Knowledge</CardTitle>
              <CardDescription>Local market expertise and professional certifications</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-tertiary" />
              </div>
              <CardTitle>Proven Results</CardTitle>
              <CardDescription>Track record of successful property transactions</CardDescription>
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
                <SelectItem value="investment">Investment Properties</SelectItem>
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
            <Badge variant="secondary">{agents.length} agents found</Badge>
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
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <CardDescription>{agent.title}</CardDescription>
                <p className="text-sm font-medium text-primary">{agent.company}</p>
                
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{agent.rating}</span>
                  <span className="text-muted-foreground">({agent.reviews} reviews)</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{agent.location}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium">{agent.experience}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Properties Sold:</span>
                    <span className="font-medium">{agent.sales}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Languages:</p>
                  <p className="text-sm">{agent.languages.join(', ')}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Are you a Real Estate Agent?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join KejaYangu and connect with thousands of potential clients. Build your professional profile and grow your business.
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