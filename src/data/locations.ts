/**
 * States and cities offered in the booking form.
 *
 * This is the copy the form uses until GET /api/booking-options responds;
 * config/booking.php on the server is the source of truth and validates
 * every booking against the same lists. Change a list there first, then here.
 */

/**
 * Home services travel, and the clinic only covers Vijayawada — so the state
 * and city are fixed rather than chosen.
 */
export const HOME_SERVICE_STATE = "Andhra Pradesh";
export const HOME_SERVICE_CITY = "Vijayawada";

/** Online services can be taken from either state. */
export const ONLINE_SERVICE_STATES = ["Andhra Pradesh", "Telangana"];

export const ANDHRA_PRADESH_CITIES = [
  "Vijayawada",
  "Visakhapatnam",
  "Guntur",
  "Nellore",
  "Kurnool",
  "Rajahmundry",
  "Tirupati",
  "Kakinada",
  "Kadapa",
  "Anantapur",
  "Vizianagaram",
  "Eluru",
  "Ongole",
  "Nandyal",
  "Machilipatnam",
  "Tenali",
  "Chittoor",
  "Bhimavaram",
  "Srikakulam",
  "Amaravati",
  "Narasaraopet",
  "Tadepalligudem",
  "Chirala",
  "Gudivada",
  "Proddatur",
  "Hindupur",
  "Madanapalle",
  "Adoni",
  "Other",
];

export const TELANGANA_CITIES = [
  "Hyderabad",
  "Secunderabad",
  "Warangal",
  "Nizamabad",
  "Karimnagar",
  "Khammam",
  "Ramagundam",
  "Mahbubnagar",
  "Nalgonda",
  "Adilabad",
  "Suryapet",
  "Miryalaguda",
  "Siddipet",
  "Jagtial",
  "Mancherial",
  "Nirmal",
  "Kothagudem",
  "Sangareddy",
  "Medak",
  "Vikarabad",
  "Other",
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ANDHRA_PRADESH_CITIES,
  Telangana: TELANGANA_CITIES,
};
