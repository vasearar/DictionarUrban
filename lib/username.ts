import { diacriticInsensitivePattern } from "@/lib/search";

// Regulile de poreclă, într-un singur loc. Trăiau duplicate în `verifyUsername`
// (client) și în ruta de register (server), iar PATCH /api/username nu le aplica
// deloc — se putea seta orice prin apel direct la API.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 28;

const USERNAME_CHARSET = /^[a-zA-Z0-9_ăîșțâĂÎȘȚÂ]+$/;

/** Întoarce mesajul de eroare (ro, gata de afișat) sau `null` dacă e validă. */
export function validateUsername(username: unknown): string | null {
  if (typeof username !== "string") {
    return "Porecla este obligatorie";
  }
  const name = username.trim();
  if (name.length < USERNAME_MIN || name.length > USERNAME_MAX) {
    return `Porecla trebuie să fie între ${USERNAME_MIN} și ${USERNAME_MAX} de simboluri`;
  }
  if (!USERNAME_CHARSET.test(name)) {
    return "Porecla nu trebuie să conțină simboluri speciale";
  }
  return null;
}

/**
 * Filtru Mongo pentru „aceeași poreclă", cu semantica lookup-ului de profil:
 * ancorat, insensibil la majuscule ȘI la diacritice (vezi lib/profile.ts).
 *
 * Unicitatea TREBUIE verificată cu aceleași reguli cu care se rezolvă profilul.
 * Altfel „Mihaita" și „Mihăiță" ar fi două conturi distincte care rezolvă la un
 * singur profil — adică exact vectorul de impersonare pe care îl închidem.
 */
export function sameUsernameQuery(username: string) {
  return { $regex: `^${diacriticInsensitivePattern(username.trim())}$`, $options: "i" };
}
