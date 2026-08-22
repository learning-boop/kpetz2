import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SettingsProvider } from "./components/SettingsProvider";
import { BookingProvider } from "./components/BookingProvider";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import HomeVisit from "./pages/services/HomeVisit";
import VaccinationAtHome from "./pages/services/VaccinationAtHome";
import HomeTreatment from "./pages/services/HomeTreatment";
import OnlineConsultation from "./pages/services/OnlineConsultation";
import SecondOpinion from "./pages/services/SecondOpinion";

export default function App() {
  return (
    <BrowserRouter>
      {/* Settings sit outside BookingProvider, so the booking form can read
          them later if it needs to. */}
      <SettingsProvider>
        <BookingProvider>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/vet-home-visit" element={<HomeVisit />} />
            <Route path="/pet-vaccination-at-home" element={<VaccinationAtHome />} />
            <Route path="/pet-home-treatment" element={<HomeTreatment />} />
            <Route path="/online-vet-consultation" element={<OnlineConsultation />} />
            <Route path="/vet-second-opinion" element={<SecondOpinion />} />

            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refunds" element={<Refunds />} />
            <Route path="/contact-us" element={<Contact />} />

            {/* Unknown paths fall back to the site rather than a blank screen. */}
            <Route path="*" element={<Home />} />
          </Routes>

          {/* Outside Routes, so it stays put on every page. */}
          <WhatsAppButton />
        </BookingProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}