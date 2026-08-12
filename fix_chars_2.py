import glob

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)

# These are double-encoded UTF-8 characters that need text-level replacement
replacements = [
    ('\u00e2\u20ac\u00a2', '•'),   # garbled bullet point (â€¢) -> bullet
    ('\u00c2\u00b0', '°'),         # garbled degree (Â°) -> degree
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
