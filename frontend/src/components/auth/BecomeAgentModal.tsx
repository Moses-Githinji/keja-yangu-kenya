import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import { apiService } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface BecomeAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BecomeAgentModal: React.FC<BecomeAgentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    licenseNumber: "",
    experience: "",
    specializations: [] as string[],
    bio: "",
    website: "",
    phone: user?.phoneNumber || "",
    agreeToTerms: false,
  });

  // Check authentication when modal opens
  useEffect(() => {
    if (isOpen && !isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for agent status.",
        variant: "destructive",
      });
      onClose();
      navigate("/auth/signin");
    }
  }, [isOpen, isAuthenticated, isLoading, onClose, navigate, toast]);

  const specializations = [
    "Residential Sales",
    "Commercial Properties",
    "Property Management",
    "Real Estate Investment",
    "Land Sales",
    "Luxury Properties",
    "Student Housing",
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecializationChange = (
    specialization: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      specializations: checked
        ? [...prev.specializations, specialization]
        : prev.specializations.filter((s) => s !== specialization),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check authentication before submission
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for agent status.",
        variant: "destructive",
      });
      onClose();
      navigate("/auth/signin");
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationData = {
        company: formData.company,
        licenseNumber: formData.licenseNumber,
        experience: parseInt(formData.experience.replace(/[^0-9]/g, "")),
        specializations: formData.specializations,
        bio: formData.bio,
        website: formData.website,
        phone: formData.phone,
      };

      await apiService.agents.apply(applicationData);

      toast({
        title: "Application Submitted!",
        description:
          "Your agent application has been submitted successfully. We'll review it and get back to you soon.",
      });

      onClose();
      setFormData({
        company: "",
        licenseNumber: "",
        experience: "",
        specializations: [],
        bio: "",
        website: "",
        phone: user?.phoneNumber || "",
        agreeToTerms: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "There was an error submitting your application. Please try again.";

      // Handle uniqueness validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors
          .map((err: any) => err.message)
          .join(", ");

        toast({
          title: "Validation Failed",
          description: errorMessages,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Become a Real Estate Agent
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Fill out this form to apply for agent status. We'll review your
            application and get back to you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Your real estate company"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value)
                }
                placeholder="Your real estate license number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("experience", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+254 XXX XXX XXX"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {specializations.map((specialization) => (
                <div
                  key={specialization}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={specialization}
                    checked={formData.specializations.includes(specialization)}
                    onCheckedChange={(checked) =>
                      handleSpecializationChange(
                        specialization,
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={specialization}
                    className="text-xs sm:text-sm"
                  >
                    {specialization}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about your experience and why you want to become an agent..."
              rows={4}
              required
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) =>
                handleInputChange("agreeToTerms", checked as boolean)
              }
              className="mt-1"
            />
            <Label
              htmlFor="agreeToTerms"
              className="text-xs sm:text-sm leading-relaxed"
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs sm:text-sm"
              >
                Terms and Conditions
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs sm:text-sm"
              >
                Privacy Policy
              </button>
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </Dialog>
  );
};

export default BecomeAgentModal;
