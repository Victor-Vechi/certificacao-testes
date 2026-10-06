"""Renderiza saída ANSI de terminal em PNG.

Uso: render_terminal.py <saida.png> <titulo> < texto_ansi
"""
import re
import sys

from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
SIZE = 15
COLS = 130
PAD = 20
BAR = 34

BG = (30, 30, 36)
FG = (220, 220, 220)
PALETTE = {
    30: (40, 40, 40), 31: (240, 82, 79), 32: (92, 200, 92), 33: (229, 192, 82),
    34: (97, 150, 238), 35: (200, 120, 220), 36: (80, 200, 210), 37: (220, 220, 220),
    90: (128, 128, 128), 91: (255, 110, 103), 92: (95, 250, 104), 93: (255, 252, 103),
    94: (104, 113, 255), 95: (255, 119, 255), 96: (96, 253, 255), 97: (255, 255, 255),
}

ANSI = re.compile(r'\x1b\[([0-9;]*)m')


def parse(text):
    """Retorna linhas como listas de (texto, fg, bg, bold)."""
    lines, current = [], []
    fg, bg, bold, inverse = FG, None, False, False
    pos = 0
    for m in list(ANSI.finditer(text)) + [None]:
        chunk = text[pos:m.start()] if m else text[pos:]
        parts = chunk.split('\n')
        for i, part in enumerate(parts):
            if i > 0:
                lines.append(current)
                current = []
            if part:
                style = (bg or BG, fg) if inverse else (fg, bg)
                current.append((part.replace('\t', '    '), *style, bold))
        if not m:
            break
        pos = m.end()
        codes = [int(c) for c in m.group(1).split(';') if c] or [0]
        for c in codes:
            if c == 0:
                fg, bg, bold, inverse = FG, None, False, False
            elif c == 7:
                inverse = True
            elif c == 27:
                inverse = False
            elif c == 1:
                bold = True
            elif c == 22:
                bold = False
            elif c == 39:
                fg = FG
            elif c == 49:
                bg = None
            elif c in PALETTE:
                fg = PALETTE[c]
            elif 40 <= c <= 47:
                bg = PALETTE[c - 10]
            elif 100 <= c <= 107:
                bg = PALETTE[c - 10]
    lines.append(current)
    return lines


def wrap(lines):
    out = []
    for line in lines:
        row, width = [], 0
        for text, fg, bg, bold in line:
            while text:
                room = COLS - width
                piece, text = text[:room], text[room:]
                row.append((piece, fg, bg, bold))
                width += len(piece)
                if width >= COLS and text:
                    out.append(row)
                    row, width = [], 0
        out.append(row)
    while out and not out[-1]:
        out.pop()
    return out


def render(path, title, text):
    font = ImageFont.truetype(FONT, SIZE)
    bold_font = ImageFont.truetype(FONT_BOLD, SIZE)
    cw = font.getlength('M')
    lh = int(SIZE * 1.45)
    rows = wrap(parse(text))
    w = int(cw * COLS + PAD * 2)
    h = BAR + PAD * 2 + lh * len(rows)

    img = Image.new('RGB', (w, h), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, BAR], fill=(52, 52, 60))
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        x = 16 + i * 22
        d.ellipse([x, 11, x + 12, 23], fill=color)
    tw = font.getlength(title)
    d.text(((w - tw) / 2, 8), title, font=font, fill=(200, 200, 200))

    y = BAR + PAD
    for row in rows:
        x = PAD
        for piece, fg, bg, bold in row:
            pw = cw * len(piece)
            if bg:
                d.rectangle([x, y - 2, x + pw, y + lh - 4], fill=bg)
            d.text((x, y), piece, font=bold_font if bold else font, fill=fg)
            x += pw
        y += lh
    img.save(path)


if __name__ == '__main__':
    render(sys.argv[1], sys.argv[2], sys.stdin.read())
