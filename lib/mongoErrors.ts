/**
 * Eroarea de cheie duplicată din MongoDB (E11000).
 *
 * De când `users.email` are index unique, cursele TOCTOU (două cereri concurente
 * trec amândouă de `findOne`, apoi scriu amândouă) nu mai pot produce conturi
 * duble — a doua scriere pică aici. Indexul e plasa de siguranță; verificările
 * de dinainte rămân, fiindcă ele dau mesajul frumos în cazul normal.
 *
 * Fără tratare, eroarea ar cădea în `catch`-ul generic și ar ieși ca 500
 * „Ceva nu a mers bine" — exact în momentul în care userul are nevoie să afle
 * că emailul e deja luat.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === 11000
  );
}
