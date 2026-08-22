import ServicePage from "../ServicePage";

export default function HomeVisit() {
  return (
    <ServicePage
      path="/vet-home-visit"
      seoTitle="Vet Home Visit in Vijayawada | K-Petz Hospital"
      seoDescription="A veterinarian visits your home in Vijayawada for treatment, vaccination and routine care. Call K-Petz Hospital, Poranki on 80198 88877."
      eyebrow="Home visit"
      heading="A Vet Who Comes To Your Home"
      intro="Some animals travel badly. Some owners can't. A K-Petz veterinarian can come to you in Vijayawada for treatment, vaccination and routine care, so your pet is seen where they feel safe."
      bookingService="Home visit"
      points={[
        "A qualified veterinarian attends at your home, at a time arranged with you.",
        "Suitable for routine treatment, vaccination, deworming and follow-up care.",
        "Better for nervous animals, elderly pets, and cats that find the carrier distressing.",
        "Useful when you have several pets and bringing them all in is impractical.",
        "If your pet needs X-ray, scanning or surgery, we'll tell you honestly and arrange a visit to the hospital instead.",
        "Available in Vijayawada. Call to check we cover your area before booking.",
      ]}
    >
      <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">
        What a home visit cannot do
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        A home visit is for routine and follow-up care. Anything needing X-ray, ultrasound
        scanning, laboratory work or an operating theatre has to happen at the hospital, where the
        equipment is. If we arrive and find your pet needs more than we can do at your house, we'll
        say so.
      </p>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        <strong className="text-ink">This service is not for emergencies.</strong> If your pet is
        bleeding, collapsed, struggling to breathe or in evident distress, don't wait for an
        appointment — call us and come straight to the clinic.
      </p>
    </ServicePage>
  );
}
