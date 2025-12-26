import { useState } from "react";
import {
  User,
  Building,
  Award,
  CheckCircle,
  FileText,
  Upload,
  Star,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BecomeAgent = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",

    // Professional Information
    experience: "",
    specialization: "",
    licenseNumber: "",
    company: "",
    bio: "",

    // Documents
    idDocument: null,
    licenseDocument: null,
    certifications: [],

    // Terms
    agreeToTerms: false,
    agreeToBackgroundCheck: false,
  });

  const { user } = useAuth();

  const steps = [
    {
      number: 1,
      title: "Personal Information",
      description: "Basic details about yourself",
    },
    {
      number: 2,
      title: "Professional Background",
      description: "Your real estate experience",
    },
    {
      number: 3,
      title: "Documents & Verification",
      description: "Upload required documents",
    },
    {
      number: 4,
      title: "Review & Submit",
      description: "Review your application",
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter((c) => c !== certification)
        : [...prev.certifications, certification],
    }));
  };

  const handleSubmitApplication = async () => {
    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "location",
      "experience",
      "specialization",
      "bio",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToBackgroundCheck) {
      toast({
        title: "Agreement required",
        description: "Please agree to the terms and background check.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload documents first
      let idDocumentUrl = null;
      let licenseDocumentUrl = null;

      if (formData.idDocument) {
        const idResponse = await apiService.upload.uploadDocument(
          formData.idDocument,
          "agent-documents"
        );
        idDocumentUrl = idResponse.data.data.url;
      }

      if (formData.licenseDocument) {
        const licenseResponse = await apiService.upload.uploadDocument(
          formData.licenseDocument,
          "agent-documents"
        );
        licenseDocumentUrl = licenseResponse.data.data.url;
      }

      // Submit agent application
      const applicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        experience: formData.experience,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        company: formData.company,
        bio: formData.bio,
        idDocument: idDocumentUrl,
        licenseDocument: licenseDocumentUrl,
        certifications: formData.certifications,
      };

      // Note: This endpoint might need to be implemented in the API
      await apiService.agents.apply(applicationData);

      toast({
        title: "Application submitted!",
        description:
          "Your agent application has been submitted for review. We'll contact you within 3-5 business days.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        experience: "",
        specialization: "",
        licenseNumber: "",
        company: "",
        bio: "",
        idDocument: null,
        licenseDocument: null,
        certifications: [],
        agreeToTerms: false,
        agreeToBackgroundCheck: false,
      });
      setStep(1);
    } catch (error) {
      console.error("Application error:", error);
      toast({
        title: "Application failed",
        description:
          "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Commission Earnings",
      description: "Earn competitive commissions on property sales and rentals",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Client Network",
      description: "Access to a large database of verified buyers and sellers",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Professional Development",
      description: "Training programs and certification opportunities",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Platform Support",
      description: "Marketing tools, CRM system, and dedicated support",
    },
  ];

  const requirements = [
    "Valid real estate license (where required)",
    "Minimum 2 years of real estate experience",
    "Clean background check",
    "Professional liability insurance",
    "Strong communication and negotiation skills",
    "Commitment to ethical practices",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Become a KejaYangu Agent</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join Kenya's leading property platform and grow your real estate
            career with us
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <div className="text-primary">{benefit.icon}</div>
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((stepItem, index) => (
                <div key={stepItem.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step >= stepItem.number
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {stepItem.number}
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p
                      className={`font-medium ${
                        step >= stepItem.number
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stepItem.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stepItem.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        step > stepItem.number ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Step {step}: {steps[step - 1].title}
              </CardTitle>
              <CardDescription>{steps[step - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="phone"
                        placeholder="+254 XXX XXX XXX"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location/City *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="location"
                        placeholder="e.g., Nairobi, Kenya"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) =>
                        handleInputChange("experience", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">0-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) =>
                        handleInputChange("specialization", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">
                          Residential Properties
                        </SelectItem>
                        <SelectItem value="commercial">
                          Commercial Properties
                        </SelectItem>
                        <SelectItem value="land">Land & Plots</SelectItem>
                        <SelectItem value="luxury">
                          Luxury Properties
                        </SelectItem>
                        <SelectItem value="rental">
                          Rental Properties
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="Your real estate license number"
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          handleInputChange("licenseNumber", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Agency</Label>
                      <Input
                        id="company"
                        placeholder="Current company or agency"
                        value={formData.company}
                        onChange={(e) =>
                          handleInputChange("company", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your experience, achievements, and why you want to join KejaYangu..."
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Certifications (Optional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {[
                        "Certified Residential Specialist",
                        "Certified Commercial Investment Member",
                        "Accredited Buyer's Representative",
                        "Certified Property Manager",
                        "Certified International Property Specialist",
                        "Certified Luxury Home Marketing Specialist",
                      ].map((certification) => (
                        <div
                          key={certification}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={certification}
                            checked={formData.certifications.includes(
                              certification
                            )}
                            onCheckedChange={() =>
                              handleCertificationToggle(certification)
                            }
                          />
                          <Label htmlFor={certification} className="text-sm">
                            {certification}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label>Identity Document *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a copy of your National ID or Passport
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "idDocument",
                            e.target.files?.[0] || null
                          )
                        }
                        className="max-w-xs mx-auto"
                      />
                      {formData.idDocument && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.idDocument.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Real Estate License (if applicable)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a copy of your real estate license
                      </p>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            "licenseDocument",
                            e.target.files?.[0] || null
                          )
                        }
                        className="max-w-xs mx-auto"
                      />
                      {formData.licenseDocument && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.licenseDocument.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Document Requirements
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Clear, readable copies of documents</li>
                      <li>• PDF, JPG, PNG formats accepted</li>
                      <li>• Maximum file size: 10MB per document</li>
                      <li>
                        • Documents will be verified during background check
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="font-medium mb-4">Application Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong> {formData.firstName}{" "}
                        {formData.lastName}
                      </div>
                      <div>
                        <strong>Email:</strong> {formData.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {formData.phone}
                      </div>
                      <div>
                        <strong>Location:</strong> {formData.location}
                      </div>
                      <div>
                        <strong>Experience:</strong> {formData.experience}
                      </div>
                      <div>
                        <strong>Specialization:</strong>{" "}
                        {formData.specialization}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "agreeToTerms",
                            checked ? "true" : "false"
                          )
                        }
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <a href="#" className="text-primary underline">
                          Terms of Service
                        </a>{" "}
                        and
                        <a href="#" className="text-primary underline ml-1">
                          Agent Agreement
                        </a>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="background"
                        checked={formData.agreeToBackgroundCheck}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "agreeToBackgroundCheck",
                            checked ? "true" : "false"
                          )
                        }
                      />
                      <Label htmlFor="background" className="text-sm">
                        I consent to a background check and verification of my
                        credentials
                      </Label>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      What happens next?
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Application review: 3-5 business days</li>
                      <li>• Background check: 5-7 business days</li>
                      <li>• Interview scheduling (if approved)</li>
                      <li>• Training and onboarding (if successful)</li>
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
                  <Button
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Agent Requirements</h2>
            <p className="text-muted-foreground">
              What we look for in our agents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requirements.map((requirement, index) => (
              <Card key={index}>
                <CardContent className="flex items-center space-x-3 p-6">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{requirement}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeAgent;
