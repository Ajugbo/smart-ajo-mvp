import Link from 'next/link';
import { Sparkles, Users, Wallet, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Trustworthy contribution circles
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="block text-foreground">Save together.</span>
            <span className="block text-primary">Cash out in turn.</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Smart Ajo helps you run your ajo, esusu, or mutual savings circle with the people you trust. 
            This is not an investment — there is no interest and no profit promise. Everyone contributes 
            the same amount, and you take turns collecting the pot. A small part of each payout is held 
            back as your own security deposit, kept on the platform to guard against default or anyone 
            absconding with the group's money.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              href="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-foreground hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Create Your Circle</h3>
              <p className="text-muted-foreground">
                Set up your contribution circle with your trusted friends, family, or colleagues. 
                You control the amount and the members.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Contribute Monthly</h3>
              <p className="text-muted-foreground">
                Everyone contributes the same amount every month. Payments are secure and tracked 
                automatically through Paystack integration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur p-8 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Take Turns</h3>
              <p className="text-muted-foreground">
                Members take turns collecting the entire pot. A security deposit is held to protect 
                the group and ensure everyone fulfills their commitment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-6 pt-8">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                1
              </div>
              <h4 className="font-semibold text-foreground">Sign Up</h4>
              <p className="text-sm text-muted-foreground">Create your account as a Circle Admin</p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                2
              </div>
              <h4 className="font-semibold text-foreground">Create Circle</h4>
              <p className="text-sm text-muted-foreground">Set contribution amount and invite members</p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                3
              </div>
              <h4 className="font-semibold text-foreground">Members Join</h4>
              <p className="text-sm text-muted-foreground">Share your invite code with trusted people</p>
            </div>

            <div className="space-y-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                4
              </div>
              <h4 className="font-semibold text-foreground">Start Saving</h4>
              <p className="text-sm text-muted-foreground">Contribute monthly and take turns collecting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Smart Ajo — Trustworthy contribution circles for modern savings groups.</p>
        </div>
      </div>
    </div>
  );
}
