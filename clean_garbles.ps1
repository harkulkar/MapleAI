Get-ChildItem -Path 'd:\\MapleAI\\src' -Recurse -Include *.tsx,*.ts,*.js,*.jsx -File | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    $c = $c -replace 'â‚¹','₹' -replace 'Â·','·' -replace 'Â°','°' -replace 'â¬¤','•'
    Set-Content $_.FullName $c -Encoding UTF8
}
