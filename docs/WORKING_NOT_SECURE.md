# "Working is not secure" route

Added 3 November 2026, as section 6 of the 2 November ebook review. It has two parts:
- **The page:** `lab/working-is-not-secure.html`, a short original introduction with a worked example.
- **The tour:** `tours/working-not-secure.json`, which links existing exhibits.

Crypto Lab's Hidden Bit supplies the executable security game, so no new RSA, one-time-pad or Vigenère lab was added.

## Section 6 acceptance points

| Requirement | Implementation | Named tests in `tests/test-working-not-secure.js` |
| --- | --- | --- |
| Distinguish correctness, performance and the security claim | "Three different questions": a failure of correctness is a bug, and speed is never evidence of security | correctness, performance and security distinguished |
| State the adversary's information, the claimed property, a functional test and a separate security test | The worked example answers each of the four questions in its own element | the four questions are answered separately |
| End with an example where encryption and decryption succeed but the security claim fails | A substitution cipher on an original message passes a real round-trip test. A real ciphertext-only attack, which ranks cipher letters by frequency with no key search, then recovers 42% of letters against about 4% by chance. The claim is refuted when recovery exceeds five times chance. Text with flat frequencies is not refuted, so the verdict follows the measurement. | functional test passes; functional test fails when decryption is wrong; security test refutes the claim on the worked example; security verdict follows the measurement, not the label; a passing functional test does not imply a passing security test; rendered functional and security results come from the model |
| Connect a failed hypothesis to a useful result | Flannery's account of including a detailed report on the attack on her algorithm, and treating the negative result as progress | failed hypothesis connected to a useful result |
| Do not claim to implement the Cayley–Purser attack | Stated on the page | does not claim to implement the Cayley–Purser attack |
| No old key-size guidance and no "unbreakable" claims | Stated on the page and guarded | no old key-size guidance or unbreakable claims |
| A large key space as only an upper-bound argument | "A large key space bounds only exhaustive key search" | key space described as bounding only exhaustive search |

## The tour

Eight stops: the worked example, then:
- Monoalphabetic Substitution;
- One-Time Pad;
- Enigma;
- Entropy;
- Security reductions;
- Modern Attack Evidence;
- back to the verdict (`#verdict`).

Each stop's note repeats a claim its page makes. Test "each stop note carries a claim its page makes" checks both sides.

## Sources and what was checked

Books were read from the user's copies and, by the owner's preference, are cited by title, publisher and year only; none is linked. The page paraphrases throughout.

| Source | Used for | Checked |
| --- | --- | --- |
| Sarah Flannery with David Flannery, *In Code* (Profile Books, 2000) | The Young Scientist win; the attack and the security problem it exposed; the detailed report on the attack in her later project; negative results as part of progress; the book does not give the technical attack | The text was read directly. The review's suggestion that the algorithm was faster than RSA was **not** found in this text, so the page makes no speed claim. |
| Friedrich L. Bauer, *Decrypted Secrets*, 4th edition (Springer, 2007) | Do not underrate the adversary; inventors' overconfidence; human error | Read directly. Bauer is **not** cited for the key-space argument: his maxims do not make it in those terms. |
| Fred Piper and Sean Murphy, *Cryptography: A Very Short Introduction* (Oxford University Press, 2002) | Practical systems are breakable in principle; exhaustive key search as the worst case | Read directly. |

## Verification

- **Tests first.** The suite was written from the sources before the page and model existed. It has 21 named tests; a final check fails if any of the 6 required paths did not run.
- **Mutations.** Eight, each failed:
  - the functional test ignores the decryption key;
  - the security verdict is fixed;
  - the attack ignores frequencies;
  - recovery is miscounted;
  - the threshold is set at chance;
  - the rendered share does not come from the model;
  - the key space is miscounted;
  - a stop note drops its page's claim.
- **Navigation.** The navigation audit now covers seven tours and 70 stops.
