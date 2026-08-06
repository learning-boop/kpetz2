import Hero from "../components/Hero";
import { TopBar } from "../components/Header";
import Facilities from "../components/Facilities";
import About from "../components/About";
import Services from "../components/Services";
import Doctors from "../components/Doctors";
import Offer from "../components/Offer";
import Products from "../components/Products";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
      >
        Skip to content
      </a>
      <TopBar />
      <main>
        <Hero />
       
        <About />
        <Services />
        <Doctors />
       
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
