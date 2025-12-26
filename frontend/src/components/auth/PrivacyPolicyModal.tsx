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

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Learn how we collect, use, and protect your personal information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">
                1. Information We Collect
              </h3>
              <p>
                We collect information you provide directly to us, such as when
                you create an account, submit an agent application, or contact
                us for support. This includes:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Name and contact information</li>
                <li>Real estate license details</li>
                <li>Professional experience and qualifications</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                2. How We Use Your Information
              </h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Process your agent application</li>
                <li>Verify your credentials and qualifications</li>
                <li>Provide customer support</li>
                <li>Send important updates and notifications</li>
                <li>Improve our services and platform</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                3. Information Sharing
              </h3>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except in the following
                circumstances:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist our operations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Data Retention
              </h3>
              <p>
                We retain your personal information for as long as necessary to
                provide our services, comply with legal obligations, resolve
                disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Cookies and Tracking
              </h3>
              <p>
                We use cookies and similar technologies to enhance your
                experience, analyze usage, and provide personalized content. You
                can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                8. Changes to This Policy
              </h3>
              <p>
                We may update this privacy policy periodically. We will notify
                you of any material changes by posting the new policy on this
                page and updating the effective date.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Contact Us</h3>
              <p>
                If you have questions about this privacy policy or our data
                practices, please contact us at privacy@kejayangukenya.com.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
