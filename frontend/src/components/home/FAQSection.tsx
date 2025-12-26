import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question:
        "How do I verify that a property listing is authentic and up-to-date?",
      answer:
        "All properties on KejaYangu undergo a rigorous verification process. Our team personally inspects each listing, verifies ownership documents, and ensures all information is current. We also use advanced technology to detect and remove duplicate or fraudulent listings. Additionally, you can contact our support team to request additional verification for any property you're interested in.",
    },
    {
      question:
        "What are the typical fees and commissions when buying or renting through KejaYangu?",
      answer:
        "KejaYangu operates on a transparent fee structure. For buyers, there are no platform fees - you only pay standard legal and transfer costs. For renters, we charge a one-time service fee equivalent to one month's rent. Sellers pay a competitive commission of 2-3% depending on the property value. All fees are clearly displayed before any transaction, with no hidden charges.",
    },
    {
      question:
        "How can I schedule property viewings and what safety measures are in place?",
      answer:
        "You can schedule viewings directly through our platform by clicking the 'Schedule Viewing' button on any property listing. We offer both in-person and virtual tours. For safety, all our agents are verified and background-checked. We also provide a secure meeting system with real-time location sharing and emergency contacts. Virtual tours are available 24/7, while in-person viewings are scheduled during business hours with advance notice.",
    },
    {
      question:
        "What financing options and mortgage assistance do you provide?",
      answer:
        "KejaYangu partners with leading Kenyan banks and financial institutions to offer competitive mortgage rates starting from 12.5% APR. We provide a mortgage calculator tool, pre-approval assistance, and dedicated mortgage advisors. Our platform also supports various financing options including developer financing, rent-to-own schemes, and government housing programs like Boma Yangu. We'll guide you through the entire application process.",
    },
    {
      question:
        "How do you handle property disputes and what's your refund policy?",
      answer:
        "We have a comprehensive dispute resolution system. If there's a discrepancy between listing details and actual property conditions, we offer a 7-day satisfaction guarantee with full refund of any fees paid. For legal disputes, we provide access to our network of real estate lawyers and mediation services. All transactions are protected by our escrow service, and we maintain detailed records of all communications and agreements for transparency.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-4">
            Got Questions? We've Got Answers
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find answers to the most common questions about buying, selling, and
            renting properties through KejaYangu
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className={`border-0 transition-all duration-300 ${
                openIndex === index
                  ? "bg-card shadow-[var(--shadow-elegant)]"
                  : "bg-card/50 backdrop-blur-sm hover:bg-card/70"
              }`}
            >
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className={`w-full h-auto p-6 text-left justify-between hover:bg-transparent ${
                    openIndex === index
                      ? "text-primary"
                      : "text-card-foreground"
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {openIndex === index && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-border/50 pt-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Help CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground text-lg mb-8">
              Our customer support team is here to help you with any specific
              questions about properties, transactions, or our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="px-8 py-3 bg-primary hover:bg-primary/90 transition-colors">
                Contact Support
              </Button>
              <Button variant="outline" className="px-8 py-3">
                Live Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Help Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Help Center</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and tutorials
              </p>
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80"
              >
                Browse Articles →
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="font-semibold mb-2">Video Tutorials</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Step-by-step video guides
              </p>
              <Button
                variant="ghost"
                className="text-secondary hover:text-secondary/80"
              >
                Watch Videos →
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-success" />
              </div>
              <h4 className="font-semibold mb-2">Community Forum</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with other users
              </p>
              <Button
                variant="ghost"
                className="text-success hover:text-success/80"
              >
                Join Discussion →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
