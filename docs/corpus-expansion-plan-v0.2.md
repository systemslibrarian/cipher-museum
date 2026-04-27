# Multilingual, Noisy, and Homophonic Synthetic Corpus Expansion Plan

## Multilingual Records (Public Domain Sources)
- Spanish: Project Gutenberg, e.g., Don Quijote (es), El Principito (es)
- French: Project Gutenberg, e.g., Le Petit Prince (fr), Les Misérables (fr)
- German: Project Gutenberg, e.g., Faust (de), Die Verwandlung (de)
- Latin: Project Gutenberg, e.g., De Bello Gallico (la), Vulgate Bible (la)

## Noisy Transcription Records
- Simulate OCR errors: 1 for I, 0 for O, 3 for E, missing spaces, swapped letters, random punctuation
- Document noise model in each record

## Homophonic Substitution Records
- Use classic homophonic schemes (e.g., Beale, 2-3 symbols per letter)
- Document mapping in key field

## Provenance
- All plaintexts sourced from Project Gutenberg or public domain archives
- All records will include full provenance in `source_provenance`

## Next Steps
1. Draft 3+ records per language (es, fr, de, la)
2. Draft 8+ noisy records
3. Draft 5+ homophonic records
4. Validate all against schema
5. Update corpus files and counts
