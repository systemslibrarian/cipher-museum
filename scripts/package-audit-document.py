#!/usr/bin/env python3
"""Package the generated audit documents, with deterministic bytes and checksum checks."""
import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path
import zipfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'audit' / 'pack'
manifest = json.loads((root / 'manifest.json').read_text())
files = sorted([entry['path'] for entry in manifest['outputs']] + ['manifest.json'])
for entry in manifest['outputs']:
    data = (root / entry['path']).read_bytes()
    assert len(data) == entry['bytes'], f"Size mismatch: {entry['path']}"
    assert hashlib.sha256(data).hexdigest() == entry['sha256'], f"Hash mismatch: {entry['path']}"
archive = root / 'CIPHER_MUSEUM_AUDIT_PACK.zip'
if not args.check:
    timestamp = datetime.fromisoformat(manifest['source_commit_time']).timetuple()[:6]
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for name in files:
            info = zipfile.ZipInfo(name, date_time=timestamp)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, (root / name).read_bytes(), compresslevel=9)
with zipfile.ZipFile(archive) as bundle:
    assert sorted(bundle.namelist()) == files, 'Archive inventory differs from generated files'
    assert bundle.testzip() is None, 'Archive CRC failure'
    for name in files:
        assert bundle.read(name) == (root / name).read_bytes(), f'Archive differs: {name}'
print(json.dumps({'mode': 'verified' if args.check else 'packaged', 'files': len(files),
                  'archive_bytes': archive.stat().st_size,
                  'archive_sha256': hashlib.sha256(archive.read_bytes()).hexdigest()}))
