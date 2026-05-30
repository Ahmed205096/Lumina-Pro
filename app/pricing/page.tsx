import Footer from "../components/General/LandingPage/Footer/Footer";
import Navbar from "../components/General/LandingPage/Navbar/Navbar";
import PricingPage from "../components/General/PricingPage/PricingPage";
import AnimatedBackground from "../components/General/LandingPage/AnimatedBackground";

export default function Pricing() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#13131b] text-white">
      <AnimatedBackground />
      <Navbar />
      <PricingPage />
      <Footer />
    </div>
  );
}
