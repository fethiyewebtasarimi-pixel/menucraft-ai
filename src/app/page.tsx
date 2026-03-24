import Header from "@/components/marketing/Header"
import Footer from "@/components/marketing/Footer"
import Hero from "@/components/marketing/Hero"
import HowItWorks from "@/components/marketing/HowItWorks"
import Features from "@/components/marketing/Features"
import Pricing from "@/components/marketing/Pricing"
import Testimonials from "@/components/marketing/Testimonials"
import FAQ from "@/components/marketing/FAQ"
import CTA from "@/components/marketing/CTA"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
