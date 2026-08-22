import ServicePage from "../ServicePage";

export default function VaccinationAtHome() {
  return (
    <ServicePage
      path="/pet-vaccination-at-home"
      seoTitle="Dog & Cat Vaccination at Home in Vijayawada | K-Petz"
      seoDescription="Vaccination for dogs and cats at your home in Vijayawada, given by a qualified vet. K-Petz Hospital, Poranki — call 80198 88877."
      eyebrow="Vaccination at home"
      heading="Dog And Cat Vaccination At Your Home"
      intro="Core vaccinations and boosters for dogs and cats, given at your home in Vijayawada by an M.V.Sc qualified veterinarian. No car journey, no waiting room, no stressed animal."
      bookingService="Vaccination at home"
      points={[
        "Core vaccinations and boosters for dogs and cats.",
        "Given by a qualified veterinarian, not an assistant.",
        "Your pet stays in familiar surroundings, which makes the whole thing calmer.",
        "Particularly worth it for cats, who often find the carrier more distressing than the injection.",
        "We check your pet's general condition at the same visit.",
        "Bring out any previous vaccination record you have — it helps us pick the right schedule.",
      ]}
    >
      <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">
        Before we come
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        Tell us your pet's age, breed and whether they've been vaccinated before, and when. If you
        have a vaccination card or a note from another clinic, have it to hand. A pet that is
        already unwell should be examined before being vaccinated, so mention anything you've
        noticed.
      </p>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        Puppies and kittens need a course rather than a single injection. We'll explain the
        schedule and when the next one is due.
      </p>
    </ServicePage>
  );
}
