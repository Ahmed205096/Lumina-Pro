import AboutPage from "../components/General/AboutPage/AboutPage";
import Footer from "../components/General/LandingPage/Footer/Footer";
import Navbar from "../components/General/LandingPage/Navbar/Navbar";
import AnimatedBackground from "../components/General/LandingPage/AnimatedBackground";

export default function About() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#13131b] text-white">
      <AnimatedBackground />
      <Navbar />
      <AboutPage />
      <Footer />
    </div>
  );
}
