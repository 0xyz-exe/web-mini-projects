#!/usr/bin/env pwsh

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Web Mini Projects - Quality Check" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$projectCount = 0
$errors = @()

# Check if we're in the right directory
if (-not (Test-Path "README.md") -or -not (Test-Path "projects")) {
    Write-Host "❌ Error: Run this script from the web-mini-projects root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found project root" -ForegroundColor Green
Write-Host ""

# Check each required project
$requiredProjects = @(
    "01-portfolio",
    "02-task-manager",
    "03-expense-tracker",
    "04-weather-dashboard",
    "05-quiz-app",
    "06-markdown-editor",
    "07-password-generator",
    "08-pomodoro-timer",
    "09-notes-app",
    "10-image-gallery",
    "11-calculator",
    "12-typing-test",
    "13-github-explorer",
    "14-kanban-board",
    "15-json-formatter"
)

Write-Host "Checking 15 required projects..." -ForegroundColor Yellow
Write-Host ""

foreach ($project in $requiredProjects) {
    $path = "projects/$project"
    
    if (-not (Test-Path $path)) {
        $errors += "Missing project: $project"
        Write-Host "  ❌ $project - NOT FOUND" -ForegroundColor Red
        continue
    }
    
    $hasHTML = Test-Path "$path/index.html"
    $hasCSS = (Test-Path "$path/style.css") -or (Get-ChildItem "$path/*.css" -ErrorAction SilentlyContinue).Count -gt 0
    $hasJS = (Test-Path "$path/script.js") -or (Get-ChildItem "$path/*.js" -ErrorAction SilentlyContinue).Count -gt 0
    $hasReadme = Test-Path "$path/README.md"
    
    if ($hasHTML -and $hasCSS -and $hasJS -and $hasReadme) {
        Write-Host "  ✓ $project" -ForegroundColor Green
        $projectCount++
    } else {
        $missing = @()
        if (-not $hasHTML) { $missing += "HTML" }
        if (-not $hasCSS) { $missing += "CSS" }
        if (-not $hasJS) { $missing += "JS" }
        if (-not $hasReadme) { $missing += "README" }
        
        $errors += "$project missing: $($missing -join ', ')"
        Write-Host "  ⚠ $project - Missing: $($missing -join ', ')" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Found $projectCount / 15 complete projects" -ForegroundColor Cyan
Write-Host ""

# Check root files
Write-Host "Checking root files..." -ForegroundColor Yellow
$rootFiles = @("index.html", "README.md", "LICENSE", ".gitignore")

foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "Missing root file: $file"
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

Write-Host ""

# Check Node.js availability for JS syntax validation
$nodeAvailable = Get-Command node -ErrorAction SilentlyContinue

if ($nodeAvailable) {
    Write-Host "Validating JavaScript syntax..." -ForegroundColor Yellow
    $jsFiles = Get-ChildItem -Path "projects" -Filter "*.js" -Recurse
    $jsErrors = 0
    
    foreach ($jsFile in $jsFiles) {
        $result = node --check $jsFile.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            $jsErrors++
            Write-Host "  ❌ $($jsFile.Name): $result" -ForegroundColor Red
        }
    }
    
    if ($jsErrors -eq 0) {
        Write-Host "  ✓ All JavaScript files valid" -ForegroundColor Green
    } else {
        $errors += "JavaScript syntax errors: $jsErrors files"
    }
} else {
    Write-Host "  ⚠ Node.js not found - skipping JS syntax check" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "   $projectCount projects complete" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Found $($errors.Count) issue(s):" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
    exit 1
}
