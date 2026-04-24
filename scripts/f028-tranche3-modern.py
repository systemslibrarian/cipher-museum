#!/usr/bin/env python3
"""F-028 tranche 3 generator: 5 modern-cryptography exhibits + Hall XI page.

Outputs:
  ciphers/des.html
  ciphers/diffie-hellman.html
  ciphers/rsa.html
  ciphers/aes.html
  ciphers/sha256.html
  halls/modern-crypto.html
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ────────────────────────────────────────────────────────────
EXHIBIT_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} &mdash; The Cipher Museum</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title} &mdash; The Cipher Museum">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/ciphers/{slug}.html">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title} &mdash; The Cipher Museum">
  <meta name="twitter:description" content="{desc}">
  <meta name="theme-color" content="#0a0a0f">
  <link rel="canonical" href="https://ciphermuseum.com/ciphers/{slug}.html">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="stylesheet" href="../css/museum.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<nav class="museum-nav" aria-label="Primary">
  <div class="nav-inner">
    <a href="../index.html" class="nav-logo">
      <svg class="nav-logo-icon" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1"/>
        <circle cx="16" cy="16" r="2" fill="currentColor"/>
      </svg>
      <span class="nav-logo-text">The Cipher Museum</span>
    </a>
    <ul class="nav-links"></ul>
  </div>
</nav>

<main id="main-content" tabindex="-1">
<div class="page-hero">
  <div class="breadcrumb">
    <a href="../index.html">Entrance</a><span>&rsaquo;</span>
    <a href="../halls/modern-crypto.html">Hall XI: Modern Cryptography</a><span>&rsaquo;</span>
    {title}
  </div>
  <div class="page-meta">
    <span class="badge era-modern">Modern &middot; {year}</span>
    <span class="badge {sec_badge}">{sec_label}</span>
  </div>
  <h1 class="page-title">{title}</h1>
  <p class="page-tagline">{tagline}</p>
  <div class="exhibit-facts">
    <div class="fact"><span class="fact-label">Origin</span><span class="fact-value">{origin}</span></div>
    <div class="fact"><span class="fact-label">Year</span><span class="fact-value">{year}</span></div>
    <div class="fact"><span class="fact-label">Type</span><span class="fact-value">{primitive}</span></div>
    <div class="fact"><span class="fact-label">Status</span><span class="fact-value">{status}</span></div>
    <div class="fact"><span class="fact-label">Modern Role</span><span class="fact-value">{role}</span></div>
  </div>
</div>

<div class="exhibit-layout">
  <div class="exhibit-main">

    <div class="cipher-significance">
      <h3>Why This Matters</h3>
      <p>{why}</p>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">📜</span><span class="panel-title">Historical Context</span></div>
      <div class="panel-body"><p>{history}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">⚙️</span><span class="panel-title">How It Works</span></div>
      <div class="panel-body">{how}</div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">🛡️</span><span class="panel-title">Security &amp; Cryptanalysis</span></div>
      <div class="panel-body"><p>{security}</p></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="panel-icon">🌐</span><span class="panel-title">Where You Use It Today</span></div>
      <div class="panel-body">
        <table class="cipher-table">
          <thead><tr><th>Where</th><th>How {short_name} is Used</th></tr></thead>
          <tbody>
{usage_rows}
          </tbody>
        </table>
      </div>
    </div>

  </div>
  <div class="exhibit-side">
    <div class="panel" style="border-color:var(--gold-b);">
      <div class="panel-head" style="background:var(--gold-glow);border-color:var(--gold-b);">
        <span class="panel-icon">⚔</span><span class="panel-title" style="color:var(--gold);">Quick Facts</span>
      </div>
      <div class="panel-body">
        <table class="cipher-table">
          <tbody>
            <tr><td>Era</td><td>Modern &middot; {year}</td></tr>
            <tr><td>Status</td><td>{status}</td></tr>
            <tr><td>Origin</td><td>{origin}</td></tr>
            <tr><td>Year</td><td>{year}</td></tr>
            <tr><td>Type</td><td>{primitive}</td></tr>
            <tr><td>Modern Role</td><td>{role}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<section class="related-exhibits">
  <h2 class="related-exhibits__heading">Related Exhibits</h2>
  <div class="related-exhibits__grid">
{related_cards}
  </div>
</section>

<div class="hall-nav">
  <a href="{prev_href}" class="hall-nav-link">
    <span class="hall-nav-dir">&larr; Previous</span>
    <span class="hall-nav-name">{prev_name}</span>
  </a>
  <a href="{next_href}" class="hall-nav-link next">
    <span class="hall-nav-dir">Next &rarr;</span>
    <span class="hall-nav-name">{next_name}</span>
  </a>
</div>

</main>

<footer class="museum-footer"></footer>
<script src="../js/demo-loader.js"></script>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>
"""

def usage(rows):
    return "\n".join(f"            <tr><td>{w}</td><td>{h}</td></tr>" for w, h in rows)

def related(cards):
    out = []
    for href, name, tag in cards:
        out.append(f"""    <a href="{href}" class="related-card">
      <span class="related-card__number">Related</span>
      <span class="related-card__name">{name}</span>
      <span class="related-card__tag">{tag}</span>
    </a>""")
    return "\n".join(out)

# ────────────────────────────────────────────────────────────
EXHIBITS = {
    "des": dict(
        title="DES (Data Encryption Standard)",
        short_name="DES",
        slug="des",
        year="1977",
        sec_badge="sec-broken",
        sec_label="Broken (brute force, 1998)",
        tagline="The first public, government-standardised cipher &mdash; and the cipher that started a generation of academic cryptanalysis.",
        origin="IBM (Lucifer, 1971), modified by NSA, standardised by NBS as FIPS 46",
        primitive="Symmetric block cipher (Feistel network, 64-bit block, 56-bit key)",
        status="Withdrawn 2005; replaced by AES; 3DES deprecated 2023",
        role="Historical foundation; 3DES still appears in legacy banking and EMV until 2023 sunset",
        why="DES was the first cipher whose specification was fully public, peer-reviewed, and adopted as a government standard. That openness &mdash; controversial at the time &mdash; created modern academic cryptanalysis: Biham and Shamir's <em>differential cryptanalysis</em> (1991) and Matsui's <em>linear cryptanalysis</em> (1993) were both invented to attack DES, and both reshaped how every subsequent cipher is designed.",
        history="IBM's Horst Feistel led the design of <em>Lucifer</em> in the early 1970s. NBS (now NIST) issued an open call for a standard cipher; IBM submitted a hardened Lucifer derivative; NSA modified the S-boxes and reduced the key from 112 bits to 56 bits. Cryptographers cried foul over the key-length cut and the unexplained S-box changes &mdash; until 1991, when Biham and Shamir showed the NSA's S-boxes were specifically hardened against differential cryptanalysis, a technique IBM and NSA both knew about and the public did not.",
        how="<p>DES is a 16-round Feistel network. The 64-bit plaintext is split into two 32-bit halves L and R. Each round computes <code>L<sub>i+1</sub> = R<sub>i</sub></code> and <code>R<sub>i+1</sub> = L<sub>i</sub> &oplus; F(R<sub>i</sub>, K<sub>i</sub>)</code>. The round function F expands R to 48 bits, XORs the round subkey, passes the result through eight 6-to-4-bit S-boxes (the heart of DES's non-linearity), and applies a final permutation. Sixteen rounds of this with sixteen subkeys derived from the 56-bit master key produce ciphertext that survives all linear and differential attacks within its key budget &mdash; but not exhaustive search.</p>",
        security="In 1998 the EFF's $250,000 <em>Deep Crack</em> machine recovered a DES key in 56 hours by brute force. By 2008 a single FPGA cluster could do it in under a day. Differential and linear cryptanalysis require ~2<sup>47</sup> chosen plaintexts &mdash; impractical operationally, but a clear theoretical break. Triple-DES (3DES) extended the effective key to 112 bits and bought DES another two decades, but by 2023 NIST formally retired 3DES because of the small 64-bit block size (the Sweet32 birthday attack) and modern computing capacity.",
        usage_rows=usage([
            ("Banking (1980s&ndash;2010s)", "ATM PIN encryption, EMV chip cards (3DES); legacy systems still in slow migration"),
            ("Unix passwd (until 1990s)", "<code>crypt(3)</code> used DES iterated 25 times to hash passwords"),
            ("Kerberos v4", "DES was the original Kerberos cipher; v5 added AES support"),
            ("Cryptanalysis education", "Every academic cryptography course still teaches DES because Feistel, S-boxes, and the avalanche effect are easiest to demonstrate on it"),
        ]),
        related=[
            ("../ciphers/aes.html", "AES", "DES's successor, chosen via the same open competition model"),
            ("../ciphers/rsa.html", "RSA", "Companion 1977 invention &mdash; asymmetric to DES's symmetric"),
            ("../ciphers/lorenz.html", "Lorenz", "Earlier rotor-style symmetric cipher DES replaced in concept"),
        ],
        prev=("../halls/codebreakers.html", "Hall X &middot; Codebreakers"),
        next=("../ciphers/diffie-hellman.html", "Diffie-Hellman Key Exchange"),
    ),
    "diffie-hellman": dict(
        title="Diffie-Hellman Key Exchange",
        short_name="Diffie-Hellman",
        slug="diffie-hellman",
        year="1976",
        sec_badge="sec-secure",
        sec_label="Secure (with 2048+ bit groups)",
        tagline="Two strangers create a shared secret over an open wire &mdash; the discovery that broke the millennia-old &lsquo;you must meet first' assumption.",
        origin="Whitfield Diffie &amp; Martin Hellman, &lsquo;New Directions in Cryptography' (1976); Ralph Merkle independently",
        primitive="Public-key key-agreement protocol &mdash; <strong>not a cipher</strong> (does not encrypt data)",
        status="In active use everywhere; modern variant ECDH (X25519) preferred over classical DH",
        role="Establishes the symmetric key for nearly every TLS 1.3, SSH, Signal, and WireGuard session in existence",
        why="For three thousand years cryptography assumed the two parties had already met to exchange a secret key. Diffie and Hellman proved that assumption wrong: two people who have never communicated can derive a shared secret while every byte they exchange is read by an eavesdropper. Without this single 1976 paper there would be no HTTPS, no Signal, no encrypted email, no online banking &mdash; the entire idea of secure communication between strangers depends on it.",
        history="Diffie and Hellman published &lsquo;New Directions in Cryptography' in <em>IEEE Transactions on Information Theory</em>, November 1976. The paper proposed both public-key encryption (as a goal) and the key-exchange protocol (as a working example). Three British researchers at GCHQ &mdash; James Ellis, Clifford Cocks, and Malcolm Williamson &mdash; had discovered the same ideas between 1969 and 1974 but classification kept their work secret until 1997. The 1976 paper directly inspired Rivest, Shamir, and Adleman to find RSA the following year.",
        how="<p>Both parties agree on a large prime <em>p</em> and a generator <em>g</em>. Alice picks a secret integer <em>a</em> and sends <em>g<sup>a</sup> mod p</em>. Bob picks a secret integer <em>b</em> and sends <em>g<sup>b</sup> mod p</em>. Each computes the shared key <em>K = g<sup>ab</sup> mod p</em> &mdash; Alice raises Bob's value to her secret, Bob raises Alice's value to his. An eavesdropper sees <em>p</em>, <em>g</em>, <em>g<sup>a</sup></em>, <em>g<sup>b</sup></em> but cannot recover <em>a</em>, <em>b</em>, or <em>K</em> without solving the <strong>discrete logarithm problem</strong>, which has no known efficient classical algorithm.</p>",
        security="Security rests on the discrete logarithm problem in a finite cyclic group. With a 2048-bit prime, no classical attack is known to be feasible. The 2015 <em>Logjam</em> attack exploited servers using common 512-bit primes &mdash; the lesson was to use larger groups and to switch to elliptic curves where 256-bit keys suffice (X25519). DH is vulnerable to <em>active</em> man-in-the-middle attacks because the exchanged values are unauthenticated &mdash; in practice DH is always combined with authentication (signatures, certificates, or a pre-shared password).",
        usage_rows=usage([
            ("TLS 1.3 (HTTPS)", "Every modern HTTPS handshake uses ECDHE (ephemeral elliptic-curve DH) for forward secrecy"),
            ("Signal / WhatsApp / iMessage", "X3DH and the Double Ratchet are layered Diffie-Hellman exchanges"),
            ("SSH", "Default key-exchange method since SSH-2"),
            ("WireGuard / Tor", "Both built on Curve25519 ECDH"),
            ("IPsec / IKEv2", "DH groups 14&ndash;21 in every VPN handshake"),
        ]),
        related=[
            ("../ciphers/rsa.html", "RSA", "The other 1977 public-key foundation; can be used for key transport"),
            ("../ciphers/aes.html", "AES", "The symmetric cipher DH typically establishes a key for"),
            ("../ciphers/one-time-pad.html", "One-Time Pad", "The earlier &lsquo;perfect' system DH made practical to bootstrap"),
        ],
        prev=("../ciphers/des.html", "DES"),
        next=("../ciphers/rsa.html", "RSA"),
    ),
    "rsa": dict(
        title="RSA",
        short_name="RSA",
        slug="rsa",
        year="1977",
        sec_badge="sec-secure",
        sec_label="Secure (with 2048+ bit keys)",
        tagline="The first practical public-key cryptosystem &mdash; one key encrypts, a different key decrypts, and you can publish the encrypting key in the phone book.",
        origin="Ron Rivest, Adi Shamir, Leonard Adleman (MIT, 1977); Clifford Cocks (GCHQ, 1973, classified)",
        primitive="Public-key encryption &amp; digital signature (asymmetric)",
        status="In daily use; NIST is preparing a post-quantum migration (RSA breaks under Shor's algorithm on a sufficiently large quantum computer)",
        role="TLS certificates, code signing, PGP/GPG, SSH host keys, JWT signatures, document signing",
        why="Diffie and Hellman had described public-key cryptography as a <em>goal</em> in 1976; RSA was the first concrete construction that achieved it. The same key pair can be used both ways &mdash; encrypt with the public key and only the holder of the private key can decrypt; sign with the private key and anyone with the public key can verify. That single mathematical object simultaneously solved key distribution, authentication, and non-repudiation. Every TLS certificate, every code-signing chain, every signed software update is descended from this 1977 paper.",
        history="Rivest, Shamir, and Adleman were MIT researchers reading Diffie-Hellman's paper in 1976 and trying to find a working public-key construction. After dozens of failed attempts, Rivest had the key insight one Passover night in April 1977 after a glass of wine: use the multiplicative inverse <em>d</em> of the encrypting exponent <em>e</em> modulo &phi;(<em>n</em>). The MIT memo went out August 1977; Martin Gardner's <em>Scientific American</em> column in 1977 popularised it with a $100 challenge cipher (factored in 1994 by 600 volunteers). RSA Data Security was founded in 1982; the patent expired in 2000.",
        how="<p>Pick two large primes <em>p</em> and <em>q</em> (each ~1024 bits for RSA-2048). Compute <em>n = p&middot;q</em> and <em>&phi;(n) = (p&minus;1)(q&minus;1)</em>. Choose a public exponent <em>e</em> coprime to <em>&phi;(n)</em> &mdash; almost always 65537. Compute the private exponent <em>d &equiv; e<sup>&minus;1</sup> mod &phi;(n)</em>.</p><p>Public key is <em>(n, e)</em>; private key is <em>(n, d)</em>. To encrypt message <em>m</em>: <em>c = m<sup>e</sup> mod n</em>. To decrypt: <em>m = c<sup>d</sup> mod n</em>. The math works because of Euler's theorem: <em>m<sup>ed</sup> &equiv; m mod n</em> for any <em>m</em> coprime to <em>n</em>. Recovering <em>d</em> from the public key requires factoring <em>n</em>, which is believed to be classically infeasible for 2048-bit moduli.</p>",
        security="Security rests on the integer factorisation problem. The largest RSA modulus publicly factored is RSA-250 (829 bits, 2020), using ~2700 core-years on a CADO-NFS cluster. RSA-2048 is estimated at ~10<sup>9</sup> times harder. <strong>However</strong>: Shor's quantum algorithm factors <em>n</em> in polynomial time, so a sufficiently large quantum computer breaks RSA entirely. NIST's post-quantum standardisation (CRYSTALS-Kyber, ML-KEM) is the planned replacement. RSA also has dangerous implementation pitfalls: textbook RSA leaks small messages and is malleable; production systems must use OAEP padding for encryption and PSS for signatures.",
        usage_rows=usage([
            ("TLS / HTTPS certificates", "Most certificate authorities still issue RSA-2048 leaf certificates; ECDSA is gaining share"),
            ("Code signing", "Microsoft Authenticode, Apple notarisation, Debian package signing all use RSA"),
            ("PGP / GPG", "Default keypair for encrypted email and signed Git commits"),
            ("SSH host keys", "<code>ssh-rsa</code> remains the most common key type, though <code>ed25519</code> is now preferred"),
            ("JWT signatures", "<code>RS256</code> is the default for many OAuth / OIDC implementations"),
        ]),
        related=[
            ("../ciphers/diffie-hellman.html", "Diffie-Hellman", "The earlier public-key paper that inspired RSA"),
            ("../ciphers/aes.html", "AES", "RSA usually wraps an AES session key rather than encrypting data directly"),
            ("../ciphers/sha256.html", "SHA-256", "RSA signatures sign the hash of the message, not the message itself"),
        ],
        prev=("../ciphers/diffie-hellman.html", "Diffie-Hellman"),
        next=("../ciphers/aes.html", "AES"),
    ),
    "aes": dict(
        title="AES (Advanced Encryption Standard)",
        short_name="AES",
        slug="aes",
        year="2001",
        sec_badge="sec-secure",
        sec_label="Secure (no practical attack)",
        tagline="The cipher that encrypts the modern world &mdash; chosen by open competition, scrutinised for two decades, still unbroken.",
        origin="Joan Daemen &amp; Vincent Rijmen (Belgium, 1998); standardised as FIPS 197 in 2001",
        primitive="Symmetric block cipher (substitution-permutation network, 128-bit block, 128/192/256-bit key)",
        status="Universal standard; NSA-approved for TOP SECRET data with 192/256-bit keys (CNSA Suite)",
        role="HTTPS, full-disk encryption (BitLocker, FileVault, LUKS), Wi-Fi WPA2/3, VPNs, messaging apps, cloud storage",
        why="AES is the cipher that runs the internet. When you load a webpage over HTTPS, when your phone wakes from sleep and unlocks, when WhatsApp delivers a message, when Wi-Fi authenticates your laptop &mdash; it is almost certainly AES doing the bulk encryption. After two decades of intense academic and intelligence-agency scrutiny, no attack faster than ~2<sup>126</sup> operations is known against AES-128 in its standard configuration. It is, in practice, the cipher.",
        history="By 1997 NIST knew DES was finished and ran an open international competition to replace it. Fifteen submissions from twelve countries; five finalists (MARS, RC6, Rijndael, Serpent, Twofish) survived to round two. After three years of public cryptanalysis NIST chose <em>Rijndael</em> by Joan Daemen and Vincent Rijmen of Belgium &mdash; the first non-American cipher ever to become a US government standard. The choice was driven by speed, hardware-friendliness, and design clarity. FIPS 197 was published 26 November 2001.",
        how="<p>AES is a substitution-permutation network operating on a 4&times;4 byte state. Each round applies four operations:</p><ul><li><strong>SubBytes</strong> &mdash; replace each byte via a non-linear S-box (algebraic inverse in GF(2<sup>8</sup>))</li><li><strong>ShiftRows</strong> &mdash; cyclically shift each row by 0/1/2/3 positions</li><li><strong>MixColumns</strong> &mdash; multiply each column by a fixed polynomial (skipped in the final round)</li><li><strong>AddRoundKey</strong> &mdash; XOR with the round-specific subkey</li></ul><p>AES-128 runs 10 rounds, AES-192 runs 12, AES-256 runs 14. The key schedule expands the master key into all round keys. The four-operation round delivers Shannon's confusion (S-box) and diffusion (ShiftRows + MixColumns); after 2 rounds every output bit depends on every input bit, after the full round count the dependency is mathematically saturated.</p>",
        security="The best known attack on full AES-128 is biclique cryptanalysis at 2<sup>126.1</sup> operations &mdash; faster than brute force by a factor of four, but still completely impractical. Practical AES failures are always implementation flaws: cache-timing side channels (BEAST, CRIME, Lucky 13), weak modes (ECB), nonce reuse in GCM, or padding oracles in CBC. Modern Intel and ARM CPUs include AES-NI / AES instructions that make AES essentially free in software, removing the last reason to roll alternative ciphers.",
        usage_rows=usage([
            ("HTTPS (TLS 1.2/1.3)", "AES-128-GCM and AES-256-GCM are the default authenticated-encryption ciphers"),
            ("Full-disk encryption", "BitLocker (XTS-AES-128/256), FileVault 2, LUKS, dm-crypt all default to AES"),
            ("Wi-Fi WPA2 / WPA3", "AES-CCMP replaced TKIP/RC4 in 2004; WPA3 adds AES-GCMP-256"),
            ("Messaging apps", "Signal, WhatsApp, iMessage all wrap AES-GCM under their key-ratchet protocols"),
            ("US government", "NSA CNSA Suite mandates AES-256 for TOP SECRET data"),
        ]),
        related=[
            ("../ciphers/des.html", "DES", "AES's predecessor, defeated by brute force"),
            ("../ciphers/rsa.html", "RSA", "Asymmetric companion that establishes AES session keys"),
            ("../ciphers/sha256.html", "SHA-256", "Hash function paired with AES for authenticated encryption"),
        ],
        prev=("../ciphers/rsa.html", "RSA"),
        next=("../ciphers/sha256.html", "SHA-256"),
    ),
    "sha256": dict(
        title="SHA-256",
        short_name="SHA-256",
        slug="sha256",
        year="2001",
        sec_badge="sec-secure",
        sec_label="Secure (no practical collision)",
        tagline="A 256-bit fingerprint for any input &mdash; one-way, collision-resistant, and the verification engine of the digital world.",
        origin="NSA (designed); published by NIST as FIPS 180-2 in 2001",
        primitive="Cryptographic hash function (Merkle-Damg&aring;rd construction over the SHA-2 compression function) &mdash; <strong>not a cipher</strong>",
        status="Secure; SHA-3 (Keccak) standardised 2015 as a structural alternative, not a replacement",
        role="TLS certificate signatures, software integrity (Git commits, package managers), password storage (with KDFs), Bitcoin proof-of-work, any digital signature scheme",
        why="A hash function takes any input &mdash; one byte or one terabyte &mdash; and produces a fixed-length output that acts as a unique fingerprint. SHA-256 is the workhorse hash of the post-2010 internet: Git commit IDs, Bitcoin block hashes, TLS certificate signatures, and most password-storage schemes are all built on it. It is not a cipher: there is no key, no decryption, and no way to recover the input from the output. That irreversibility is the entire point.",
        history="SHA-0 (1993) was the NSA's first published hash; an undisclosed weakness led to SHA-1 in 1995. Cryptanalytic advances against MD5 (broken 2004) and SHA-1 (theoretical break 2005, full collision 2017) prompted NIST to standardise the SHA-2 family in 2001 (FIPS 180-2): SHA-224, SHA-256, SHA-384, SHA-512. SHA-256 became the default. After the SHA-1 wake-up call NIST also ran an open competition (2007&ndash;2012) for a structurally different backup; Keccak won and became SHA-3 in 2015 &mdash; not because SHA-256 broke, but to avoid a single-point-of-failure design.",
        how="<p>The input is padded so its length is congruent to 448 mod 512, then a 64-bit length is appended. The padded message is split into 512-bit blocks. Each block is processed by the <em>compression function</em>, which mixes the block into a 256-bit internal state through 64 rounds of bitwise operations: rotations, XORs, AND/OR/NOT, modular addition, and round constants derived from the cube roots of the first 64 primes. After the last block the internal state is the hash output.</p><p>Two security properties matter: <strong>preimage resistance</strong> (given a hash, you cannot find an input that produces it &mdash; would take ~2<sup>256</sup> tries) and <strong>collision resistance</strong> (you cannot find two inputs with the same hash &mdash; would take ~2<sup>128</sup> tries by the birthday bound).</p>",
        security="No collision has ever been found in SHA-256. The best published attack reaches 31 of the 64 rounds. SHA-256 is theoretically vulnerable to length-extension attacks &mdash; if you know <code>H(secret &Vert; data)</code> and <code>len(secret &Vert; data)</code>, you can compute <code>H(secret &Vert; data &Vert; padding &Vert; extension)</code> without knowing the secret. The standard mitigation is HMAC-SHA-256 or SHA-3, neither of which has the flaw. Quantum computers using Grover's algorithm reduce SHA-256 preimage resistance from 2<sup>256</sup> to 2<sup>128</sup> &mdash; still secure, which is why SHA-256 is considered post-quantum-safe at lower security levels.",
        usage_rows=usage([
            ("TLS / HTTPS", "Every certificate's signature uses SHA-256 (SHA-1 deprecated since 2017)"),
            ("Git", "Every commit, tree, and blob is identified by its SHA-1 hash today; Git is migrating to SHA-256"),
            ("Bitcoin", "Proof-of-work mines for inputs whose double SHA-256 hash starts with N zero bits"),
            ("Password storage", "Used inside KDFs like PBKDF2-HMAC-SHA256, scrypt, Argon2 (which uses BLAKE2)"),
            ("Software integrity", "<code>sha256sum</code>, package manager checksums, signed releases on every modern OS"),
            ("Digital signatures", "RSA-PSS, ECDSA, and Ed25519 all sign the SHA-256 hash of the message, not the raw bytes"),
        ]),
        related=[
            ("../ciphers/aes.html", "AES", "Paired with SHA-256 for authenticated encryption (HMAC-SHA-256, AES-GCM)"),
            ("../ciphers/rsa.html", "RSA", "RSA signatures sign a SHA-256 hash, never raw plaintext"),
            ("../ciphers/diffie-hellman.html", "Diffie-Hellman", "DH-derived secrets are typically run through SHA-256-based KDFs"),
        ],
        prev=("../ciphers/aes.html", "AES"),
        next=("../halls/modern-crypto.html", "Hall XI &middot; Modern Cryptography"),
    ),
}

def render_exhibit(slug, e):
    desc = e["tagline"].replace("&mdash;", "—").replace("&middot;", "·").replace("&lsquo;", "'").replace("&rsquo;", "'")
    # simple description from why if tagline too short
    # We'll just use tagline since it's substantive enough
    if len(desc) < 140:
        desc = desc + " " + e["why"][:200]
    desc = desc[:300]
    html = EXHIBIT_TEMPLATE.format(
        title=e["title"],
        slug=e["slug"],
        desc=desc.replace('"', '&quot;'),
        year=e["year"],
        sec_badge=e["sec_badge"],
        sec_label=e["sec_label"],
        tagline=e["tagline"],
        origin=e["origin"],
        primitive=e["primitive"],
        status=e["status"],
        role=e["role"],
        why=e["why"],
        history=e["history"],
        how=e["how"],
        security=e["security"],
        short_name=e["short_name"],
        usage_rows=e["usage_rows"],
        related_cards=related(e["related"]),
        prev_href=e["prev"][0],
        prev_name=e["prev"][1],
        next_href=e["next"][0],
        next_name=e["next"][1],
    )
    out = ROOT / "ciphers" / f"{slug}.html"
    out.write_text(html, encoding="utf-8")
    return out, len(desc)


# ────────────────────────────────────────────────────────────
HALL_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hall XI: Modern Cryptography &mdash; The Cipher Museum</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <meta name="description" content="DES, Diffie-Hellman, RSA, AES, SHA-256 &mdash; the five primitives that replaced classical cryptography and now secure the entire digital world.">
  <meta property="og:title" content="Hall XI: Modern Cryptography &mdash; The Cipher Museum">
  <meta property="og:description" content="DES, Diffie-Hellman, RSA, AES, SHA-256 &mdash; the five primitives that replaced classical cryptography and now secure the entire digital world.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ciphermuseum.com/halls/modern-crypto.html">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Hall XI: Modern Cryptography &mdash; The Cipher Museum">
  <meta name="twitter:description" content="DES, Diffie-Hellman, RSA, AES, SHA-256 &mdash; the five primitives that replaced classical cryptography and now secure the entire digital world.">
  <meta name="theme-color" content="#0a0a0f">
  <link rel="canonical" href="https://ciphermuseum.com/halls/modern-crypto.html">
  <link rel="stylesheet" href="../css/museum.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<nav class="museum-nav" aria-label="Primary">
  <div class="nav-inner">
    <a href="../index.html" class="nav-logo">
      <svg class="nav-logo-icon" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1"/>
        <circle cx="16" cy="16" r="2" fill="currentColor"/>
      </svg>
      <span class="nav-logo-text">The Cipher Museum</span>
    </a>
    <ul class="nav-links"></ul>
  </div>
</nav>

<main id="main-content" tabindex="-1">
<div class="page-hero" style="border-bottom-color:var(--gold);">
  <div class="breadcrumb">
    <a href="../index.html">Entrance</a><span>&rsaquo;</span>
    <a href="../museum-map.html">Museum Map</a><span>&rsaquo;</span>
    Hall XI
  </div>
  <span class="page-eyebrow" style="color:var(--gold);">Hall XI &middot; 1976 &ndash; Present</span>
  <h1 class="page-title">Modern Cryptography</h1>
  <p class="page-tagline">Five primitives that replaced three thousand years of classical cryptography</p>
  <p style="max-width:680px;font-size:1.1rem;color:var(--tx2);line-height:1.9;position:relative;z-index:1;">Every cipher in the previous ten halls eventually fell. The five primitives in this hall &mdash; DES, Diffie-Hellman, RSA, AES, SHA-256 &mdash; were designed in the public eye, scrutinised for decades, and now run essentially every secure system on Earth. Only one of them, AES, is technically a cipher in the classical sense. The other four solve problems that classical cryptography could not: distributing keys without meeting in person, signing documents at a distance, and verifying integrity without a shared secret.</p>
  <p style="max-width:680px;font-size:.95rem;color:var(--tx3);line-height:1.8;margin-top:1rem;position:relative;z-index:1;">For the broader landscape &mdash; ChaCha20, ECDH, post-quantum &mdash; see the <a href="../modern.html" style="color:var(--gold);">Modern Cryptography wing</a>.</p>
  <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1.5rem;position:relative;z-index:1;">
    <span class="badge era-modern">Modern Era</span>
    <span class="badge sec-secure">Production Standards</span>
    <span class="badge era-theoretical">Mathematically Founded</span>
  </div>
</div>

<div class="section">

  <div class="cipher-gallery" style="margin-bottom:4rem;">

    <a href="../ciphers/des.html" class="cipher-card">
      <div class="card-head">
        <span class="card-num">Exhibit 59</span>
        <span class="badge era-modern">1977 &middot; NBS / NSA</span>
      </div>
      <div class="card-name">DES (Data Encryption Standard)</div>
      <p class="card-desc">The first public, government-standardised cipher. A 16-round Feistel network with a 56-bit key &mdash; broken by EFF's Deep Crack in 1998 (56 hours). Triple-DES extended its life until 2023. The cipher that birthed academic cryptanalysis: differential and linear cryptanalysis were both invented to attack it.</p>
      <div class="card-foot">
        <div class="card-badges">
          <span class="badge sec-broken">Broken (brute force)</span>
          <span class="badge era-modern">Withdrawn 2005</span>
        </div>
        <span class="card-arrow">&rarr;</span>
      </div>
    </a>

    <a href="../ciphers/diffie-hellman.html" class="cipher-card" style="border-color:rgba(90,200,160,.25);">
      <div class="card-head">
        <span class="card-num">Exhibit 60</span>
        <span class="badge era-modern">1976 &middot; Stanford</span>
      </div>
      <div class="card-name">Diffie-Hellman Key Exchange</div>
      <p class="card-desc">Two strangers create a shared secret over an open wire. Not a cipher &mdash; a key-agreement protocol. The 1976 paper that overturned cryptography's three-thousand-year-old &lsquo;you must meet first' assumption. Every TLS 1.3, SSH, Signal, and WireGuard handshake descends from it.</p>
      <div class="card-foot">
        <div class="card-badges">
          <span class="badge sec-secure">Secure (2048+ bit)</span>
          <span class="badge era-theoretical">Discrete log hardness</span>
        </div>
        <span class="card-arrow">&rarr;</span>
      </div>
    </a>

    <a href="../ciphers/rsa.html" class="cipher-card" style="border-color:rgba(90,200,160,.25);">
      <div class="card-head">
        <span class="card-num">Exhibit 61</span>
        <span class="badge era-modern">1977 &middot; MIT</span>
      </div>
      <div class="card-name">RSA</div>
      <p class="card-desc">The first practical public-key cryptosystem. One key encrypts, a different key decrypts &mdash; and you can publish the encrypting key. Solved key distribution, authentication, and digital signatures in one stroke. Every TLS certificate, code-signing chain, and PGP keypair is descended from this 1977 paper.</p>
      <div class="card-foot">
        <div class="card-badges">
          <span class="badge sec-secure">Secure (2048+ bit)</span>
          <span class="badge era-theoretical">Factoring hardness</span>
        </div>
        <span class="card-arrow">&rarr;</span>
      </div>
    </a>

    <a href="../ciphers/aes.html" class="cipher-card" style="border-color:rgba(90,200,160,.25);">
      <div class="card-head">
        <span class="card-num">Exhibit 62</span>
        <span class="badge era-modern">2001 &middot; FIPS 197</span>
      </div>
      <div class="card-name">AES (Advanced Encryption Standard)</div>
      <p class="card-desc">The cipher that encrypts the modern world. Chosen by open international competition in 2001; designed by Joan Daemen and Vincent Rijmen of Belgium. Substitution-permutation network, 128-bit blocks, 128/192/256-bit keys, 10&ndash;14 rounds. After two decades of intense scrutiny, no practical attack exists.</p>
      <div class="card-foot">
        <div class="card-badges">
          <span class="badge sec-secure">Secure (no practical attack)</span>
          <span class="badge era-modern">FIPS 197</span>
        </div>
        <span class="card-arrow">&rarr;</span>
      </div>
    </a>

    <a href="../ciphers/sha256.html" class="cipher-card" style="border-color:rgba(90,200,160,.25);">
      <div class="card-head">
        <span class="card-num">Exhibit 63</span>
        <span class="badge era-modern">2001 &middot; NSA / NIST</span>
      </div>
      <div class="card-name">SHA-256</div>
      <p class="card-desc">A 256-bit fingerprint for any input. One-way, collision-resistant, and the verification engine of Git, Bitcoin, TLS certificates, and software integrity. Not a cipher &mdash; there is no key and no decryption. Irreversibility is the entire point.</p>
      <div class="card-foot">
        <div class="card-badges">
          <span class="badge sec-secure">Secure (no collision)</span>
          <span class="badge era-modern">FIPS 180-2</span>
        </div>
        <span class="card-arrow">&rarr;</span>
      </div>
    </a>

  </div>

  <div class="callout callout-mystery" style="margin-top:3rem;">
    <span class="callout-icon">🎓</span>
    <div class="callout-body"><p><strong>The museum's closing lesson:</strong> Classical cryptography failed because it relied on obscurity, physical key distribution, and small key spaces. Modern cryptography replaces all three with mathematical hardness, public-key mathematics, and key sizes large enough that brute force is physically impossible &mdash; and expanded the field beyond ciphers into protocols, signatures, and proofs.</p></div>
  </div>

</div>

</main>

<footer class="museum-footer"></footer>
<script src="../js/nav.js" defer></script>
<script src="../js/lightbox.js"></script>
</body>
</html>
"""

# ────────────────────────────────────────────────────────────
def main():
    print("Generating tranche 3 exhibits…")
    for slug, e in EXHIBITS.items():
        out, dlen = render_exhibit(slug, e)
        print(f"  {out.relative_to(ROOT)}  meta-desc={dlen}")
    hall = ROOT / "halls" / "modern-crypto.html"
    hall.write_text(HALL_HTML, encoding="utf-8")
    print(f"  {hall.relative_to(ROOT)}")
    print("Done.")

if __name__ == "__main__":
    main()
