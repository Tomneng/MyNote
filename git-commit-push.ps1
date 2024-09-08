param (
    [string]$CommitMessage
)

if (-not $CommitMessage) {
    Write-Host "Usage: .\git-commit-push.ps1 -CommitMessage <commit-message>"
    exit 1
}

# Git add
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to add files."
    exit 1
}

# Git commit
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to commit changes."
    exit 1
}

# Git push
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push changes."
    exit 1
}

Write-Host "Changes pushed successfully."
