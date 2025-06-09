# Script to clean up redundant CSS files
$filesToRemove = @(
    "styles\_forms.css",
    "styles\_variables.css",
    "styles\map.css",
    "styles\toast.css",
    "styles\modules\factions\factions.css"
)

foreach ($file in $filesToRemove) {
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $file
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Force
        Write-Host "Removed: $file"
    } else {
        Write-Host "Not found: $file"
    }
}

Write-Host "Cleanup complete!"
