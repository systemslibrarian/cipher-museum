#!/usr/bin/env python3
"""Generate placeholder artifact images for the Cipher Museum."""

from PIL import Image, ImageDraw, ImageFont
import math
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'images', 'artifacts')
W, H = 800, 500
BG = (30, 30, 40)
GOLD = (212, 175, 55)
LIGHT = (220, 220, 220)
DARK_CARD = (40, 40, 55)
RED = (200, 80, 80)
GREEN = (80, 200, 120)
BLUE = (100, 140, 220)
CYAN = (80, 200, 220)
PURPLE = (160, 100, 220)

def get_font(size=16):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", size)
        except:
            return ImageFont.load_default()

def get_bold_font(size=16):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        return get_font(size)

def text_center(draw, text, y, font, fill=LIGHT):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, y), text, font=font, fill=fill)

def draw_rounded_rect(draw, xy, fill, radius=10):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.pieslice([x0, y0, x0 + 2*radius, y0 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x1 - 2*radius, y0, x1, y0 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1 - 2*radius, x0 + 2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1 - 2*radius, y1 - 2*radius, x1, y1], 0, 90, fill=fill)


# 1. Letter Frequency Chart
def make_frequency_chart():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(22)
    label_font = get_font(12)
    val_font = get_font(10)

    text_center(draw, "English Letter Frequency Distribution", 15, title_font, GOLD)

    freqs = {'E':12.7,'T':9.1,'A':8.2,'O':7.5,'I':7.0,'N':6.7,'S':6.3,'H':6.1,
             'R':6.0,'D':4.3,'L':4.0,'C':2.8,'U':2.8,'M':2.4,'W':2.4,'F':2.2,
             'G':2.0,'Y':2.0,'P':1.9,'B':1.5,'V':1.0,'K':0.8,'J':0.15,'X':0.15,
             'Q':0.10,'Z':0.07}

    margin_left = 50
    margin_bottom = 60
    chart_w = W - margin_left - 30
    chart_h = H - 100
    bar_w = chart_w // 26 - 2
    max_freq = 13.0
    base_y = H - margin_bottom

    # Y axis
    draw.line([(margin_left, 50), (margin_left, base_y)], fill=(100,100,120), width=1)
    for tick in range(0, 14, 2):
        y = base_y - int((tick / max_freq) * chart_h)
        draw.line([(margin_left - 5, y), (margin_left, y)], fill=(100,100,120))
        draw.text((margin_left - 30, y - 6), f"{tick}%", font=val_font, fill=(150,150,160))

    # Bars
    for i, (letter, freq) in enumerate(freqs.items()):
        x = margin_left + 8 + i * (bar_w + 2)
        bar_h = int((freq / max_freq) * chart_h)
        # Gradient-ish color
        r = int(200 - freq * 8)
        g = int(80 + freq * 8)
        color = (max(60, r), min(220, g), 120)
        draw.rectangle([x, base_y - bar_h, x + bar_w, base_y], fill=color)
        draw.text((x + bar_w//2 - 4, base_y + 5), letter, font=label_font, fill=LIGHT)
        if freq >= 2.0:
            draw.text((x, base_y - bar_h - 14), f"{freq}", font=val_font, fill=(180,180,190))

    # X axis
    draw.line([(margin_left, base_y), (W - 20, base_y)], fill=(100,100,120), width=1)
    text_center(draw, "Foundation of frequency analysis attacks", H - 22, get_font(13), (150,150,170))

    img.save(os.path.join(OUT, 'cryptanalysis-letter-frequency-chart.png'))
    print("  Created: cryptanalysis-letter-frequency-chart.png")


# 2. Kasiski Examination
def make_kasiski():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(20)
    mono = get_font(14)
    note_font = get_font(13)

    text_center(draw, "Kasiski Examination — Finding Repeated Sequences", 15, title_font, GOLD)

    # Show ciphertext with highlighted repeats
    ct = "VHVSSPQUCEMRVBVBBBVHVSSP"
    y = 65
    draw.text((60, y), "Ciphertext:", font=get_bold_font(14), fill=LIGHT)
    x_start = 60
    y += 30
    for i, ch in enumerate(ct):
        color = RED if (0 <= i <= 5) or (18 <= i <= 23) else (120, 120, 140)
        if (0 <= i <= 5) or (18 <= i <= 23):
            draw.rectangle([x_start + i*28 - 2, y - 2, x_start + i*28 + 22, y + 22], fill=(80, 30, 30))
        draw.text((x_start + i * 28, y), ch, font=get_bold_font(18), fill=color if (0<=i<=5 or 18<=i<=23) else (180,180,190))

    # Arrows showing distance
    y_arrow = y + 35
    draw.line([(x_start + 3*28, y_arrow), (x_start + 21*28, y_arrow)], fill=GOLD, width=2)
    draw.polygon([(x_start + 3*28, y_arrow-5), (x_start + 3*28, y_arrow+5), (x_start + 3*28 - 8, y_arrow)], fill=GOLD)
    draw.polygon([(x_start + 21*28, y_arrow-5), (x_start + 21*28, y_arrow+5), (x_start + 21*28 + 8, y_arrow)], fill=GOLD)
    text_center(draw, "Distance = 18 positions", y_arrow - 7, get_font(12), GOLD)

    # Explanation steps
    steps = [
        ("Step 1:", "Find repeated ciphertext sequences", "VHVSSP appears at positions 1 and 19"),
        ("Step 2:", "Calculate distances between repeats", "Distance = 18 = 2 × 3 × 3"),
        ("Step 3:", "Factor the distances", "Likely key lengths: 2, 3, 6, 9, 18"),
        ("Step 4:", "Test each key length", "Use frequency analysis on each column"),
    ]

    y = 185
    for label, desc, detail in steps:
        draw_rounded_rect(draw, (50, y, W - 50, y + 60), DARK_CARD, 8)
        draw.text((70, y + 8), label, font=get_bold_font(14), fill=GOLD)
        draw.text((170, y + 8), desc, font=mono, fill=LIGHT)
        draw.text((170, y + 30), detail, font=get_font(12), fill=(150, 170, 190))
        y += 72

    text_center(draw, "Breaking Vigenère by finding key length through repeated patterns", H - 25, note_font, (150,150,170))
    img.save(os.path.join(OUT, 'cryptanalysis-kasiski-examination-vigenere-attack.png'))
    print("  Created: cryptanalysis-kasiski-examination-vigenere-attack.png")


# 3. Enigma Machine
def make_enigma_machine():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(22)
    label_font = get_bold_font(13)
    note_font = get_font(12)

    text_center(draw, "Enigma Machine", 15, title_font, GOLD)

    # Machine body
    draw_rounded_rect(draw, (200, 60, 600, 420), (50, 50, 65), 15)
    draw.rectangle([220, 80, 580, 180], fill=(60, 60, 75))

    # Rotors
    for i, label in enumerate(["Rotor I", "Rotor II", "Rotor III"]):
        cx = 300 + i * 100
        cy = 130
        draw.ellipse([cx-35, cy-35, cx+35, cy+35], outline=GOLD, width=2, fill=(45,45,60))
        draw.ellipse([cx-25, cy-25, cx+25, cy+25], outline=(150,150,160), width=1)
        draw.text((cx-25, cy-8), label, font=get_font(11), fill=GOLD)
        # Notch marks
        for angle in range(0, 360, 30):
            rad = math.radians(angle)
            draw.line([(cx + 30*math.cos(rad), cy + 30*math.sin(rad)),
                       (cx + 35*math.cos(rad), cy + 35*math.sin(rad))], fill=(120,120,140))

    # Plugboard
    draw.rectangle([240, 200, 560, 260], fill=(40, 40, 55))
    draw.text((250, 205), "Plugboard (Steckerbrett)", font=label_font, fill=LIGHT)
    for i in range(13):
        x = 260 + i * 22
        draw.ellipse([x, 230, x+12, 242], fill=(80, 80, 100), outline=(120,120,140))
        draw.ellipse([x, 245, x+12, 257], fill=(80, 80, 100), outline=(120,120,140))

    # Lampboard
    draw.rectangle([240, 270, 560, 320], fill=(35, 35, 50))
    draw.text((250, 275), "Lampboard", font=label_font, fill=LIGHT)
    letters_row = "QWERTZUIO"
    for i, ch in enumerate(letters_row):
        x = 260 + i * 30
        glow = GOLD if ch == 'T' else (60, 60, 70)
        draw.ellipse([x, 295, x+18, 313], fill=glow, outline=(120,120,140))
        draw.text((x+4, 297), ch, font=get_font(10), fill=BG if ch == 'T' else (100,100,110))

    # Keyboard
    draw.rectangle([240, 330, 560, 400], fill=(55, 55, 70))
    draw.text((250, 335), "Keyboard", font=label_font, fill=LIGHT)
    for i, ch in enumerate("QWERTZUIO"):
        x = 260 + i * 30
        draw_rounded_rect(draw, (x, 360, x+22, 390), (70,70,85), 3)
        draw.text((x+5, 365), ch, font=get_font(13), fill=LIGHT)

    # Reflector label
    draw.text((210, 430), "Reflector (Umkehrwalze)", font=note_font, fill=(150,150,170))
    draw.text((430, 430), "~158,962,555,217,826,360,000 settings", font=note_font, fill=(150,150,170))

    # Side labels
    draw.text((620, 100), "← Rotors", font=note_font, fill=GOLD)
    draw.text((620, 220), "← Plugboard", font=note_font, fill=GOLD)
    draw.text((620, 290), "← Lamps", font=note_font, fill=GOLD)
    draw.text((620, 360), "← Keys", font=note_font, fill=GOLD)

    text_center(draw, "German WWII electro-mechanical rotor cipher machine", H - 25, note_font, (150,150,170))
    img.save(os.path.join(OUT, 'mechanical-enigma-machine.png'))
    print("  Created: mechanical-enigma-machine.png")


# 4. Enigma Encryption Flow
def make_enigma_flow():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(20)
    label_font = get_bold_font(14)
    note_font = get_font(12)

    text_center(draw, "Enigma Encryption Signal Flow", 15, title_font, GOLD)

    components = [
        ("Key\nPress", 60),
        ("Plug-\nboard", 160),
        ("Rotor\nIII", 270),
        ("Rotor\nII", 350),
        ("Rotor\nI", 430),
        ("Reflec-\ntor", 520),
    ]

    cy = 180
    # Forward path
    for i, (label, x) in enumerate(components):
        color = GOLD if i == 5 else BLUE if 2 <= i <= 4 else CYAN
        draw_rounded_rect(draw, (x, cy-30, x+70, cy+30), DARK_CARD, 8)
        draw.rectangle([x, cy-30, x+70, cy+30], outline=color, width=2)
        lines = label.split('\n')
        for j, line in enumerate(lines):
            bbox = draw.textbbox((0,0), line, font=get_font(13))
            tw = bbox[2] - bbox[0]
            draw.text((x + (70-tw)//2, cy - 15 + j*18), line, font=get_font(13), fill=LIGHT)

    # Forward arrows
    arrow_y = cy
    pairs = [(130, 160), (230, 270), (340, 350), (420, 430), (500, 520)]
    for x1, x2 in pairs:
        draw.line([(x1, arrow_y), (x2, arrow_y)], fill=GREEN, width=2)
        draw.polygon([(x2, arrow_y), (x2-8, arrow_y-5), (x2-8, arrow_y+5)], fill=GREEN)

    draw.text((250, cy - 60), "→ Forward path →", font=label_font, fill=GREEN)

    # Return path
    ret_y = cy + 100
    draw.text((250, ret_y - 35), "← Return path ←", font=label_font, fill=RED)

    ret_components = [
        ("Lamp\nOutput", 60),
        ("Plug-\nboard", 160),
        ("Rotor\nIII", 270),
        ("Rotor\nII", 350),
        ("Rotor\nI", 430),
    ]

    for i, (label, x) in enumerate(ret_components):
        color = CYAN if i <= 1 else BLUE
        draw_rounded_rect(draw, (x, ret_y-30, x+70, ret_y+30), DARK_CARD, 8)
        draw.rectangle([x, ret_y-30, x+70, ret_y+30], outline=color, width=2)
        lines = label.split('\n')
        for j, line in enumerate(lines):
            bbox = draw.textbbox((0,0), line, font=get_font(13))
            tw = bbox[2] - bbox[0]
            draw.text((x + (70-tw)//2, ret_y - 15 + j*18), line, font=get_font(13), fill=LIGHT)

    ret_pairs = [(270, 230), (350, 340), (430, 420), (500, 500)]
    # Reflector to Rotor I return
    draw.line([(520+35, cy+30), (520+35, ret_y-50), (430+70, ret_y-50), (430+70, ret_y-30)], fill=RED, width=2)
    # Return arrows
    for x2, x1 in [(270, 228), (160, 228)]:
        pass
    ret_pairs2 = [(270, 160), (350, 270), (430, 350)]
    for x1, x2 in ret_pairs2:
        draw.line([(x2+70, ret_y), (x1, ret_y)], fill=RED, width=2)
        draw.polygon([(x2+70, ret_y), (x2+70+8, ret_y-5), (x2+70+8, ret_y+5)], fill=RED)
    draw.line([(160, ret_y), (130, ret_y)], fill=RED, width=2)
    draw.polygon([(130, ret_y), (138, ret_y-5), (138, ret_y+5)], fill=RED)

    # Example
    draw.text((60, 390), "Example:  A → Plugboard → Rotor III → II → I → Reflector → I → II → III → Plugboard → G", font=note_font, fill=(180,180,190))
    draw.text((60, 415), "Key property: A letter never encrypts to itself (exploited by Turing's Bombe)", font=note_font, fill=GOLD)

    text_center(draw, "Signal passes through each rotor twice — forward and back", H - 25, note_font, (150,150,170))
    img.save(os.path.join(OUT, 'mechanical-enigma-encryption-flow.png'))
    print("  Created: mechanical-enigma-encryption-flow.png")


# 5. Diffie-Hellman Key Exchange
def make_diffie_hellman():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(20)
    label_font = get_bold_font(14)
    note_font = get_font(12)
    val_font = get_font(13)

    text_center(draw, "Diffie-Hellman Key Exchange", 15, title_font, GOLD)

    # Two columns: Alice and Bob
    alice_x, bob_x = 80, 520
    mid_x = W // 2

    # Headers
    draw_rounded_rect(draw, (alice_x, 55, alice_x+180, 85), BLUE, 8)
    draw.text((alice_x+60, 60), "Alice", font=label_font, fill=LIGHT)
    draw_rounded_rect(draw, (bob_x, 55, bob_x+180, 85), GREEN, 8)
    draw.text((bob_x+65, 60), "Bob", font=label_font, fill=LIGHT)

    # Public values
    draw_rounded_rect(draw, (mid_x-100, 55, mid_x+100, 85), GOLD, 8)
    draw.text((mid_x-55, 60), "Public: p, g", font=label_font, fill=BG)

    steps = [
        (110, "Secret: a", "Secret: b"),
        (155, "A = g^a mod p", "B = g^b mod p"),
        (210, "Sends A →", "← Sends B"),
        (265, "s = B^a mod p", "s = A^b mod p"),
        (320, "= g^(ab) mod p", "= g^(ab) mod p"),
    ]

    for y, alice_text, bob_text in steps:
        draw_rounded_rect(draw, (alice_x, y, alice_x+180, y+35), DARK_CARD, 6)
        draw.text((alice_x+10, y+8), alice_text, font=val_font, fill=LIGHT)
        draw_rounded_rect(draw, (bob_x, y, bob_x+180, y+35), DARK_CARD, 6)
        draw.text((bob_x+10, y+8), bob_text, font=val_font, fill=LIGHT)

    # Arrows for exchange
    arrow_y = 227
    draw.line([(alice_x+180, arrow_y), (bob_x, arrow_y)], fill=GOLD, width=2)
    draw.polygon([(bob_x, arrow_y), (bob_x-10, arrow_y-5), (bob_x-10, arrow_y+5)], fill=GOLD)
    draw.polygon([(alice_x+180, arrow_y), (alice_x+190, arrow_y-5), (alice_x+190, arrow_y+5)], fill=GOLD)

    # Shared secret highlight
    draw_rounded_rect(draw, (mid_x-120, 375, mid_x+120, 415), (40, 80, 40), 10)
    draw.text((mid_x-105, 383), "Shared Secret: g^(ab) mod p", font=label_font, fill=GREEN)

    # Eavesdropper
    draw_rounded_rect(draw, (mid_x-90, 430, mid_x+90, 465), (80, 30, 30), 8)
    draw.text((mid_x-80, 438), "Eve sees: p, g, A, B", font=val_font, fill=RED)
    draw.text((mid_x-80, 468), "Cannot compute s (discrete log problem)", font=note_font, fill=(180,130,130))

    img.save(os.path.join(OUT, 'public-key-diffie-hellman-diagram.png'))
    print("  Created: public-key-diffie-hellman-diagram.png")


# 6. Vigenère Tabula Recta
def make_tabula_recta():
    img = Image.new('RGB', (W, H + 100), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(20)
    cell_font = get_font(11)
    header_font = get_bold_font(12)

    text_center(draw, "Vigenère Tabula Recta", 10, title_font, GOLD)

    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    cell = 18
    start_x, start_y = 80, 50

    # Column headers (plaintext)
    draw.text((start_x - 50, start_y - 5), "KEY↓", font=get_font(10), fill=GOLD)
    draw.text((start_x + 8*cell, start_y - 20), "PLAINTEXT →", font=get_font(10), fill=GOLD)

    for j, ch in enumerate(alphabet):
        x = start_x + j * cell
        draw.text((x + 3, start_y), ch, font=header_font, fill=GOLD)

    # Rows
    for i in range(26):
        y = start_y + (i + 1) * cell
        # Row header (key letter)
        draw.text((start_x - 20, y + 1), alphabet[i], font=header_font, fill=GOLD)
        for j in range(26):
            x = start_x + j * cell
            ch = alphabet[(i + j) % 26]
            # Highlight a sample: key=L, plaintext=H → cipher=S
            if i == 11 and j == 7:  # L row, H col
                draw.rectangle([x, y, x+cell, y+cell], fill=RED)
                draw.text((x+3, y+1), ch, font=cell_font, fill=LIGHT)
            elif i == 11:  # L row
                draw.rectangle([x, y, x+cell, y+cell], fill=(60, 40, 40))
                draw.text((x+3, y+1), ch, font=cell_font, fill=(200,160,160))
            elif j == 7:  # H column
                draw.rectangle([x, y, x+cell, y+cell], fill=(40, 40, 60))
                draw.text((x+3, y+1), ch, font=cell_font, fill=(160,160,200))
            else:
                shade = 40 + (i % 2) * 8
                draw.text((x+3, y+1), ch, font=cell_font, fill=(130 + shade, 130 + shade, 140 + shade))

    # Annotation
    note_y = start_y + 27 * cell + 15
    draw.text((80, note_y), "Example: Key letter L + Plaintext H = Ciphertext S", font=get_font(14), fill=GOLD)
    draw.text((80, note_y + 25), "Each row is a Caesar cipher shifted by the key letter's position", font=get_font(13), fill=(150,150,170))

    img.save(os.path.join(OUT, 'substitution-vigenere-tabula-recta.png'))
    print("  Created: substitution-vigenere-tabula-recta.png")


# 7. Columnar Transposition Grid
def make_columnar():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(20)
    cell_font = get_bold_font(18)
    label_font = get_font(13)

    text_center(draw, "Columnar Transposition Cipher", 15, title_font, GOLD)

    # Key
    key = "ZEBRAS"
    order = [6, 3, 2, 5, 1, 4]  # alphabetical order of ZEBRAS
    plaintext = "WEAREDISCOVEREDFL"

    draw.text((60, 55), "Key:", font=get_bold_font(15), fill=GOLD)
    draw.text((60, 80), "Plaintext: WE ARE DISCOVERED FLEE AT ONCE", font=label_font, fill=LIGHT)

    # Grid
    cols = len(key)
    rows = 3
    cell_w, cell_h = 55, 45
    grid_x = (W - cols * cell_w) // 2
    grid_y = 120

    # Key row
    colors = [RED, GREEN, BLUE, PURPLE, CYAN, GOLD]
    for j, (ch, num) in enumerate(zip(key, order)):
        x = grid_x + j * cell_w
        draw.rectangle([x, grid_y, x + cell_w, grid_y + cell_h], fill=DARK_CARD, outline=(80,80,100))
        draw.text((x + cell_w//2 - 8, grid_y + 5), ch, font=cell_font, fill=GOLD)
        draw.text((x + cell_w//2 - 4, grid_y + 28), str(num), font=get_font(12), fill=(150,150,170))

    # Plaintext grid
    pt_grid = [
        ['W','E','A','R','E','D'],
        ['I','S','C','O','V','E'],
        ['R','E','D','F','L','E'],
    ]

    for i, row in enumerate(pt_grid):
        for j, ch in enumerate(row):
            x = grid_x + j * cell_w
            y = grid_y + (i + 1) * cell_h
            bg = (45, 45, 60) if i % 2 == 0 else (40, 40, 55)
            draw.rectangle([x, y, x + cell_w, y + cell_h], fill=bg, outline=(70,70,90))
            draw.text((x + cell_w//2 - 6, y + 12), ch, font=cell_font, fill=LIGHT)

    # Reading order arrows
    arrow_y = grid_y + 4 * cell_h + 20
    draw.text((60, arrow_y), "Read columns in key alphabetical order:", font=get_bold_font(14), fill=GOLD)

    col_order_labels = [
        ("Col 5(A):", "EVL"),
        ("Col 3(B):", "ACD"),
        ("Col 2(E):", "ESE"),
        ("Col 6(R):", "DEE"),
        ("Col 4(S):", "ROF"),
        ("Col 1(Z):", "WIR"),
    ]

    y_off = arrow_y + 30
    for i, (label, text) in enumerate(col_order_labels):
        x = 60 + i * 120
        draw.text((x, y_off), label, font=get_font(12), fill=GOLD)
        draw.text((x, y_off + 18), text, font=get_bold_font(16), fill=LIGHT)

    # Result
    draw.text((60, y_off + 55), "Ciphertext: EVLACDESE DEEROFWIR", font=get_bold_font(15), fill=GREEN)
    text_center(draw, "Letters rearranged by column order — no substitution, only transposition", H - 25, label_font, (150,150,170))

    img.save(os.path.join(OUT, 'transposition-columnar-grid.png'))
    print("  Created: transposition-columnar-grid.png")


# 8. Rail Fence Diagram
def make_rail_fence():
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    title_font = get_bold_font(20)
    letter_font = get_bold_font(18)
    label_font = get_font(13)

    text_center(draw, "Rail Fence Cipher (3 Rails)", 15, title_font, GOLD)

    plaintext = "WEAREDISCOVERED"
    draw.text((60, 50), f"Plaintext: {plaintext}", font=get_bold_font(14), fill=LIGHT)
    draw.text((60, 75), "Key (rails): 3", font=get_font(13), fill=(150,150,170))

    # Rail fence pattern with 3 rails
    rail_colors = [RED, GREEN, BLUE]
    spacing_x = 45
    start_x = 60
    rail_y = [140, 230, 320]  # y positions for 3 rails

    # Rail labels
    for i in range(3):
        draw.text((15, rail_y[i] - 8), f"Rail {i+1}", font=get_font(11), fill=rail_colors[i])

    # Place letters on rails in zigzag
    positions = []
    rail = 0
    direction = 1
    for i, ch in enumerate(plaintext):
        x = start_x + i * spacing_x
        y = rail_y[rail]
        positions.append((x, y, ch, rail))
        # Direction
        if rail == 0:
            direction = 1
        elif rail == 2:
            direction = -1
        rail += direction

    # Draw zigzag lines
    for i in range(len(positions) - 1):
        x1, y1, _, r1 = positions[i]
        x2, y2, _, r2 = positions[i + 1]
        draw.line([(x1 + 8, y1 + 10), (x2 + 8, y2 + 10)], fill=(80, 80, 100), width=1)

    # Draw letters
    for x, y, ch, rail in positions:
        draw.ellipse([x - 4, y - 4, x + 22, y + 22], fill=DARK_CARD, outline=rail_colors[rail], width=2)
        draw.text((x + 3, y), ch, font=letter_font, fill=rail_colors[rail])

    # Result
    y_result = 375
    draw.text((60, y_result), "Read each rail:", font=get_bold_font(14), fill=GOLD)
    rail_texts = ["", "", ""]
    rail_idx = 0
    direction = 1
    for ch in plaintext:
        rail_texts[rail_idx] += ch
        if rail_idx == 0: direction = 1
        elif rail_idx == 2: direction = -1
        rail_idx += direction

    for i in range(3):
        draw.text((200, y_result + i * 25), f"Rail {i+1}: {rail_texts[i]}", font=get_bold_font(14), fill=rail_colors[i])

    draw.text((60, y_result + 85), f"Ciphertext: {''.join(rail_texts)}", font=get_bold_font(15), fill=GREEN)

    img.save(os.path.join(OUT, 'transposition-rail-fence-diagram.png'))
    print("  Created: transposition-rail-fence-diagram.png")


if __name__ == '__main__':
    print("Generating artifact images...")
    make_frequency_chart()
    make_kasiski()
    make_enigma_machine()
    make_enigma_flow()
    make_diffie_hellman()
    make_tabula_recta()
    make_columnar()
    make_rail_fence()
    print("Done! All 8 images generated.")
