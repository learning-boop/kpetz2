import ServicePage from "../ServicePage";

export default function OnlineConsultation() {
  return (
    <ServicePage
      path="/online-vet-consultation"
      seoTitle="Online Vet Consultation | Ask a Vet | K-Petz Hospital"
      seoDescription="Talk to a qualified veterinarian online about your dog or cat. First-aid advice and guidance from K-Petz Hospital, Vijayawada."
      eyebrow="Online consultancy"
      heading="Talk To A Vet Without Leaving Home"
      intro="Describe the problem, send a photo or a short video, and a K-Petz veterinarian will tell you what they think and what to do next. Useful when you're not sure whether something needs a visit."
      bookingService="Online consultancy (first aid)"
      points={[
        "Advice from an M.V.Sc qualified veterinarian, not a call-centre script.",
        "Send photographs or a short video — a clear picture of a wound or a limp tells us far more than a description.",
        "Good for first-aid guidance, diet and general care questions.",
        "Helps you decide whether something needs a visit or can be watched at home.",
        "Available for dogs, cats and small pets.",
        "If we think your pet needs examining, we'll say so and arrange a time.",
      ]}
    >
      <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">
        What online advice can and can't do
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        Advice given remotely is based only on what you describe and share.{" "}
        <strong className="text-ink">
          It is not a substitute for physically examining your animal.
        </strong>{" "}
        A veterinarian can't feel an abdomen, listen to a chest or take a temperature over a phone.
      </p>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        Medicines are dispensed only after a veterinarian has examined your pet. A consultation may
        end with a recommendation to come in, and often that's the honest answer.
      </p>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        <strong className="text-ink">This service is not for emergencies.</strong> If your pet is
        bleeding, collapsed, struggling to breathe or in evident distress, come to the clinic
        immediately or call the nearest emergency veterinary service.
      </p>
    </ServicePage>
  );
}
