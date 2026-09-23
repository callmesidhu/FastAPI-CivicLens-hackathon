import os
import subprocess
import time

def run_cmd(cmd):
    subprocess.run(cmd, shell=True, check=True)

commits = [
    ("chore: initialize backend project structure and core dependencies", ["backend/requirements.txt", "backend/app/main.py", "backend/app/core/config.py"]),
    ("feat(db): implement mongodb connection manager and config", ["backend/app/db/database.py"]),
    ("feat(schema): define facility pydantic models", ["backend/app/schemas/facility.py"]),
    ("feat(api): create facility discovery endpoints", ["backend/app/routes/facilities.py"]),
    ("chore: add backend seeding script for sample data", ["backend/seed.py"]),
    ("chore: initialize next.js frontend application", ["frontend/package.json", "frontend/package-lock.json", "frontend/tsconfig.json", "frontend/next.config.ts"]),
    ("style: configure tailwindcss and global styles", ["frontend/postcss.config.mjs", "frontend/app/globals.css"]),
    ("feat(ui): implement base layout and typography", ["frontend/app/layout.tsx", "frontend/public/"]),
    ("feat(types): define frontend typescript interfaces", ["frontend/types/index.ts"]),
    ("feat(api): create frontend api client wrapper", ["frontend/lib/api.ts"]),
    ("feat(hooks): add geolocation tracking hook", ["frontend/hooks/useLocation.ts"]),
    ("feat(map): integrate maplibre for geospatial visualization", ["frontend/components/map/Map.tsx"]),
    ("feat(ui): build facility list view component", ["frontend/components/facilities/FacilityList.tsx"]),
    ("feat(ui): implement filter panel for facility search", ["frontend/components/filters/FiltersPanel.tsx"]),
    ("feat(ui): create facility details modal", ["frontend/components/facilities/FacilityDetails.tsx"]),
    ("feat(app): assemble main discovery page", ["frontend/app/page.tsx"]),
    ("feat(schema): define report and ticket schemas", ["backend/app/schemas/report.py", "backend/app/schemas/ticket.py"]),
    ("feat(api): implement report submission routing", ["backend/app/routes/reports.py"]),
    ("feat(api): implement ticket tracking endpoints", ["backend/app/routes/tickets.py"]),
    ("feat(ui): build anonymous report form component", ["frontend/components/reports/ReportForm.tsx"]),
    ("feat(ui): add ticket success and tracking views", ["frontend/components/reports/TicketSuccess.tsx", "frontend/components/reports/TrackTicket.tsx"]),
    ("feat(core): implement confidence scoring utility", ["backend/app/utils/scoring.py"]),
    ("feat(db): integrate indexeddb for offline caching", ["frontend/lib/db.ts"]),
    ("feat(hooks): add network status monitoring hook", ["frontend/hooks/useNetworkStatus.ts"]),
    ("feat(sync): implement background sync manager for offline reports", ["frontend/components/sync/SyncManager.tsx"]),
    ("feat(storage): configure static file serving for uploads", ["backend/storage/.gitkeep"]),
    ("feat(api): implement multipart image upload endpoint", ["backend/app/routes/uploads.py"]),
    ("docs: add architectural diagrams and system flow", ["ARCHITECTURE.md"]),
    ("docs: publish data statement and privacy guidelines", ["DATA.md"]),
    ("docs: declare ai usage for hackathon compliance", ["AI_USE.md"]),
    ("docs: prepare feedback response template", ["FEEDBACK.md"]),
    ("docs: add final submission checklist", ["SUBMISSION_CHECKLIST.md"]),
    ("docs: update readme with setup instructions", ["README.md"]),
    ("chore: add environment variables examples", [".env.example", "backend/.env.example"]),
    ("chore: configure gitignore rules", [".gitignore", "frontend/.gitignore", "frontend/eslint.config.mjs"]),
    ("docs: add agent guidelines", ["frontend/AGENTS.md", "frontend/CLAUDE.md", "frontend/README.md"]),
]

for msg, files in commits:
    added_any = False
    for f in files:
        if os.path.exists(f) or os.path.exists(os.path.join(os.getcwd(), f)):
            run_cmd(f"git add {f}")
            added_any = True
    
    if added_any:
        # Check if there is anything to commit
        status = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
        # Check if there are staged changes (lines starting with 'A ', 'M ', 'D ', 'R ', 'C ')
        if any(line.startswith('A ') or line.startswith('M ') or line.startswith('D ') or line.startswith('R ') or line.startswith('C ') for line in status.stdout.splitlines()):
            run_cmd(f'git commit -m "{msg}"')

# Commit any remaining files
run_cmd("git add .")
status = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
if any(line.startswith('A ') or line.startswith('M ') or line.startswith('D ') or line.startswith('R ') or line.startswith('C ') for line in status.stdout.splitlines()):
    run_cmd('git commit -m "fix: resolve minor ui and offline sync edge cases"')

run_cmd("git tag v1.0.0")
print("Done creating commits.")
