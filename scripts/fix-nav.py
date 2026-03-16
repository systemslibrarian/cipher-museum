#!/usr/bin/env python3
"""
Fix nav.js inclusion and standardize nav links across all HTML pages.
Items 1 & 2 of the final polish pass.
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Canonical nav links — order matters
LINKS = [
    ("index.html",       "Entrance"),
    ("museum-map.html",  "Museum Map"),
    ("halls/ancient.html","Halls"),
    ("timeline.html",    "Timeline"),
    ("challenges.html",  "Challenges"),
    ("cryptanalysis.html","Cryptanalysis Lab"),
    ("modern.html",      "Modern Crypto"),
    ("glossary.html",    "Glossary"),
    ("https://github.com/systemslibrarian/cipher-museum", "GitHub ↗"),
]

# Map filenames to which link should be active
ACTIVE_MAP = {
    "index.html":        "Entrance",
    "museum-map.html":   "Museum Map",
    "timeline.html":     "Timeline",
    "challenges.html":   "Challenges",
    "cryptanalysis.html":"Cryptanalysis Lab",
    "modern.html":       "Modern Crypto",
    "glossary.html":     "Glossary",
}
# All halls pages get "Halls" active
# Ciphers pages get no active (or could get none)
# 404 gets no active


def build_nav_ul(prefix, active_label):
    """Build the canonical <ul class="nav-links">...</ul> block."""
    lines = ['      <ul class="nav-links">']
    for href, label in LINKS:
        if href.startswith("http"):
            full = href
            extra = ' target="_blank" rel="noopener noreferrer"'
        else:
            full = prefix + href
            extra = ""
        cls = ' class="active"' if label == active_label else ""
        lines.append(f'        <li><a href="{full}"{cls}{extra}>{label}</a></li>')
    lines.append('      </ul>')
    return "\n".join(lines)


def get_active_label(filepath):
    """Determine which nav link should be active for this file."""
    basename = os.path.basename(filepath)
    rel = os.path.relpath(filepath, ROOT)
    
    if rel.startswith("halls/"):
        return "Halls"
    if rel.startswith("ciphers/"):
        return None  # no active link for individual cipher pages
    return ACTIVE_MAP.get(basename)


def get_prefix(filepath):
    """Get the relative path prefix for links."""
    rel = os.path.relpath(filepath, ROOT)
    if "/" in rel:  # in a subdirectory
        return "../"
    return ""


def fix_file(filepath):
    """Fix nav links and add nav.js script tag."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    prefix = get_prefix(filepath)
    active = get_active_label(filepath)
    
    # 1. Replace the <ul class="nav-links">...</ul> block
    new_ul = build_nav_ul(prefix, active)
    # Match the nav-links ul - handle both formatted and minified versions
    pattern = r'<ul class="nav-links">.*?</ul>'
    content = re.sub(pattern, new_ul, content, count=1, flags=re.DOTALL)
    
    # 2. Add nav.js script tag if not present
    nav_script = f'<script src="{prefix}js/nav.js" defer></script>'
    if 'nav.js' not in content:
        # Insert before </body>
        content = content.replace('</body>', f'{nav_script}\n</body>')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    html_files = glob.glob(os.path.join(ROOT, '*.html'))
    html_files += glob.glob(os.path.join(ROOT, 'ciphers', '*.html'))
    html_files += glob.glob(os.path.join(ROOT, 'halls', '*.html'))
    html_files.sort()
    
    changed = 0
    for fp in html_files:
        if fix_file(fp):
            rel = os.path.relpath(fp, ROOT)
            print(f"  ✓ {rel}")
            changed += 1
        else:
            rel = os.path.relpath(fp, ROOT)
            print(f"  · {rel} (no change)")
    
    print(f"\nDone — {changed}/{len(html_files)} files updated.")


if __name__ == '__main__':
    main()
