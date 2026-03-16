#!/usr/bin/env python3
"""
Add nav.js to all HTML pages that have a .museum-nav.
Idempotent — skips files that already include nav.js.

Run: python3 scripts/add-nav-js.py
"""
import os, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def process(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'nav.js' in content:
        return False
    if 'museum-nav' not in content:
        return False

    rel = os.path.relpath(filepath, BASE)
    depth = rel.count(os.sep)
    prefix = '../' * depth

    tag = f'<script src="{prefix}js/nav.js" defer></script>'

    # Insert before </body>
    if '</body>' in content:
        content = content.replace('</body>', tag + '\n</body>', 1)
    else:
        content += '\n' + tag

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

count = 0
for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ('node_modules', 'scripts', 'tests')]
    for fname in sorted(files):
        if fname.endswith('.html'):
            fpath = os.path.join(root, fname)
            if process(fpath):
                print(f'  \u2713 {os.path.relpath(fpath, BASE)}')
                count += 1

print(f'\n\u2714 {count} files updated with nav.js')
