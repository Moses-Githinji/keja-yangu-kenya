import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Loader2, Mail, Phone, MessageCircle } from "lucide-react";

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
}

type InquiryCategory = "Viewing Request" | "Price Negotiation" | "General Inquiry" | "Legal/Paperwork";
type ContactPreference = "EMAIL" | "PHONE" | "WHATSAPP";

export const PropertyInquiryForm = ({ propertyId, propertyTitle, trigger }: PropertyInquiryFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<InquiryCategory>("General Inquiry");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("WHATSAPP");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.properties.createInquiry(propertyId, {
        category,
        message,
        contactPreference,
      });
      
      toast.success("Inquiry sent successfully!");
      setIsOpen(false);
      setMessage("");
    } catch (error: any) {
      console.error("Failed to send inquiry:", error);
      toast.error(error.message || "Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="w-full">Book a Viewing</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inquiry for {propertyTitle}</DialogTitle>
          <DialogDescription>
            Choose a category and tell us more about your interest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category">What is your inquiry about?</Label>
            <Select 
              value={category} 
              onValueChange={(val) => setCategory(val as InquiryCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Viewing Request">Viewing Request</SelectItem>
                <SelectItem value="Price Negotiation">Price Negotiation</SelectItem>
                <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                <SelectItem value="Legal/Paperwork">Legal/Paperwork</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us more... (e.g., preferred viewing dates, specific questions)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <Label>How should the agent contact you?</Label>
            <RadioGroup 
              value={contactPreference} 
              onValueChange={(val) => setContactPreference(val as ContactPreference)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WHATSAPP" id="pref-whatsapp" />
                <Label htmlFor="pref-whatsapp" className="flex items-center gap-1 cursor-pointer">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  WhatsApp
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PHONE" id="pref-phone" />
                <Label htmlFor="pref-phone" className="flex items-center gap-1 cursor-pointer">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Call
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EMAIL" id="pref-email" />
                <Label htmlFor="pref-email" className="flex items-center gap-1 cursor-pointer">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
