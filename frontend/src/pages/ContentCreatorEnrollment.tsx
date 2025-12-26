import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { DollarSign, CheckCircle, Info, Shield, Star } from "lucide-react";

const ContentCreatorEnrollment = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    taxId: "",
    mpesaNumber: "",
    payoutMethod: "MPESA",
    agreeToTerms: false,
    agreeToCompliance: false,
    agreeToTaxReporting: false,
  });

  const totalSteps = 4;

  useEffect(() => {
    console.log("ContentCreatorEnrollment mounted");
    console.log("User:", user);
    console.log("Is authenticated:", isAuthenticated);

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to signin");
      navigate("/auth/signin");
      return;
    }
  }, [isAuthenticated, navigate, user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      toast({
        title: "Enrollment Submitted",
        description: "Your application has been submitted successfully!",
        variant: "default",
      });
      navigate("/content-creator-dashboard");
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
            <p className="text-muted-foreground mb-4">
              Please log in to access this page.
            </p>
            <Button onClick={() => navigate("/auth/signin")}>
              Go to Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            <h1 className="text-4xl font-bold">Content Creator Enrollment</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our content creator program and start earning from your
            property listings.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStep === 1 && "Tax Information"}
                    {currentStep === 2 && "Payment Method"}
                    {currentStep === 3 && "Terms & Compliance"}
                    {currentStep === 4 && "Document Verification"}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 &&
                      "Provide your tax identification information"}
                    {currentStep === 2 &&
                      "Choose how you'd like to receive payments"}
                    {currentStep === 3 && "Review and agree to our terms"}
                    {currentStep === 4 &&
                      "Upload required verification documents"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Step 1: Tax Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="taxId">Tax ID / KRA PIN</Label>
                        <Input
                          id="taxId"
                          placeholder="Enter your KRA PIN or Tax ID"
                          value={formData.taxId}
                          onChange={(e) =>
                            handleInputChange("taxId", e.target.value)
                          }
                        />
                      </div>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Your tax information is required for compliance with
                          Kenyan tax laws.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label>Payout Method</Label>
                        <Select
                          value={formData.payoutMethod}
                          onValueChange={(value) =>
                            handleInputChange("payoutMethod", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MPESA">M-Pesa</SelectItem>
                            <SelectItem value="BANK_TRANSFER">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="PAYPAL">PayPal</SelectItem>
                            <SelectItem value="STRIPE">Stripe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.payoutMethod === "MPESA" && (
                        <div>
                          <Label htmlFor="mpesaNumber">M-Pesa Number</Label>
                          <Input
                            id="mpesaNumber"
                            placeholder="254XXXXXXXXX"
                            value={formData.mpesaNumber}
                            onChange={(e) =>
                              handleInputChange("mpesaNumber", e.target.value)
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter your M-Pesa number in international format
                            (254XXXXXXXXX)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Terms & Compliance */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) =>
                            handleInputChange("agreeToTerms", checked)
                          }
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor="agreeToTerms"
                            className="text-sm font-medium"
                          >
                            I agree to the Content Creator Terms and Conditions
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            By checking this box, you agree to our platform's
                            terms of service.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreeToCompliance"
                          checked={formData.agreeToCompliance}
                          onCheckedChange={(checked) =>
                            handleInputChange("agreeToCompliance", checked)
                          }
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor="agreeToCompliance"
                            className="text-sm font-medium"
                          >
                            I agree to comply with all platform policies and
                            quality standards
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            You must maintain high-quality property listings and
                            follow all platform guidelines.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreeToTaxReporting"
                          checked={formData.agreeToTaxReporting}
                          onCheckedChange={(checked) =>
                            handleInputChange("agreeToTaxReporting", checked)
                          }
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor="agreeToTaxReporting"
                            className="text-sm font-medium"
                          >
                            I agree to tax reporting and compliance requirements
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            All earnings will be reported to KRA as required by
                            Kenyan tax law.
                          </p>
                        </div>
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Important:</strong> By enrolling as a content
                          creator, you agree to comply with all Kenyan real
                          estate laws, tax regulations, and platform policies.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Step 4: Document Verification */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="idDocument">
                          Government ID Document
                        </Label>
                        <Input
                          id="idDocument"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a clear copy of your National ID, Passport, or
                          Driver's License
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="proofOfAddress">Proof of Address</Label>
                        <Input
                          id="proofOfAddress"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a recent utility bill, bank statement, or
                          rental agreement
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Program Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Earn KES 0.01 per property view
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Earn KES 0.50 per inquiry</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">10% of premium listing fees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">70% of ad revenue share</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Minimum payout: KES 100</span>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Requirements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      At least 1 verified property
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Valid government ID</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Proof of address</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tax ID (KRA PIN)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Compliance with platform policies
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <span>Current Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Properties</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Identity</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>Next Step</Button>
              ) : (
                <Button onClick={handleSubmit}>Submit Application</Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentCreatorEnrollment;
