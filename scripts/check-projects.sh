#!/usr/bin/env bash

echo "=================================="
echo "Web Mini Projects - Quality Check"
echo "=================================="
echo ""

project_count=0
errors=()

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "projects" ]]; then
    echo "❌ Error: Run this script from the web-mini-projects root directory"
    exit 1
fi

echo "✓ Found project root"
echo ""

# Check each required project
required_projects=(
    "01-portfolio"
    "02-task-manager"
    "03-expense-tracker"
    "04-weather-dashboard"
    "05-quiz-app"
    "06-markdown-editor"
    "07-password-generator"
    "08-pomodoro-timer"
    "09-notes-app"
    "10-image-gallery"
    "11-calculator"
    "12-typing-test"
    "13-github-explorer"
    "14-kanban-board"
    "15-json-formatter"
)

echo "Checking 15 required projects..."
echo ""

for project in "${required_projects[@]}"; do
    path="projects/$project"
    
    if [[ ! -d "$path" ]]; then
        errors+=("Missing project: $project")
        echo "  ❌ $project - NOT FOUND"
        continue
    fi
    
    has_html=false
    has_css=false
    has_js=false
    has_readme=false
    
    [[ -f "$path/index.html" ]] && has_html=true
    [[ -f "$path/style.css" ]] || [[ -n "$(find "$path" -maxdepth 1 -name '*.css' 2>/dev/null)" ]] && has_css=true
    [[ -f "$path/script.js" ]] || [[ -n "$(find "$path" -maxdepth 1 -name '*.js' 2>/dev/null)" ]] && has_js=true
    [[ -f "$path/README.md" ]] && has_readme=true
    
    if [[ "$has_html" == true ]] && [[ "$has_css" == true ]] && [[ "$has_js" == true ]] && [[ "$has_readme" == true ]]; then
        echo "  ✓ $project"
        ((project_count++))
    else
        missing=()
        [[ "$has_html" == false ]] && missing+=("HTML")
        [[ "$has_css" == false ]] && missing+=("CSS")
        [[ "$has_js" == false ]] && missing+=("JS")
        [[ "$has_readme" == false ]] && missing+=("README")
        
        errors+=("$project missing: ${missing[*]}")
        echo "  ⚠ $project - Missing: ${missing[*]}"
    fi
done

echo ""
echo "Found $project_count / 15 complete projects"
echo ""

# Check root files
echo "Checking root files..."
root_files=("index.html" "README.md" "LICENSE" ".gitignore")

for file in "${root_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  ✓ $file"
    else
        errors+=("Missing root file: $file")
        echo "  ❌ $file"
    fi
done

echo ""

# Check Node.js availability for JS syntax validation
if command -v node &> /dev/null; then
    echo "Validating JavaScript syntax..."
    js_errors=0
    
    while IFS= read -r -d '' jsfile; do
        if ! node --check "$jsfile" 2>/dev/null; then
            ((js_errors++))
            echo "  ❌ $(basename "$jsfile")"
        fi
    done < <(find projects -name "*.js" -type f -print0)
    
    if [[ $js_errors -eq 0 ]]; then
        echo "  ✓ All JavaScript files valid"
    else
        errors+=("JavaScript syntax errors: $js_errors files")
    fi
else
    echo "  ⚠ Node.js not found - skipping JS syntax check"
fi

echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="

if [[ ${#errors[@]} -eq 0 ]]; then
    echo "✅ All checks passed!"
    echo "   $project_count projects complete"
    exit 0
else
    echo "❌ Found ${#errors[@]} issue(s):"
    for error in "${errors[@]}"; do
        echo "   - $error"
    done
    exit 1
fi
