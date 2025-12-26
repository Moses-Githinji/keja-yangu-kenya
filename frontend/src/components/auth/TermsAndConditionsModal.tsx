import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read these terms carefully before proceeding with your agent
            application.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">
                1. Acceptance of Terms
              </h3>
              <p>
                By submitting an application to become a real estate agent on
                Keja Yangu Kenya, you agree to be bound by these Terms and
                Conditions. If you do not agree to these terms, please do not
                proceed with your application.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                2. Eligibility Requirements
              </h3>
              <p>To become an agent, you must:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Be at least 18 years old</li>
                <li>Hold a valid real estate license in Kenya</li>
                <li>
                  Provide accurate and complete information in your application
                </li>
                <li>
                  Agree to comply with all applicable laws and regulations
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                3. Agent Responsibilities
              </h3>
              <p>As an agent, you agree to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide accurate property information</li>
                <li>Act in the best interests of your clients</li>
                <li>Maintain professional conduct at all times</li>
                <li>Comply with all real estate regulations</li>
                <li>Keep your license current and valid</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                4. Commission and Fees
              </h3>
              <p>
                Commission rates and fees will be determined based on the
                services provided and agreements with clients. All commissions
                are subject to applicable laws and platform policies.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Termination</h3>
              <p>
                We reserve the right to terminate your agent status at any time
                for violations of these terms, unethical behavior, or other
                reasons deemed necessary for the platform's integrity.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Liability</h3>
              <p>
                Agents are responsible for their own actions and
                representations. Keja Yangu Kenya is not liable for any disputes
                arising from agent-client relationships.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Changes to Terms
              </h3>
              <p>
                These terms may be updated periodically. Continued use of the
                platform as an agent constitutes acceptance of any changes.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;
