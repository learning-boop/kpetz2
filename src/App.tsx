import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BookingProvider } from "./components/BookingProvider";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BookingProvider>
    </BrowserRouter>
  );
}