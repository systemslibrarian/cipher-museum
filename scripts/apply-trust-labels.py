#!/usr/bin/env python3
"""
Apply trust labels to every cipher exhibit page.

Inserts a <div class="trust-label trust-label--X"> after the <h1 class="page-title">
on each ciphers/*.html page. Idempotent: re-running replaces an existing block.

Categorization:
  - Explicit overrides per Sprint 1 prompt take precedence.
  - Otherwise classify from the page's existing `sec-broken|sec-weak|sec-secure` badge.
  - Pages with no security badge (biographies, places, unsolved mysteries,
    reference works) fall back to "historical" — the most honest label
    when modern security status is N/A or unknown.
"""
from __future__ import annotations
import re
from pathlib import Path

CIPHERS = Path(__file__).resolve().parent.parent / "ciphers"

# Explicit overrides (from sprint prompt). Slugs without ".html".
OVERRIDES: dict[str, str] = {
    # Historical Only — primitive ciphers preserved for pedagogy
    "scytale": "historical",
    "caesar": "historical",
    "polybius": "historical",
    "pigpen": "historical",
    "freemason-pigpen": "historical",
    "bacon": "historical",
    "tap-code": "historical",
    "atbash": "historical",
    "rot13": "historical",
    "morse": "historical",
    # Secure (Modern) — still secure when used correctly
    "one-time-pad": "secure",
    "vernam": "secure",
    "navajo-code-talkers": "secure",
    "aes": "secure",
    "rsa": "secure",
    "sha256": "secure",
    "diffie-hellman": "secure",
    # Broken — explicit per prompt
    "vigenere": "broken",
    "beaufort": "broken",
    "porta": "broken",
    "gronsfeld": "broken",
    "running-key": "broken",
    "monoalphabetic": "broken",
    "homophonic": "broken",
    "playfair": "broken",
    "hill": "broken",
    "rail-fence": "broken",
    "columnar": "broken",
    "double-transposition": "broken",
    "bifid": "broken",
    "trifid": "broken",
    "fractionated-morse": "broken",
    "nihilist": "broken",
    "adfgx": "broken",
    "adfgvx": "broken",
    "bazeries": "broken",
    "vic": "broken",
    "alberti-disk": "broken",
    "jefferson-disk": "broken",
    "enigma": "broken",
    "lorenz": "broken",
    "stager": "broken",
    "confederate-vigenere": "broken",
    "dictionary-code": "broken",
    "zodiac": "broken",
}

LABEL_TEXT = {
    "broken":      "Broken",
    "historical":  "Historical Only",
    "educational": "Educational",
    "secure":      "Secure (Modern)",
}
LABEL_TITLE = {
    "broken":      "Cryptographically broken — historically important but unsafe to use today.",
    "historical":  "Historical interest only — never used for serious modern security.",
    "educational": "Useful for teaching cryptographic concepts but not for real security.",
    "secure":      "Still considered secure when used correctly with modern key handling.",
}
# Inline SVGs (currentColor so they inherit modifier color). 14x14 viewBox 24x24.
ICONS = {
    "broken":      '<svg class="trust-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>',
    "historical":  '<svg class="trust-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h11v12a2 2 0 0 0 2 2H6a3 3 0 0 1-3-3V7z"/><path d="M16 5a2 2 0 0 1 2 2v8h3a0 0 0 0 1 0 0v2a2 2 0 0 1-2 2"/></svg>',
    "educational": '<svg class="trust-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>',
    "secure":      '<svg class="trust-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
}

H1_RE = re.compile(r'(<h1\s+class="page-title"[^>]*>.*?</h1>)', re.IGNORECASE | re.DOTALL)
# Match any prior trust-label block for idempotency.
TRUST_BLOCK_RE = re.compile(
    r'\s*<div class="trust-label-wrap">.*?</div>\s*(?=<)',
    re.DOTALL,
)


def classify_page(slug: str, html: str) -> str:
    if slug in OVERRIDES:
        return OVERRIDES[slug]
    if "sec-secure" in html:
        return "secure"
    if "sec-broken" in html or "sec-weak" in html:
        return "broken"
    return "historical"


def build_label_html(category: str) -> str:
    text = LABEL_TEXT[category]
    title = LABEL_TITLE[category]
    icon = ICONS[category]
    return (
        '\n  <div class="trust-label-wrap">'
        f'<a class="trust-label trust-label--{category}" '
        f'href="../museum-map.html#trust-labels" '
        f'title="{title}" '
        f'aria-label="Trust label: {text}. {title}">'
        f'{icon}<span class="trust-label__text">{text}</span>'
        '</a></div>'
    )


def process(path: Path) -> str | None:
    html = path.read_text(encoding="utf-8")
    slug = path.stem
    category = classify_page(slug, html)
    label_block = build_label_html(category)

    # Strip prior trust-label-wrap if present (idempotent re-runs).
    html = TRUST_BLOCK_RE.sub("", html)

    new_html, n = H1_RE.subn(lambda m: m.group(1) + label_block, html, count=1)
    if n == 0:
        return None  # No <h1 class="page-title"> found
    if new_html != html or True:
        path.write_text(new_html, encoding="utf-8")
    return category


def main() -> None:
    counts: dict[str, int] = {}
    skipped: list[str] = []
    for path in sorted(CIPHERS.glob("*.html")):
        category = process(path)
        if category is None:
            skipped.append(path.name)
            continue
        counts[category] = counts.get(category, 0) + 1
    total = sum(counts.values())
    print(f"Applied trust labels to {total} cipher pages.")
    for cat in ("broken", "historical", "educational", "secure"):
        print(f"  {cat:11s} {counts.get(cat, 0)}")
    if skipped:
        print("Skipped (no <h1 class=\"page-title\"> found):")
        for name in skipped:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
