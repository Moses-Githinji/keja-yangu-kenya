import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  MapPin,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MarketTrendsSection = () => {
  const [selectedCity, setSelectedCity] = useState("nairobi");
  const [selectedPropertyType, setSelectedPropertyType] = useState("all");

  // Mock market data - in a real app, this would come from an API
  const marketData = {
    nairobi: {
      averagePrice: "12,500,000",
      priceChange: "+8.5%",
      priceTrend: "up",
      daysOnMarket: 45,
      daysChange: "-12%",
      propertiesSold: 1250,
      soldChange: "+15%",
      pricePerSqFt: "85,000",
      sqFtChange: "+6.2%",
    },
    mombasa: {
      averagePrice: "8,200,000",
      priceChange: "+12.3%",
      priceTrend: "up",
      daysOnMarket: 38,
      daysChange: "-8%",
      propertiesSold: 890,
      soldChange: "+22%",
      pricePerSqFt: "72,000",
      sqFtChange: "+9.1%",
    },
    kisumu: {
      averagePrice: "5,800,000",
      priceChange: "+5.7%",
      priceTrend: "up",
      daysOnMarket: 52,
      daysChange: "-5%",
      propertiesSold: 650,
      soldChange: "+8%",
      pricePerSqFt: "48,000",
      sqFtChange: "+4.3%",
    },
  };

  const propertyTypes = [
    { value: "all", label: "All Properties" },
    { value: "apartment", label: "Apartments" },
    { value: "house", label: "Houses" },
    { value: "villa", label: "Villas" },
    { value: "land", label: "Land" },
  ];

  const cities = [
    { value: "nairobi", label: "Nairobi" },
    { value: "mombasa", label: "Mombasa" },
    { value: "kisumu", label: "Kisumu" },
  ];

  const currentData = marketData[selectedCity as keyof typeof marketData];

  // Mock chart data for price trends
  const priceTrendData = [
    { month: "Jan", price: 11.2 },
    { month: "Feb", price: 11.5 },
    { month: "Mar", price: 11.8 },
    { month: "Apr", price: 12.1 },
    { month: "May", price: 12.3 },
    { month: "Jun", price: 12.5 },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Market Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-4">
            Real Estate Market Trends
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest market data, price trends, and
            investment opportunities across Kenya
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 justify-center items-center">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPropertyType}
            onValueChange={setSelectedPropertyType}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <Badge
                  variant={
                    currentData.priceTrend === "up" ? "default" : "destructive"
                  }
                  className="flex items-center gap-1"
                >
                  {currentData.priceTrend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {currentData.priceChange}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">
                {currentData.averagePrice}
              </h3>
              <p className="text-sm text-muted-foreground">
                Average Property Price
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Home className="h-6 w-6 text-secondary" />
                </div>
                <Badge
                  variant={
                    currentData.daysChange.includes("-")
                      ? "default"
                      : "destructive"
                  }
                  className="flex items-center gap-1"
                >
                  {currentData.daysChange.includes("-") ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {currentData.daysChange}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">
                {currentData.daysOnMarket}
              </h3>
              <p className="text-sm text-muted-foreground">Days on Market</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {currentData.soldChange}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">
                {currentData.propertiesSold.toLocaleString()}
              </h3>
              <p className="text-sm text-muted-foreground">
                Properties Sold (YTD)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-warning" />
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {currentData.sqFtChange}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-1">
                {currentData.pricePerSqFt}
              </h3>
              <p className="text-sm text-muted-foreground">Price per Sq Ft</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
            <TabsTrigger value="forecast">Investment Outlook</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Price Trends -{" "}
                  {cities.find((c) => c.value === selectedCity)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-center gap-2">
                  {priceTrendData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40"
                        style={{ height: `${(data.price / 15) * 200}px` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Average price trend over the last 6 months (in millions KES)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Market Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(marketData).map(([city, data]) => (
                    <div
                      key={city}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="font-medium capitalize">{city}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-muted-foreground">
                          Avg: {data.averagePrice}
                        </span>
                        <Badge
                          variant={
                            data.priceTrend === "up" ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {data.priceChange}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Investment Outlook</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <h4 className="font-semibold text-success mb-2">
                      High Growth Potential
                    </h4>
                    <p className="text-sm text-success/80">
                      {selectedCity === "nairobi"
                        ? "Westlands and Upper Hill show strong appreciation trends"
                        : selectedCity === "mombasa"
                        ? "Nyali and Diani continue to attract luxury buyers"
                        : "Milimani and Lolwe areas are emerging as investment hotspots"}
                    </p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <h4 className="font-semibold text-warning mb-2">
                      Market Insights
                    </h4>
                    <p className="text-sm text-warning/80">
                      Property values expected to increase by 8-12% in the next
                      12 months based on current trends and development
                      projects.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
              Ready to Make Informed Investment Decisions?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Get detailed market reports, property valuations, and expert
              insights to maximize your real estate investments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Download Market Report
              </button>
              <button className="px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketTrendsSection;
