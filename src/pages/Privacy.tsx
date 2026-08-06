import PolicyPage from "./PolicyPage";

export default function Privacy() {
  return (
    <PolicyPage title="Privacy Policy" updated="August 2026">
      <p>
        This policy explains what K-Petz Hospital collects when you use this website, why, and
        what you can ask us to do about it. It is written to reflect the Digital Personal Data
        Protection Act, 2023.
      </p>

      <h2>What we collect</h2>
      <p>When you book an appointment, we collect:</p>
      <ul>
        <li>Your name, phone number, email address, and the city and state you are in</li>
        <li>
          Details about your animal — name, species, breed, age, sex, weight, vaccination history
          and the problem you describe
        </li>
        <li>Any photographs or video you choose to upload</li>
        <li>The service, veterinarian and time slot you request</li>
      </ul>
      <p>
        If you pay online, the payment is handled by our payment provider. Card and UPI details
        are entered on their systems and <strong>we never see or store them</strong>. We keep only
        a reference to the transaction.
      </p>

      <h2>Why we collect it</h2>
      <ul>
        <li>To arrange and carry out the appointment you asked for</li>
        <li>To contact you about that appointment, usually by phone or WhatsApp</li>
        <li>To keep a clinical record of your animal's treatment</li>
        <li>To meet record-keeping obligations that apply to veterinary practice</li>
      </ul>
      <p>
        <strong>We do not sell your information, and we do not share it for advertising.</strong>
      </p>

      <h2>Who can see it</h2>
      <p>
        Access is limited to K-Petz veterinarians and staff who need it to do their work. We share
        information outside the clinic only where it is necessary to provide the service — for
        example an external laboratory — or where the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Clinical records are kept for as long as needed for your animal's ongoing care and to meet
        professional record-keeping requirements. Booking records not linked to treatment are kept
        for a shorter period and then deleted.
      </p>

      <h2>Your rights</h2>
      <p>Under the DPDP Act you may ask us to:</p>
      <ul>
        <li>tell you what information we hold about you</li>
        <li>correct anything inaccurate or incomplete</li>
        <li>erase information we no longer need</li>
        <li>withdraw consent you previously gave</li>
      </ul>
      <p>
        Write to <a href="mailto:kpetzhospital@gmail.com">kpetzhospital@gmail.com</a> and we will
        respond. Note that withdrawing consent may mean we can no longer provide a service, and
        that some clinical records must be retained even after a request to erase.
      </p>

      <h2>Security</h2>
      <p>
        Information is held on access-controlled systems and transmitted over encrypted
        connections. Uploaded files are stored so that they are not publicly reachable. No system
        is perfectly secure, but we take reasonable steps to protect what you give us.
      </p>

      <h2>Children</h2>
      <p>
        This site is intended for adults. We do not knowingly collect information from anyone
        under 18.
      </p>

      <h2>Cookies</h2>
      <p>
        This website uses only what is needed to make it work. We do not use advertising or
        tracking cookies.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. The date at the top shows when it last changed.
      </p>
    </PolicyPage>
  );
}
