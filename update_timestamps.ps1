$extensions = @(".ts", ".tsx", ".js", ".jsx", ".sol", ".css", ".scss", ".md", ".html", ".json")
Get-ChildItem -Path . -Recurse -File | Where-Object { 
    $_.Extension -in $extensions -and 
    $_.FullName -notmatch "\\node_modules\\" -and 
    $_.FullName -notmatch "\\.git\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\build\\" -and
    $_.FullName -notmatch "\\.next\\"
} | ForEach-Object {
    try {
        Add-Content -Path $_.FullName -Value " " -NoNewline
        Write-Host "Updated $($_.FullName)"
    } catch {
        Write-Host "Failed to update $($_.FullName): $_"
    }
}
