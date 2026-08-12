$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Select-Object -ExpandProperty FullName
foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    $orig = $text

    # garbled rupee: â‚¹ (E2 82 B9 in latin-1 misread as C3 A2 E2 80 9A C2 B9)
    $text = $text -replace [char]0xe2 + [char]0x201a + [char]0xb9, ''

    # garbled en-dash: â€" (E2 80 93 misread)
    $text = $text -replace [char]0xe2 + [char]0x20ac + [char]0x201c, '-'

    # garbled nbsp+middle-dot: Â· (C2 B7 misread)
    $text = $text -replace [char]0xc2 + [char]0xb7, [char]0xb7

    if ($text -ne $orig) {
        $out = [System.Text.Encoding]::UTF8.GetBytes($text)
        [System.IO.File]::WriteAllBytes($f, $out)
        Write-Host "Fixed: $f"
    }
}
Write-Host "Done."
