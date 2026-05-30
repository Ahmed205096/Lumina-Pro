import Navbar from "./components/General/LandingPage/Navbar/Navbar";
import Hero from "./components/General/LandingPage/Hero/Hero";
import EngineeredSection from "./components/General/LandingPage/Sections/EngineeredSection";
import ReadySection from "./components/General/LandingPage/Sections/ReadySection";
import Footer from "./components/General/LandingPage/Footer/Footer";
import AnimatedBackground from "./components/General/LandingPage/AnimatedBackground";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#13131b] text-white">
      <AnimatedBackground />
      <Navbar />
      <main className="relative flex flex-1 flex-col">
        <Hero />
        <EngineeredSection />
        <ReadySection />
        <Footer />
      </main>
    </div>
  );
}
