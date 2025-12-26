import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const TermsAndConditions = () => {
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
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Terms and Conditions
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Last updated: November 3, 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions for KejaYangu Kenya</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using KejaYangu Kenya ("the Platform"), you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the materials
                (information or software) on KejaYangu Kenya's platform for
                personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title, and under this
                license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>modify or copy the materials</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display (commercial or non-commercial)
                </li>
                <li>
                  attempt to decompile or reverse engineer any software
                  contained on the platform
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information
                that is accurate, complete, and current at all times. You are
                responsible for safeguarding the password and for all activities
                that occur under your account.
              </p>
              <p className="text-gray-700 mb-4">
                You agree not to disclose your password to any third party. You
                must notify us immediately upon becoming aware of any breach of
                security or unauthorized use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                4. Property Listings
              </h2>
              <p className="text-gray-700 mb-4">
                KejaYangu Kenya acts as a platform connecting property owners,
                agents, and buyers/renters. We do not guarantee the accuracy of
                property listings or the legitimacy of transactions conducted
                through our platform.
              </p>
              <p className="text-gray-700 mb-4">
                Users are responsible for verifying all information regarding
                properties and conducting due diligence before entering into any
                agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You may not use our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>
                  For any unlawful purpose or to solicit others to perform
                  unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the
                service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                In no event shall KejaYangu Kenya, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of the
                Republic of Kenya. Our failure to enforce any right or provision
                of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                9. Changes to Terms
              </h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will try to provide at least 30 days notice prior to any new
                terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                10. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: legal@kejayangukenya.com</p>
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

export default TermsAndConditions;
