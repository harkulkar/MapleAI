import glob

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)

# These are double-encoded UTF-8 characters that need text-level replacement
replacements = [
    ('\u00e2\u20ac\u201c', '-'),   # garbled en-dash  (â€") -> hyphen
    ('\u00e2\u20ac\u201d', '-'),   # garbled em-dash  (â€") -> hyphen  
    ('\u00e2\u20ac\u2122', "'"),   # garbled right single quote (â€™) -> apostrophe
    ('\u00e2\u20ac\u0153', '"'),   # garbled left double quote (â€œ) -> quote
    ('\u00e2\u20ac\u009d', '"'),   # garbled right double quote -> quote
    ('\u00e2\u201a\u00b9', ''),    # garbled rupee (â‚¹) -> remove
    ('\u00c2\u00b7', '\u00b7'),    # garbled middle-dot (Â·) -> proper ·
    ('\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u20ac\u0153', '-'),  # triple-encoded dash
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        text = fh.read()
    orig = text
    for bad, good in replacements:
        text = text.replace(bad, good)
    if text != orig:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(text)
        print('Fixed:', f)

print('Done.')
