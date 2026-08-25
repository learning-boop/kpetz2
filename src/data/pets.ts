/**
 * Species and breeds offered in the booking form.
 *
 * This is the copy the form uses until GET /api/booking-options responds;
 * config/booking.php on the server is the source of truth and rejects a breed
 * that isn't on the list for the chosen species. Change a list there first.
 */

import type { ServiceKind } from "./services";

/**
 * Home visits are for dogs and cats only. Online, the vet can at least advise
 * on other animals before deciding whether they need to come in.
 */
export const SPECIES_BY_KIND: Record<ServiceKind, string[]> = {
  home: ["Dog", "Cat"],
  online: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
};

/**
 * The client's list, in their order. "Mastiff" was written as "Maltiff" in
 * the brief, which is not a breed — change it back here and in
 * config/booking.php if that is what they want.
 */
export const DOG_BREEDS = [
  "Shih Tzu",
  "Poodle",
  "Pomeranian",
  "Labrador",
  "Rottweiler",
  "Golden Retriever",
  "Mastiff",
  "German Shepherd",
  "Indie",
  "Beagle",
  "Any Other",
];

/** Not supplied by the client — a sensible default for Vijayawada. */
export const CAT_BREEDS = [
  "Persian",
  "Indie",
  "Siamese",
  "Himalayan",
  "Maine Coon",
  "British Shorthair",
  "Bengal",
  "Ragdoll",
  "Any Other",
];

export const BREEDS_BY_SPECIES: Record<string, string[]> = {
  Dog: DOG_BREEDS,
  Cat: CAT_BREEDS,
};
