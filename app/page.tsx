import HeroSection from "@/components/home/HeroSection";
import FeatureGrid from "@/components/home/FeatureGrid";
import HowItWorks from "@/components/home/HowItWorks";
import ClosingCTA from "@/components/home/ClosingCTA";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <ClosingCTA />
      <section className="pb-12 pt-2">
        <div className="max-w-6xl mx-auto px-6">
          <MedicalDisclaimer />
        </div>
      </section>
    </>
  );
}