# The Curator's Sealed Letter pilot

This original fictional case connects a chapter's cryptographic idea to a decision about evidence. The four published book slips and their combined instruction are unchanged. Visitors can also choose **Start the investigation** without solving the slips or owning the book.

## The playable sequence

1. Read a miniature word-code dispatch and recover its destination.
2. Compare its reading with the delivery copy. Identify the disagreement without assuming its cause.
3. Request a relevant corroborating record instead of a photograph of the accused or a rumour about a handler.
4. Submit a supported finding and keep an unverified transfer on hold. The ending separates the supported destination from unsupported accusations.

The transfer is already on hold when the review begins. The 09:12 inventory note follows its scheduled 09:00 time; the player is not being asked to use a future record. No timer runs. All records, people, and the curator's closing response are explicitly fictional. The register's signature is not treated as independently authenticated.

## First reader trial

Invite a small group, aiming for roughly ten volunteers with varied familiarity with ciphers. This is a proposed trial, not a claim that ten people have tested the case. Do not send invitations automatically.

Give some participants the direct-start link and others the four book slips. Ask them to think aloud or note where they hesitate. Avoid explaining a puzzle until they have had an opportunity to use its own hints. The goal is to discover whether the instructions and ending make sense without the author beside the reader.

After the finding, participants can answer three short questions: where they most needed help, whether they would try another case, and what felt unclear, too easy, or satisfying. **Copy my playtest notes** puts a summary on their clipboard, with a selectable-text fallback. They choose whether and where to share it. Nothing is sent to the museum or stored by an analytics service. Help items are counted for the current page visit; there is no score penalty.

Review the feedback for recurring friction at a stage, mistaken claims the ending failed to correct, and reasons for wanting another case. A wish for another case is useful feedback, not evidence of sales or educational effectiveness. Change repeated problem points before expanding the series.

## Verification

`node tests/test-reader-companion.js` independently solves the visible book clues and dispatch. It exercises both entry routes, wrong and incomplete answers, attempts to skip stages, the corroboration choices, unsupported verdicts, focus movement, restart, answer reveal, and clipboard success/fallback for invitations and playtest notes. User-supplied notes are copied as text, never injected as HTML.

The dispatch was deliberately corrupted during development to verify that the guard fails, then restored. The repository's full `npm test` suite and a browser walkthrough provide additional integration checks. These checks cannot replace observing new human players.
