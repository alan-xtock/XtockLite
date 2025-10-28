import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Shield, Upload, Eye, Send } from "lucide-react";
import { useMessaging } from "@/hooks/useMessaging";
import TestimonialSection from "@/components/TestimonialSection";

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const { isApproving, handleApprove } = useMessaging();
  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-charcoal leading-tight">
              Less Waste. No Stockouts.{" "}
              <span className="text-growth-green">More Peace of Mind.</span>
            </h1>
            <p className="text-xl text-charcoal/70 leading-relaxed">
              XtockLite predicts tomorrow's inventory needs and sends a ready-to-approve
              purchase order every morning via WhatsApp.
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-growth-green hover:bg-growth-green/90 text-white font-semibold px-8 py-4 text-lg"
              data-testid="button-get-early-access"
            >
              Get Early Access
            </Button>
          </div>
          <div className="bg-light-grey rounded-lg p-6 lg:p-8">
            <div className="bg-growth-green rounded-t-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">WhatsApp Business</span>
              </div>
            </div>
            <div className="bg-white p-4 space-y-3">
              <div className="text-sm text-charcoal/60">Today, 6:00 AM</div>
              <div className="bg-mint-accent rounded-lg p-3 max-w-xs">
                <div className="font-semibold text-charcoal mb-2">Tomorrow's Order</div>
                <div className="text-sm space-y-1 text-charcoal/80">
                  <div>• Tomatoes: 15 lbs</div>
                  <div>• Lettuce: 8 heads</div>
                  <div>• Onions: 12 lbs</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-growth-green hover:bg-growth-green/90 text-white"
                  data-testid="button-whatsapp-approve"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  {isApproving ? 'Sending...' : 'Approve'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-charcoal text-charcoal hover:bg-light-grey"
                  data-testid="button-whatsapp-edit"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Drivers Section */}
      <section className="bg-light-grey px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-growth-green" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Save Money</h3>
              <p className="text-charcoal/70">Reduce overbuying and waste.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-growth-green" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Simple Process</h3>
              <p className="text-charcoal/70">Orders delivered on WhatsApp.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-growth-green" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Stay in Control</h3>
              <p className="text-charcoal/70">Approve or reject in one tap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-4">
            How It Works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-growth-green rounded-full flex items-center justify-center text-white font-bold text-xl">
              1
            </div>
            <div className="mx-auto w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-growth-green" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal">Upload Data</h3>
            <p className="text-charcoal/70">Upload 30 days of sales data.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-growth-green rounded-full flex items-center justify-center text-white font-bold text-xl">
              2
            </div>
            <div className="mx-auto w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-growth-green" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal">Review Order</h3>
            <p className="text-charcoal/70">Receive daily WhatsApp purchase order with items, quantities, totals.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-growth-green rounded-full flex items-center justify-center text-white font-bold text-xl">
              3
            </div>
            <div className="mx-auto w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-growth-green" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal">Send to Supplier</h3>
            <p className="text-charcoal/70">Approve or reject, and send to supplier.</p>
          </div>
        </div>
      </section>

      {/* Why XtockLite Section */}
      <section className="bg-mint-accent px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-charcoal">
                Why XtockLite
              </h2>
              <p className="text-lg text-charcoal/80 leading-relaxed">
                XtockLite was designed by foodservice operators with 20+ years of experience
                running a $9M produce distribution business.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-growth-green rounded-full"></div>
                <span className="text-growth-green font-semibold">Built by operators, for operators</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-charcoal/10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-light-grey rounded-full mx-auto"></div>
                <div className="text-charcoal/60 text-sm">Founder testimonial placeholder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Mid-page CTA Section */}
      <section className="px-4 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-charcoal mb-6">
          Ready to stop guessing and start saving?
        </h2>
        <Button
          onClick={onGetStarted}
          size="lg"
          className="bg-growth-green hover:bg-growth-green/90 text-white font-semibold px-8 py-4 text-lg"
          data-testid="button-get-early-access-mid"
        >
          Get Early Access Today
        </Button>
      </section>

      {/* Final CTA Section */}
      <section className="bg-growth-green px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Simplify daily ordering. Protect your margins.
          </h2>
          <p className="text-xl text-white/90">
            Join the pilot program and start using XtockLite.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-growth-green hover:bg-white/90 font-semibold px-8 py-4 text-lg"
            data-testid="button-join-pilot"
          >
            Join the Pilot
          </Button>
        </div>
      </section>
    </div>
  );
}