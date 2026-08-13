import glob

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)

replacements = {
    "NCR Eastern Peripheral Expressway": "PPE Expressway",
    "Shree Jagannath Expressways": "JPP Expressway"
}

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for old_str, new_str in replacements.items():
        content = content.replace(old_str, new_str)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
