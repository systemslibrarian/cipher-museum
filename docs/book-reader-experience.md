# Book reader experience · 2 November 2026

Readers can now find all twenty chapter invitations on `the-book.html#chapter-visits`, grouped into the book’s three parts. Each entry gives a specific action or evidence question from the current manuscript, with an existing exhibit destination. Chapters 1, 3, 14 and 17 also link directly to the corresponding optional fictional slip. No new historical claim or source interpretation is introduced.

The book page keeps the approved cover, forthcoming status and exact promise:

> Discover how people learned to read other people’s secrets—and what happened when they did. Then enter Cipher Museum and try the ideas yourself.

The image count now agrees with the manuscript: eight original diagrams and six documentary images. The historical narrative remains complete without the companion.

## Four-slip notebook

On `sealed-letter.html#notebook`, readers can enter the four answers as they reach them. Saving is a separate choice. The notebook uses this browser’s local storage; it makes no network requests. Reload restores only a validated four-string record, and clearing removes only the notebook’s own key. Blocked storage does not prevent using the clues or joining the answers.

“Join my four answers” fills the existing instruction field and leaves the final check to its button. It does not award a solved state or bypass the fictional investigation. The direct “Start the investigation” route remains available. Slip links open the chosen slip without opening its hint or answer reveal.

## Validation

- `tests/test-book-trail.js`: twenty real destinations and fragments; four correct chapter stops; deep links; explicit saving, restoration and clearing; malformed/blocked storage; untrusted text kept as text; complete notebook-to-instruction-checker journey.
- Existing reader-companion tests: clue solutions, dispatch, stage guards, source choice, finding, restart and clipboard fallbacks.
- Full repository suite, HTML lint, release metadata and generated-cache checks. The first full local run caught a cache version made stale by the concurrent CSS review; rebuilding and rerunning that check resolved it.
- Browser review of both revised pages at a 390 CSS pixel frame width, including opening the directory, saved-answer reload, joining and opening the case, and clearing. A cream-panel contrast issue found during review was corrected. The notebook’s content viewport and document width both measured 375 pixels, with no horizontal overflow.

The related book revision puts the approved promise on the Word/PDF and EPUB title pages, labels museum invitations optional, adds a chapter-directory link and gives each printed slip an answer space, next-stop guidance and its own hint link. Book editions are maintained separately from this site repository.
