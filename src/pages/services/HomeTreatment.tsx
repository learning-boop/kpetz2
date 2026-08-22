import ServicePage from "../ServicePage";

export default function HomeTreatment() {
  return (
    <ServicePage
      path="/pet-home-treatment"
      seoTitle="Pet Home Treatment in Vijayawada | K-Petz Hospital"
      seoDescription="Treatment for dogs and cats at your home in Vijayawada — deworming, injections, dressings and follow-up care. K-Petz Hospital, Poranki."
      eyebrow="Home treatment"
      heading="Treatment For Your Pet, At Home"
      intro="Deworming, injections, dressings and follow-up care carried out at your home in Vijayawada. For animals that are recovering, elderly, or simply better off not travelling."
      bookingService="Home treatment"
      points={[
        "Routine deworming for dogs and cats.",
        "Injections and medication administered by a veterinarian.",
        "Wound dressing and post-operative follow-up.",
        "Check-ups for elderly animals who find the journey difficult.",
        "Care for pets recovering from a procedure carried out at the hospital.",
        "If the problem turns out to need diagnostics, we'll arrange a hospital visit rather than guess.",
      ]}
    >
      <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">
        When the hospital is the better answer
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        Home treatment works well for known conditions and ongoing care. A new problem that hasn't
        been diagnosed usually needs the equipment at Poranki — X-ray, ultrasound scanning and our
        own laboratory — before anyone can treat it properly.
      </p>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        We'd rather tell you that than treat something we haven't seen clearly.
      </p>
    </ServicePage>
  );
}
