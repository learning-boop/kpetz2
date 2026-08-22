import ServicePage from "../ServicePage";

export default function SecondOpinion() {
  return (
    <ServicePage
      path="/vet-second-opinion"
      seoTitle="Veterinary Second Opinion Online | K-Petz Hospital"
      seoDescription="A second veterinary opinion on your pet's diagnosis or treatment plan. Share reports and scans with K-Petz Hospital, Vijayawada."
      eyebrow="Second opinion"
      heading="A Second Opinion On Your Pet's Diagnosis"
      intro="If you've been given a diagnosis or a treatment plan and you're uncertain, a K-Petz veterinarian will review what you have and tell you what they think. Asking is reasonable, and no good vet minds."
      bookingService="Second opinion"
      points={[
        "Share existing reports, X-rays, scan images or prescriptions.",
        "Reviewed by an M.V.Sc qualified veterinarian.",
        "Particularly worth doing before agreeing to surgery or a long course of treatment.",
        "You'll get a clear view of whether the plan looks sound, and what else might be considered.",
        "We'll tell you if we agree with the original assessment — a second opinion is not an automatic disagreement.",
        "If we'd want to examine your pet ourselves before advising, we'll say so.",
      ]}
    >
      <h2 className="mt-12 font-display text-[24px] font-extrabold text-ink">
        What to send
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
        The more we have, the more useful the answer. Photographs of reports, X-ray or scan images,
        the prescription, and a note of what's been tried so far and how your pet responded.
      </p>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
        A second opinion is based on the material you provide and does not replace a physical
        examination. If something matters enough to be uncertain about, it usually matters enough
        to be examined.
      </p>
    </ServicePage>
  );
}
