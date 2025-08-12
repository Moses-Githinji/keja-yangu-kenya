import { useState } from "react";
import { Upload, Camera, DollarSign, MapPin, Home, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Sell = () => {
  const [step, setStep] = useState(1);

  const steps = [
    { number: 1, title: "Property Details", description: "Basic information about your property" },
    { number: 2, title: "Photos & Media", description: "Upload images and virtual tours" },
    { number: 3, title: "Pricing & Features", description: "Set price and highlight features" },
    { number: 4, title: "Review & Publish", description: "Review and publish your listing" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Sell Your Property</h1>
          <p className="text-muted-foreground text-lg">List your property and reach thousands of potential buyers</p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Maximum Exposure</CardTitle>
              <CardDescription>Reach thousands of verified buyers actively searching for properties</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Professional Marketing</CardTitle>
              <CardDescription>High-quality photos, virtual tours, and premium listing features</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-tertiary" />
              </div>
              <CardTitle>Expert Support</CardTitle>
              <CardDescription>Dedicated support team to help you sell faster and for the best price</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Listing Form */}
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((stepItem, index) => (
                <div key={stepItem.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepItem.number 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {stepItem.number}
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p className={`font-medium ${step >= stepItem.number ? 'text-primary' : 'text-muted-foreground'}`}>
                      {stepItem.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{stepItem.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      step > stepItem.number ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Step {step}: {steps[step - 1].title}</CardTitle>
              <CardDescription>{steps[step - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Property Title</label>
                      <Input placeholder="e.g., Modern 3BR House in Karen" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Property Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Enter property address" className="pl-10" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bedroom</SelectItem>
                          <SelectItem value="2">2 Bedrooms</SelectItem>
                          <SelectItem value="3">3 Bedrooms</SelectItem>
                          <SelectItem value="4">4 Bedrooms</SelectItem>
                          <SelectItem value="5+">5+ Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Bathrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bathroom</SelectItem>
                          <SelectItem value="2">2 Bathrooms</SelectItem>
                          <SelectItem value="3">3 Bathrooms</SelectItem>
                          <SelectItem value="4+">4+ Bathrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Area (sqm)</label>
                      <Input placeholder="e.g., 250" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Description</label>
                    <Textarea 
                      placeholder="Describe your property's unique features, location benefits, and any recent renovations..."
                      rows={4}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="text-center">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Property Photos</h3>
                    <p className="text-muted-foreground mb-4">
                      Add high-quality photos to showcase your property. First photo will be the main listing image.
                    </p>
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Photos
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Asking Price (KSh)</label>
                      <Input placeholder="e.g., 25,000,000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Negotiable?</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes, Price Negotiable</SelectItem>
                          <SelectItem value="no">No, Fixed Price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Features</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Swimming Pool', 'Gym', 'Garden', 'Parking', 'Security', 'Balcony', 'Fireplace', 'Air Conditioning', 'Study Room'].map((feature) => (
                        <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Ready to Publish!</h3>
                  <p className="text-muted-foreground mb-6">
                    Review your listing details and publish to start receiving inquiries from potential buyers.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your listing will be reviewed within 24 hours</li>
                      <li>• Once approved, it will be visible to all users</li>
                      <li>• You'll receive notifications for all inquiries</li>
                      <li>• Track views and engagement in your dashboard</li>
                    </ul>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 4 ? (
                  <Button onClick={() => setStep(Math.min(4, step + 1))}>
                    Next Step
                  </Button>
                ) : (
                  <Button className="bg-primary hover:bg-primary/90">
                    Publish Listing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sell;