# Create archive directory
New-Item -ItemType Directory -Force -Path "archive"

# Move old frontend root files
$uiFiles = @("index.html", "index.css", "index.js", "start_backend.bat")
foreach ($file in $uiFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "archive\" -Force
        Write-Host "Moved $file to archive/"
    }
}

# Move old Flask backend
if (Test-Path "backend\app.py") {
    Move-Item -Path "backend\app.py" -Destination "archive\" -Force
    Write-Host "Moved backend\app.py to archive/"
}

Write-Host "`nCleanup Complete! Legacy files have been moved to the archive/ folder."
Write-Host "Your new directory structure is clean and ready to go."
