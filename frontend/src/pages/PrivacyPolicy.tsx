import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/auth/register">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 mt-2">Last updated: November 3, 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy for KejaYangu Kenya</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Name, email address, phone number, and password</li>
                <li>Profile information and preferences</li>
                <li>Property search history and saved properties</li>
                <li>Communication data when you contact us</li>
                <li>Payment information for transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>
                  Send you technical notices, updates, and support messages
                </li>
                <li>Respond to your comments, questions, and requests</li>
                <li>
                  Communicate with you about products, services, and promotions
                </li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                3. Information Sharing
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except as
                described in this policy:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>
                  With service providers who assist us in operating our platform
                </li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no
                method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                5. Cookies and Tracking
              </h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your
                experience on our platform. You can control cookie settings
                through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy, unless a longer retention period is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in
                countries other than Kenya. We ensure appropriate safeguards are
                in place for such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 mb-4">
                Our services are not intended for children under 18. We do not
                knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Email: privacy@kejayangukenya.com
                </p>
                <p className="text-gray-700">Phone: +254 700 000 000</p>
                <p className="text-gray-700">Address: Nairobi, Kenya</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
